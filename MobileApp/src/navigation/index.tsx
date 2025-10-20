/**
 * Configuração de navegação da aplicação
 * Stack Navigator para navegação entre telas
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Import das telas (vamos criar a seguir)
import HomeScreen from '../screens/HomeScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import MonthlyEntriesScreen from '../screens/MonthlyEntriesScreen';
import AddMonthlyEntryScreen from '../screens/AddMonthlyEntryScreen';
import MonthlySpendingLimitsScreen from '../screens/MonthlySpendingLimitsScreen';
import AddMonthlySpendingLimitScreen from '../screens/AddMonthlySpendingLimitScreen';
import MonthlyStatementScreen from '../screens/MonthlyStatementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Caderninho Financeiro' }}
        />
        <Stack.Screen 
          name="Expenses" 
          component={ExpensesScreen}
          options={{ title: 'Despesas' }}
        />
        <Stack.Screen 
          name="AddExpense" 
          component={AddExpenseScreen}
          options={{ title: 'Nova Despesa' }}
        />
        <Stack.Screen 
          name="MonthlyEntries" 
          component={MonthlyEntriesScreen}
          options={{ title: 'Entradas Mensais' }}
        />
        <Stack.Screen 
          name="AddMonthlyEntry" 
          component={AddMonthlyEntryScreen}
          options={{ title: 'Nova Entrada Mensal' }}
        />
        <Stack.Screen 
          name="MonthlySpendingLimits" 
          component={MonthlySpendingLimitsScreen}
          options={{ title: 'Limites de Gasto' }}
        />
        <Stack.Screen 
          name="AddMonthlySpendingLimit" 
          component={AddMonthlySpendingLimitScreen}
          options={{ title: 'Novo Limite de Gasto' }}
        />
        <Stack.Screen 
          name="MonthlyStatement" 
          component={MonthlyStatementScreen}
          options={{ title: 'Extrato Mensal' }}
        />
        {/* Adicione mais telas aqui conforme desenvolver */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
