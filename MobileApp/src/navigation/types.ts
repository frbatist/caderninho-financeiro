/**
 * Tipos de navegação
 * Define os parâmetros de cada tela da aplicação
 */

export type RootStackParamList = {
  UserSelection: undefined;
  Home: undefined;
  Expenses: undefined;
  ExpenseDetail: { expenseId: number };
  AddExpense: undefined;
  MonthlyEntries: undefined;
  AddMonthlyEntry: undefined;
  MonthlySpendingLimits: undefined;
  AddMonthlySpendingLimit: undefined;
  MonthlyStatement: undefined;
  Transactions: undefined;
  TransactionDetail: { transactionId: number };
  AddTransaction: undefined;
  Accounts: undefined;
  Cards: undefined;
  Categories: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
