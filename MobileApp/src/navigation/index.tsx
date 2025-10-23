/**
 * Configuração de navegação da aplicação
 * Stack Navigator para navegação entre telas
 */

import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import UserStorageService from '../services/userStorageService';

// Import das telas
import UserSelectionScreen from '../screens/UserSelectionScreen';
import HomeScreen from '../screens/HomeScreen';
import DebugScreen from '../screens/DebugScreen';
import ExpensesScreen from '../screens/ExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import MonthlyEntriesScreen from '../screens/MonthlyEntriesScreen';
import AddMonthlyEntryScreen from '../screens/AddMonthlyEntryScreen';
import MonthlySpendingLimitsScreen from '../screens/MonthlySpendingLimitsScreen';
import AddMonthlySpendingLimitScreen from '../screens/AddMonthlySpendingLimitScreen';
import MonthlyStatementScreen from '../screens/MonthlyStatementScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasUser, setHasUser] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  /**
   * Verifica se há usuário salvo no storage
   */
  const checkUser = async () => {
    try {
      const userExists = await UserStorageService.hasUser();
      setHasUser(userExists);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      setHasUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Tela de loading enquanto verifica usuário
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={hasUser ? 'Home' : 'UserSelection'}
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
          name="UserSelection" 
          component={UserSelectionScreen}
          options={{ 
            title: 'Selecione o Usuário',
            headerShown: false, // Remove header na tela de seleção
          }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Caderninho Financeiro' }}
        />
        <Stack.Screen 
          name="Debug" 
          component={DebugScreen}
          options={{ 
            title: 'Debug',
            headerShown: false,
          }}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
