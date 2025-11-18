/**
 * Tela de Despesas
 * Lista despesas com filtros de ano/mês, permitindo adicionar e deletar
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { Expense, ExpenseFilterRequest } from '../services/caderninhoApiService';
import { showAlert } from '../utils/alerts';

type ExpensesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Expenses'>;
};

export default function ExpensesScreen({ navigation }: ExpensesScreenProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Estados de filtro
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Estados de dados
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Opções de anos (2 anos anteriores, atual, 2 anos posteriores)
  const yearOptions = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Carregar despesas
  const loadExpenses = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const filter: ExpenseFilterRequest = {
        year: selectedYear,
        month: selectedMonth,
        pageSize: 50, // Carregar mais itens por página
      };

      const response = await CaderninhoApiService.expenses.getAll(filter);
      setExpenses(response.items);
      setTotalExpenses(response.totalItems);
    } catch (error) {
      console.error('Erro ao carregar despesas:', error);
      showAlert('Erro', 'Não foi possível carregar as despesas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear, selectedMonth]);

  // Carregar despesas quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  // Refresh da lista
  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses(false);
  };

  // Deletar despesa
  const handleDeleteExpense = (expense: Expense) => {
    showAlert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a despesa "${expense.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await CaderninhoApiService.expenses.delete(expense.id);
              
              showAlert('Sucesso', 'Despesa excluída com sucesso');
              loadExpenses(); // Recarregar a lista após exclusão
              
            } catch (error) {
              console.error('Erro ao deletar despesa:', error);
              showAlert('Erro', 'Não foi possível excluir a despesa');
            }
          },
        },
      ]
    );
  };

  // Navegar para adicionar despesa
  const handleAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  /**
   * Navega para o mês anterior
   */
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  /**
   * Navega para o próximo mês
   */
  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Renderizar item de despesa
  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <View style={styles.expenseItem}>
      <View style={styles.expenseHeader}>
        <Text style={styles.expenseDescription} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={styles.expenseAmount}>
          {formatCurrency(item.amount)}
        </Text>
      </View>
      
      <View style={styles.expenseDetails}>
        <View style={styles.expenseInfo}>
          <Text style={styles.expenseEstablishment}>
            📍 {item.establishment?.name || 'Não informado'}
          </Text>
          {item.card && (
            <Text style={styles.expenseCard}>
              💳 {item.card.name} **** {item.card.lastFourDigits}
            </Text>
          )}
          <Text style={styles.expenseDate}>
            📅 {formatDate(item.date)}
          </Text>
          {item.installmentCount > 1 && (
            <Text style={styles.expenseInstallments}>
              🔢 {item.installmentCount}x parcelas
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteExpense(item)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={styles.emptyTitle}>Nenhuma despesa encontrada</Text>
      <Text style={styles.emptySubtitle}>
        Não há despesas para {monthNames[selectedMonth - 1]} de {selectedYear}
      </Text>
      <TouchableOpacity style={styles.addButtonInline} onPress={handleAddExpense}>
        <Text style={styles.addButtonText}>+ Adicionar Primeira Despesa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header com filtros */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Despesas</Text>
        
        {/* Seletor de Ano */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Ano:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
            {yearOptions.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  selectedYear === year && styles.yearButtonActive
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.yearButtonText,
                    selectedYear === year && styles.yearButtonTextActive
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Navegação de Meses */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <Text style={styles.navButtonText}>◀</Text>
          </TouchableOpacity>
          
          <Text style={styles.currentMonth}>
            {monthNames[selectedMonth - 1]} {selectedYear}
          </Text>
          
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Resumo */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {totalExpenses} despesa{totalExpenses !== 1 ? 's' : ''} encontrada{totalExpenses !== 1 ? 's' : ''}
          </Text>
          {expenses.length > 0 && (
            <Text style={styles.totalAmount}>
              Total: {formatCurrency(expenses.reduce((sum, expense) => sum + expense.amount, 0))}
            </Text>
          )}
        </View>
      </View>

      {/* Lista de despesas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Carregando despesas...</Text>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExpenseItem}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={expenses.length === 0 ? styles.emptyList : styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Botão flutuante para adicionar */}
      {expenses.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddExpense}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  yearScroll: {
    flexGrow: 0,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  yearButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  yearButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  yearButtonTextActive: {
    color: '#fff',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  currentMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f44336',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  expenseItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseInfo: {
    flex: 1,
    gap: 4,
  },
  expenseEstablishment: {
    fontSize: 14,
    color: '#666',
  },
  expenseCard: {
    fontSize: 14,
    color: '#666',
  },
  expenseDate: {
    fontSize: 14,
    color: '#666',
  },
  expenseInstallments: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButtonInline: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});