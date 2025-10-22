# React Native Mobile App - Caderninho Financeiro

## Visão Geral
Aplicativo móvel React Native com Expo para gerenciamento financeiro pessoal, consumindo a API .NET do Caderninho Financeiro.

## Tecnologias
- **React Native**: Framework para desenvolvimento mobile
- **Expo**: Plataforma para facilitar o desenvolvimento
- **TypeScript**: Tipagem estática
- **React Navigation**: Navegação entre telas
- **Axios**: Cliente HTTP para consumir a API

## Estrutura do Projeto
```
src/
├── screens/        # Telas do aplicativo
├── components/     # Componentes reutilizáveis
├── services/       # Serviços para chamadas à API
├── navigation/     # Configuração de navegação
├── types/          # Tipos TypeScript
└── constants/      # Constantes e configurações
```

## Convenções
- **Componentes**: PascalCase (ex: `HomeScreen`, `TransactionCard`)
- **Arquivos**: PascalCase para componentes, camelCase para utilitários
- **Funções**: camelCase (ex: `fetchTransactions`, `handleSubmit`)
- **Constantes**: UPPER_CASE (ex: `API_BASE_URL`)
- **Idioma UI**: Português brasileiro

## Status do Projeto
✅ Estrutura base criada
⏳ Em desenvolvimento
