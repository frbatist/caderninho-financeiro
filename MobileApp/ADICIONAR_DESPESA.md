# Tela de Adicionar Despesa

## Funcionalidades Implementadas

### ✅ Campos do Formulário

1. **Descrição** (obrigatório)
   - Campo de texto livre
   - Validação: não pode estar vazio

2. **Valor** (obrigatório)
   - Campo numérico com formatação de moeda
   - Validação: deve ser maior que zero
   - Aceita vírgula e ponto como separador decimal

3. **Tipo de Pagamento** (obrigatório)
   - Grid de seleção visual com ícones
   - Opções disponíveis:
     - 💳 Cartão de Crédito (requer cartão)
     - 💳 Cartão de Débito (requer cartão)
     - 💵 Dinheiro
     - 📱 PIX
     - 🏦 Depósito
     - 🧾 Boleto

4. **Estabelecimento** (obrigatório)
   - Dropdown com busca e paginação
   - Integrado com `EstablishmentDropdown`
   - Permite adicionar novo estabelecimento via modal

5. **Cartão** (condicional)
   - **Visível apenas quando tipo de pagamento é Cartão de Crédito ou Débito**
   - Dropdown com busca e paginação
   - Integrado com `CardDropdown`
   - Permite adicionar novo cartão via modal

6. **Número de Parcelas** (condicional)
   - **Visível apenas quando tipo de pagamento é Cartão de Crédito**
   - Campo numérico
   - Validação: entre 1 e 60 parcelas
   - Padrão: 1 parcela

### 🔄 Comportamento Dinâmico

#### Lógica de Visibilidade do Cartão
```typescript
// Cartão é visível e obrigatório apenas para:
- PaymentType.CreditCard
- PaymentType.DebitCard

// Para outros tipos (Dinheiro, PIX, Depósito, Boleto):
- Campo cartão fica oculto
- Validação de cartão não é aplicada
```

#### Lógica de Parcelas
```typescript
// Parcelas é visível apenas para:
- PaymentType.CreditCard

// Para outros tipos:
- Campo parcelas fica oculto
- Valor padrão: 1 parcela
```

### 🎯 Integração com Modais

#### Adicionar Novo Estabelecimento
1. Usuário clica em "Adicionar Novo" no `EstablishmentDropdown`
2. Modal `AddEstablishmentModal` é aberto
3. Usuário preenche nome e seleciona tipo
4. Após salvar com sucesso:
   - Modal fecha automaticamente
   - Novo estabelecimento é selecionado no dropdown
   - Lista de estabelecimentos é atualizada

#### Adicionar Novo Cartão
1. Usuário clica em "Adicionar Novo" no `CardDropdown`
2. Modal `AddCardModal` é aberto
3. Usuário preenche nome, tipo, bandeira e últimos 4 dígitos
4. Após salvar com sucesso:
   - Modal fecha automaticamente
   - Novo cartão é selecionado no dropdown
   - Lista de cartões é atualizada

### ✔️ Validações

```typescript
// Validações aplicadas antes de submeter:
{
  description: 'Descrição é obrigatória',
  amount: 'Valor deve ser maior que zero',
  establishment: 'Estabelecimento é obrigatório',
  card: 'Cartão é obrigatório para este tipo de pagamento', // apenas se requiresCard
  installmentCount: 'Parcelas devem estar entre 1 e 60'
}
```

### 📡 Integração com API

#### Endpoint Utilizado
```
POST /api/expenses
```

#### Payload Enviado
```typescript
{
  description: string;
  establishmentId: number;
  paymentType: PaymentType; // 1-6
  cardId?: number; // opcional, presente apenas se tipo requer cartão
  amount: number; // valor decimal
  installmentCount: number; // padrão: 1
}
```

### 🔄 Fluxo de Navegação

1. **ExpensesScreen** → Botão "Adicionar Despesa"
2. **AddExpenseScreen** → Formulário completo
3. Após salvar com sucesso:
   - Alert de confirmação
   - Retorna para ExpensesScreen
   - Lista é recarregada automaticamente via `useFocusEffect`

### 🎨 UI/UX

#### Estados Visuais
- **Normal**: Campos brancos com borda cinza clara
- **Erro**: Campos com borda vermelha + mensagem de erro
- **Loading**: Botão salvar mostra ActivityIndicator
- **Disabled**: Campos desabilitados durante loading

#### Layout Responsivo
- Grid 2 colunas para tipos de pagamento
- Scroll vertical para campos longos
- Botões fixos na parte inferior (Cancelar | Salvar)

### 📱 Componentes Reutilizados

```typescript
import { EstablishmentDropdown, CardDropdown } from '../components';
```

- `EstablishmentDropdown`: Dropdown de estabelecimentos com modal integrado
- `CardDropdown`: Dropdown de cartões com modal integrado

### 🔧 Arquivos Atualizados

1. **Criado**: `MobileApp/src/screens/AddExpenseScreen.tsx`
   - Tela completa de adicionar despesa

2. **Atualizado**: `MobileApp/src/navigation/index.tsx`
   - Adicionada rota `AddExpense`

3. **Atualizado**: `MobileApp/src/screens/ExpensesScreen.tsx`
   - Navegação para tela de adicionar
   - `useFocusEffect` para recarregar lista

4. **Atualizado**: `MobileApp/src/services/caderninhoApiService.ts`
   - Adicionado `PaymentType` enum
   - Atualizado `Expense` interface
   - Atualizado `CreateExpenseDto` interface

### 🧪 Testes Sugeridos

#### Cenários de Teste
1. ✅ Criar despesa com cartão de crédito
2. ✅ Criar despesa com cartão de débito
3. ✅ Criar despesa com PIX (sem cartão)
4. ✅ Criar despesa com parcelas (cartão crédito)
5. ✅ Validar campos obrigatórios vazios
6. ✅ Validar valor inválido (zero, negativo, texto)
7. ✅ Adicionar novo estabelecimento via modal
8. ✅ Adicionar novo cartão via modal
9. ✅ Cancelar formulário
10. ✅ Verificar recarga automática da lista

### 📋 Próximos Passos

- [ ] Implementar edição de despesa
- [ ] Adicionar campo de data personalizada
- [ ] Implementar observações/notas na despesa
- [ ] Adicionar upload de foto do recibo
- [ ] Implementar filtro por tipo de pagamento na lista
- [ ] Adicionar estatísticas por tipo de pagamento

### 🐛 Possíveis Melhorias

1. **Validação em Tempo Real**: Validar campos enquanto o usuário digita
2. **Máscara de Valor**: Aplicar máscara automática de moeda (R$ 0,00)
3. **Histórico de Estabelecimentos**: Sugerir estabelecimentos mais usados
4. **Parcelas Sugeridas**: Sugerir parcelamento baseado no valor
5. **Confirmação de Cancelamento**: Avisar se há dados preenchidos ao cancelar

