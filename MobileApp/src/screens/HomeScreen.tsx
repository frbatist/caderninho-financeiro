/**
 * Tela inicial do aplicativo
 * Mostra resumo financeiro e navegação principal
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import UserStorageService from '../services/userStorageService';
import CaderninhoApiService, { User, MonthlyEntry, OperationType, PaymentType } from '../services/caderninhoApiService';
import UpdateService from '../services/updateService';
import { showAlert } from '../utils/alerts';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Carregar dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadUser();
      loadFinancialData();
      checkForUpdates();
    }, [])
  );

  /**
   * Carrega o usuário do storage
   */
  const loadUser = async () => {
    try {
      const user = await UserStorageService.getUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    }
  };

  /**
   * Verifica se há atualizações disponíveis
   */
  const checkForUpdates = async () => {
    try {
      // Verifica atualizações em background (não bloqueia a UI)
      setTimeout(() => {
        UpdateService.checkAndNotify();
      }, 2000); // Aguarda 2 segundos após carregar a tela
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
    }
  };

  /**
   * Carrega os dados financeiros (receitas e despesas)
   */
  const loadFinancialData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      // Buscar entradas mensais ativas do mês/ano atual
      const monthlyEntriesResponse = await CaderninhoApiService.monthlyEntries.getAll({
        month: currentMonth,
        year: currentYear,
        isActive: true,
        pageSize: 1000,
      });

      // Calcular receitas (entradas mensais com operation = Income)
      const totalIncome = monthlyEntriesResponse.items
        .filter(entry => entry.operation === OperationType.Income)
        .reduce((sum, entry) => sum + entry.amount, 0);

      // Calcular despesas fixas (entradas mensais com operation = Expense)
      const monthlyExpenses = monthlyEntriesResponse.items
        .filter(entry => entry.operation === OperationType.Expense)
        .reduce((sum, entry) => sum + entry.amount, 0);

      // Buscar despesas do mês atual (excluindo cartão de crédito)
      const expensesResponse = await CaderninhoApiService.expenses.getAll({
        month: currentMonth,
        year: currentYear,
        pageSize: 1000,
      });

      // Calcular gastos do mês (excluindo cartão de crédito)
      const monthExpenses = expensesResponse.items
        .filter(expense => expense.paymentType !== PaymentType.CreditCard)
        .reduce((sum, expense) => sum + expense.amount, 0);

      // Total de despesas = despesas mensais fixas + gastos do mês
      const totalExpenses = monthlyExpenses + monthExpenses;

      setIncome(totalIncome);
      setExpenses(totalExpenses);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      showAlert('Erro', 'Não foi possível carregar os dados financeiros');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refresh dos dados
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadFinancialData(false);
  };

  /**
   * Calcular saldo
   */
  const balance = income - expenses;

  /**
   * Troca de usuário
   */
  const changeUser = () => {
    showAlert(
      'Trocar Usuário',
      'Deseja realmente trocar de usuário?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Trocar',
          style: 'destructive',
          onPress: async () => {
            await UserStorageService.removeUser();
            navigation.reset({
              index: 0,
              routes: [{ name: 'UserSelection' }],
            });
          },
        },
      ]
    );
  };

  /**
   * Formatar valor monetário
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.content}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Bem-vindo{currentUser ? `, ${currentUser.name.split(' ')[0]}` : ''}!</Text>
            <Text style={styles.subtitle}>Seu controle financeiro pessoal</Text>
          </View>
          {currentUser && (
            <TouchableOpacity style={styles.userButton} onPress={changeUser}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Card de resumo */}
        <View style={styles.summaryCard}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Carregando...</Text>
            </View>
          ) : (
            <>
              <Text style={styles.summaryTitle}>Saldo Total</Text>
              <Text style={[
                styles.summaryAmount,
                balance < 0 && styles.negativeBalance
              ]}>
                {formatCurrency(balance)}
              </Text>
              <View style={styles.summaryDetails}>
                <View>
                  <Text style={styles.summaryLabel}>Receitas</Text>
                  <Text style={[styles.summaryValue, styles.income]}>
                    {formatCurrency(income)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.summaryLabel}>Despesas</Text>
                  <Text style={[styles.summaryValue, styles.expense]}>
                    {formatCurrency(expenses)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Menu de navegação */}
        <View style={styles.menuGrid}>
          <MenuButton
            title="Despesas"
            icon="💳"
            onPress={() => navigation.navigate('Expenses')}
          />
          <MenuButton
            title="Entradas Mensais"
            icon="💵"
            onPress={() => navigation.navigate('MonthlyEntries')}
          />
          <MenuButton
            title="Limites de Gasto"
            icon="📊"
            onPress={() => navigation.navigate('MonthlySpendingLimits')}
          />
          <MenuButton
            title="Extrato Mensal"
            icon="📑"
            onPress={() => navigation.navigate('MonthlyStatement')}
          />
          <MenuButton
            title="Cartões"
            icon="💳"
            onPress={() => navigation.navigate('Cards')}
          />
        </View>

        {/* Informação */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Os valores são atualizados automaticamente.{'\n'}
            Puxe para baixo para atualizar os dados.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Componente de botão de menu
 */
function MenuButton({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userButton: {
    padding: 4,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
    opacity: 0.9,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  negativeBalance: {
    color: '#FF3B30',
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  income: {
    color: '#4CD964',
  },
  expense: {
    color: '#FF3B30',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
