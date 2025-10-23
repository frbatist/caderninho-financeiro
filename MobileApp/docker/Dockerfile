# Servidor de Updates APK - Caderninho Financeiro
# Hospeda APKs e permite download/atualização do app mobile

FROM nginx:alpine

# Criar diretórios
RUN mkdir -p /usr/share/nginx/html/apk && \
    mkdir -p /usr/share/nginx/html/updates

# Configurar NGINX para servir arquivos
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Página HTML de download
COPY index.html /usr/share/nginx/html/

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
