# Caderninho Financeiro - Mobile App

Aplicativo mobile desenvolvido com React Native e Expo para controle financeiro pessoal.

## 🚀 Tecnologias

- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma para desenvolvimento e build
- **TypeScript**: Tipagem estática
- **React Navigation**: Navegação entre telas
- **Axios**: Cliente HTTP para comunicação com a API

## 📋 Pré-requisitos

- **Node.js**: v16 ou superior
- **npm** ou **yarn**
- **Expo Go** (app no celular) ou emulador Android/iOS

## 🔧 Instalação

1. **Instale as dependências**:
   ```bash
   npm install
   # ou
   yarn install
   ```

2. **Configure a URL da API**:
   - Abra o arquivo `src/constants/api.ts`
   - Altere a constante `API_BASE_URL` com o endereço da sua API:
   ```typescript
   // Para desenvolvimento local (computador e celular na mesma rede)
   export const API_BASE_URL = 'http://SEU_IP:5054/api';
   
   // Exemplo:
   export const API_BASE_URL = 'http://192.168.1.100:5054/api';
   ```

   ⚠️ **IMPORTANTE**: 
   - Não use `localhost` se estiver testando no celular
   - Use o IP real da sua máquina na rede local
   - Descubra seu IP com `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)

## ▶️ Executando o Projeto

### Opção 1: Expo Go (Mais Fácil)

1. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm start
   # ou
   yarn start
   # ou
   npx expo start
   ```

2. **Abra no dispositivo**:
   - Instale o **Expo Go** no seu celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
   - Escaneie o QR code que aparece no terminal
   - O app será carregado automaticamente

### Opção 2: Emulador Android

1. **Inicie o Android Studio** e abra um emulador

2. **Execute o comando**:
   ```bash
   npm run android
   # ou
   yarn android
   # ou
   npx expo start --android
   ```

### Opção 3: Emulador iOS (somente macOS)

1. **Inicie o Xcode Simulator**

2. **Execute o comando**:
   ```bash
   npm run ios
   # ou
   yarn ios
   # ou
   npx expo start --ios
   ```

### Opção 4: Web (para testes rápidos)

```bash
npm run web
# ou
yarn web
# ou
npx expo start --web
```

## 📱 Primeiro Uso

1. **Inicie a API backend** (.NET)
   - Certifique-se de que a API está rodando em `http://localhost:5054` (ou outra porta configurada)

2. **Crie pelo menos um usuário** no backend
   - Use o Swagger em `http://localhost:5054/swagger`
   - Endpoint: `POST /api/users`
   - Exemplo:
   ```json
   {
     "name": "Seu Nome",
     "email": "seu@email.com"
   }
   ```

3. **Abra o app mobile**
   - Na primeira vez, você verá a tela de seleção de usuário
   - Selecione o usuário criado
   - O usuário ficará salvo no dispositivo

## 🗂️ Estrutura do Projeto

```
MobileApp/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   ├── constants/           # Constantes e configurações
│   │   └── api.ts          # URL da API
│   ├── navigation/          # Configuração de navegação
│   │   ├── index.tsx       # Navigator principal
│   │   └── types.ts        # Tipos de navegação
│   ├── screens/            # Telas do aplicativo
│   │   ├── UserSelectionScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── AddExpenseScreen.tsx
│   │   ├── ExpensesScreen.tsx
│   │   ├── MonthlyEntriesScreen.tsx
│   │   ├── MonthlySpendingLimitsScreen.tsx
│   │   └── MonthlyStatementScreen.tsx
│   ├── services/           # Serviços e integração com API
│   │   ├── apiService.ts           # Cliente HTTP base
│   │   ├── caderninhoApiService.ts # Endpoints da API
│   │   └── userStorageService.ts   # Gerenciamento de usuário
│   └── types/              # Tipos TypeScript
├── App.tsx                 # Componente raiz
├── index.ts               # Entry point
├── package.json           # Dependências
└── tsconfig.json         # Configuração TypeScript
```

## 🎯 Funcionalidades

- ✅ **Seleção de Usuário**: Escolha o usuário ao abrir o app
- ✅ **Despesas**: Cadastro e listagem de despesas
- ✅ **Entradas Mensais**: Receitas/Despesas recorrentes
- ✅ **Limites de Gasto**: Defina limites por categoria
- ✅ **Extrato Mensal**: Visualize suas despesas agrupadas

## 🐛 Troubleshooting

### Timeout nas requisições

Se as requisições estão sendo canceladas durante debug:

1. O timeout padrão está configurado para **60 segundos** em `src/constants/api.ts`
2. Para aumentar ainda mais (útil para debug com breakpoints):
   ```typescript
   // Em src/constants/api.ts
   export const API_TIMEOUT = 120000; // 2 minutos
   ```
3. Reinicie o app após alterar o timeout

### Erro de conexão com a API

1. Verifique se a API está rodando
2. Confirme que o IP está correto em `src/constants/api.ts`
3. Teste a API no navegador: `http://SEU_IP:5054/swagger`
4. Certifique-se de que o celular e o computador estão na mesma rede Wi-Fi

### App não carrega no Expo Go

1. Limpe o cache:
   ```bash
   npx expo start -c
   ```

2. Reinstale as dependências:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Erro de TypeScript

1. Reinicie o servidor TypeScript no VS Code:
   - Abra qualquer arquivo `.ts` ou `.tsx`
   - Pressione `Ctrl+Shift+P` (Windows) ou `Cmd+Shift+P` (Mac)
   - Digite "TypeScript: Restart TS Server"

## 📝 Scripts Disponíveis

```bash
npm start          # Inicia o servidor de desenvolvimento
npm run android    # Executa no emulador Android
npm run ios        # Executa no emulador iOS (somente macOS)
npm run web        # Executa no navegador
```

## 🔄 Atualizar após alterações na API

Se você fez alterações no backend (novos campos, endpoints, etc.):

1. Atualize os tipos em `src/services/caderninhoApiService.ts`
2. Adicione novos endpoints em `src/constants/api.ts`
3. Reinicie o app mobile

## 📚 Documentação

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnavigation.org/)
- [React Navigation](https://reactnavigation.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🤝 Contribuindo

1. Faça alterações no código
2. Teste localmente
3. Commit e push para o repositório

## 📄 Licença

Este projeto é para uso pessoal.

---

**Desenvolvido com ❤️ usando React Native + Expo**
