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
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { Expense, ExpenseFilterRequest } from '../services/caderninhoApiService';

type ExpensesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Expenses'>;
};

// Opções para dropdown de ano (atual + 10 anos atrás)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i <= 10; i++) {
    years.push({
      value: currentYear - i,
      label: (currentYear - i).toString(),
    });
  }
  return years;
};

// Opções para dropdown de mês
const monthOptions = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

export default function ExpensesScreen({ navigation }: ExpensesScreenProps) {
  // Estados de filtro
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  
  // Estados de dados
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);

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
      Alert.alert('Erro', 'Não foi possível carregar as despesas');
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
    Alert.alert(
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
              
              Alert.alert('Sucesso', 'Despesa excluída com sucesso');
              loadExpenses(); // Recarregar a lista após exclusão
              
            } catch (error) {
              console.error('Erro ao deletar despesa:', error);
              Alert.alert('Erro', 'Não foi possível excluir a despesa');
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

  // Renderizar dropdown customizado
  const renderDropdown = (
    value: number,
    options: { value: number; label: string }[],
    onSelect: (value: number) => void,
    label: string
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <View style={styles.dropdownOptions}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.dropdownOption,
              value === option.value && styles.dropdownOptionSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.dropdownOptionText,
              value === option.value && styles.dropdownOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
        Não há despesas para {monthOptions.find(m => m.value === selectedMonth)?.label} de {selectedYear}
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddExpense}>
        <Text style={styles.addButtonText}>+ Adicionar Primeira Despesa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header com filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Despesas</Text>
        
        <View style={styles.filtersContainer}>
          {renderDropdown(selectedYear, generateYearOptions(), setSelectedYear, 'Ano')}
          {renderDropdown(selectedMonth, monthOptions, setSelectedMonth, 'Mês')}
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
          <ActivityIndicator size="large" color="#007AFF" />
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  dropdownContainer: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdownOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  dropdownOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  dropdownOptionText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  dropdownOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
  addButton: {
    backgroundColor: '#007AFF',
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