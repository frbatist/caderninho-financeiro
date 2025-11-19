# Dockerfile otimizado para Raspberry Pi 3 (ARM64)
# Usa imagens Alpine Linux para menor tamanho
# Raspberry Pi 3 tem CPU 64-bit (ARMv8) - melhor performance com ARM64

# Estágio 1: Build e Publish
# BUILDPLATFORM = plataforma host (x64), TARGETPLATFORM = plataforma destino (arm64)
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
ARG TARGETARCH
WORKDIR /src

# Copiar arquivo de projeto e restaurar dependências
COPY ["CaderninhoApi/CaderninhoApi.csproj", "CaderninhoApi/"]
RUN dotnet restore "CaderninhoApi/CaderninhoApi.csproj" -a $TARGETARCH

# Copiar código fonte e publicar diretamente (cross-compilation nativa do .NET)
COPY . .
WORKDIR "/src/CaderninhoApi"
RUN dotnet publish "CaderninhoApi.csproj" \
    -c Release \
    -a $TARGETARCH \
    -o /app/publish \
    --no-restore \
    /p:PublishReadyToRun=false

# Estágio 3: Runtime (imagem final - mais leve)
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine-arm64v8 AS final
WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -s /bin/sh -D appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app

# Instalar dependências necessárias para SQLite
RUN apk add --no-cache icu-libs

# Configurar timezone (opcional)
RUN apk add --no-cache tzdata
ENV TZ=America/Sao_Paulo

# Copiar arquivos publicados
COPY --from=build --chown=appuser:appuser /app/publish .

# Criar diretório para o banco de dados SQLite
VOLUME ["/app/data"]

# Mudar para usuário não-root
USER appuser

# Expor porta
EXPOSE 8080

# Configurar variáveis de ambiente
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Comando de inicialização
ENTRYPOINT ["dotnet", "CaderninhoApi.dll"]
