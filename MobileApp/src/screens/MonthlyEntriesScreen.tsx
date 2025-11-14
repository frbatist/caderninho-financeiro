/**
 * Tela de Entradas Mensais
 * Lista entradas mensais com filtros de ano/mês e status ativo/inativo
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
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { 
  MonthlyEntry, 
  MonthlyEntryFilterRequest, 
  MonthlyEntryType,
  OperationType 
} from '../services/caderninhoApiService';
import DuplicateMonthlyEntryModal from '../components/DuplicateMonthlyEntryModal';
import { showAlert } from '../utils/alerts';

type MonthlyEntriesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MonthlyEntries'>;
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

// Opções para filtro de status
const statusOptions = [
  { value: undefined, label: 'Todos' },
  { value: true, label: 'Ativos' },
  { value: false, label: 'Inativos' },
];

// Labels para tipos de entrada
const getMonthlyEntryTypeLabel = (type: MonthlyEntryType): string => {
  switch (type) {
    case MonthlyEntryType.Salary: return '💰 Salário';
    case MonthlyEntryType.Tax: return '🏛️ Imposto';
    case MonthlyEntryType.MonthlyBill: return '📄 Conta Mensal';
    case MonthlyEntryType.Other: return '📌 Outro';
    default: return '❓';
  }
};

export default function MonthlyEntriesScreen({ navigation }: MonthlyEntriesScreenProps) {
  // Estados de filtro
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>(undefined);
  
  // Estados de modal de filtros
  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  
  // Estados de dados
  const [entries, setEntries] = useState<MonthlyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalEntries, setTotalEntries] = useState(0);

  // Estados do modal de duplicação
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [entryToDuplicate, setEntryToDuplicate] = useState<MonthlyEntry | null>(null);

  // Carregar entradas
  const loadEntries = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const filter: MonthlyEntryFilterRequest = {
        year: selectedYear,
        month: selectedMonth,
        isActive: selectedStatus,
        pageSize: 100,
      };

      const response = await CaderninhoApiService.monthlyEntries.getAll(filter);
      setEntries(response.items);
      setTotalEntries(response.totalItems);
    } catch (error) {
      console.error('Erro ao carregar entradas mensais:', error);
      showAlert('Erro', 'Não foi possível carregar as entradas mensais');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear, selectedMonth, selectedStatus]);

  // Carregar entradas quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  // Refresh da lista
  const onRefresh = () => {
    setRefreshing(true);
    loadEntries(false);
  };

  // Toggle status ativo/inativo
  const handleToggleActive = async (entry: MonthlyEntry) => {
    const newStatus = !entry.isActive;
    const statusText = newStatus ? 'ativar' : 'desativar';
    
    showAlert(
      'Confirmar Alteração',
      `Deseja realmente ${statusText} a entrada "${entry.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await CaderninhoApiService.monthlyEntries.toggleActive(entry.id, newStatus);
              showAlert('Sucesso', `Entrada ${newStatus ? 'ativada' : 'desativada'} com sucesso`);
              loadEntries();
            } catch (error) {
              console.error('Erro ao alterar status:', error);
              showAlert('Erro', 'Não foi possível alterar o status da entrada');
            }
          },
        },
      ]
    );
  };

  // Deletar entrada
  const handleDeleteEntry = (entry: MonthlyEntry) => {
    showAlert(
      'Confirmar Exclusão',
      `Deseja realmente excluir a entrada "${entry.description}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await CaderninhoApiService.monthlyEntries.delete(entry.id);
              showAlert('Sucesso', 'Entrada excluída com sucesso');
              loadEntries();
            } catch (error) {
              console.error('Erro ao deletar entrada:', error);
              showAlert('Erro', 'Não foi possível excluir a entrada');
            }
          },
        },
      ]
    );
  };

  // Abrir modal de duplicação
  const handleDuplicateEntry = (entry: MonthlyEntry) => {
    setEntryToDuplicate(entry);
    setShowDuplicateModal(true);
  };

  // Confirmar duplicação
  const handleConfirmDuplicate = async (amount: number) => {
    if (!entryToDuplicate) return;

    try {
      await CaderninhoApiService.monthlyEntries.duplicateToNextMonth(entryToDuplicate.id, { amount });
      showAlert('Sucesso', 'Entrada duplicada para o próximo mês com sucesso!');
      loadEntries();
    } catch (error) {
      console.error('Erro ao duplicar entrada:', error);
      showAlert('Erro', 'Não foi possível duplicar a entrada');
      throw error; // Re-throw para o modal tratar
    }
  };

  // Navegar para adicionar entrada
  const handleAddEntry = () => {
    navigation.navigate('AddMonthlyEntry');
  };

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Renderizar selector de filtro (abre modal)
  const renderFilterSelector = (label: string, value: string, onPress: () => void) => (
    <TouchableOpacity style={styles.filterSelector} onPress={onPress}>
      <Text style={styles.filterLabel}>{label}</Text>
      <View style={styles.filterValueContainer}>
        <Text style={styles.filterValue} numberOfLines={1}>{value}</Text>
        <Text style={styles.filterArrow}>▼</Text>
      </View>
    </TouchableOpacity>
  );

  // Renderizar modal de seleção
  const renderSelectionModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: { value: any; label: string }[],
    selectedValue: any,
    onSelect: (value: any) => void
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item, index) => `${item.value}-${index}`}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  item.value === selectedValue && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  item.value === selectedValue && styles.modalOptionTextSelected
                ]}>
                  {item.label}
                </Text>
                {item.value === selectedValue && (
                  <Text style={styles.modalOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Renderizar item de entrada
  const renderEntryItem = ({ item }: { item: MonthlyEntry }) => {
    const isIncome = item.operation === OperationType.Income;
    
    return (
      <View style={[styles.entryItem, !item.isActive && styles.entryItemInactive]}>
        <View style={styles.entryHeader}>
          <View style={styles.entryHeaderLeft}>
            <Text style={styles.entryType}>
              {getMonthlyEntryTypeLabel(item.type)}
            </Text>
            {!item.isActive && (
              <Text style={styles.inactiveLabel}>INATIVO</Text>
            )}
          </View>
          <Text style={[
            styles.entryAmount,
            isIncome ? styles.entryAmountIncome : styles.entryAmountExpense
          ]}>
            {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
          </Text>
        </View>
        
        <Text style={styles.entryDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.entryActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.duplicateButton]}
            onPress={() => handleDuplicateEntry(item)}
          >
            <Text style={styles.actionButtonText}>📋 Duplicar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => handleToggleActive(item)}
          >
            <Text style={styles.actionButtonText}>
              {item.isActive ? '⏸️ Desativar' : '▶️ Ativar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteEntry(item)}
          >
            <Text style={styles.actionButtonText}>🗑️ Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Renderizar empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💵</Text>
      <Text style={styles.emptyTitle}>Nenhuma entrada encontrada</Text>
      <Text style={styles.emptySubtitle}>
        Não há entradas para {monthOptions.find(m => m.value === selectedMonth)?.label} de {selectedYear}
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddEntry}>
        <Text style={styles.addButtonText}>+ Adicionar Primeira Entrada</Text>
      </TouchableOpacity>
    </View>
  );

  // Calcular totais
  const activeEntries = entries.filter(e => e.isActive);
  const totalIncome = activeEntries
    .filter(e => e.operation === OperationType.Income)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpenses = activeEntries
    .filter(e => e.operation === OperationType.Expense)
    .reduce((sum, e) => sum + e.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Obter labels para exibição nos filtros
  const getYearLabel = () => selectedYear.toString();
  const getMonthLabel = () => monthOptions.find(m => m.value === selectedMonth)?.label || '';
  const getStatusLabel = () => statusOptions.find(s => s.value === selectedStatus)?.label || '';

  return (
    <View style={styles.container}>
      {/* Header com filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Entradas Mensais</Text>
        
        {/* Grid de Filtros (3 em uma linha) */}
        <View style={styles.filtersRow}>
          {renderFilterSelector('Ano', getYearLabel(), () => setYearModalVisible(true))}
          {renderFilterSelector('Mês', getMonthLabel(), () => setMonthModalVisible(true))}
          {renderFilterSelector('Status', getStatusLabel(), () => setStatusModalVisible(true))}
        </View>

        {/* Resumo */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {totalEntries} entrada{totalEntries !== 1 ? 's' : ''} encontrada{totalEntries !== 1 ? 's' : ''}
          </Text>
          {activeEntries.length > 0 && (
            <View style={styles.balanceContainer}>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Entradas:</Text>
                <Text style={styles.balanceIncome}>{formatCurrency(totalIncome)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Saídas:</Text>
                <Text style={styles.balanceExpense}>{formatCurrency(totalExpenses)}</Text>
              </View>
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Saldo:</Text>
                <Text style={[
                  styles.balanceTotal,
                  balance >= 0 ? styles.balancePositive : styles.balanceNegative
                ]}>
                  {formatCurrency(balance)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Lista de entradas */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando entradas...</Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      {/* Botão flutuante para adicionar */}
      {!loading && entries.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddEntry}>
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Modal de duplicação */}
      <DuplicateMonthlyEntryModal
        visible={showDuplicateModal}
        entry={entryToDuplicate}
        onClose={() => {
          setShowDuplicateModal(false);
          setEntryToDuplicate(null);
        }}
        onConfirm={handleConfirmDuplicate}
      />

      {/* Modais de Filtro */}
      {renderSelectionModal(
        yearModalVisible,
        () => setYearModalVisible(false),
        'Selecionar Ano',
        generateYearOptions(),
        selectedYear,
        setSelectedYear
      )}
      
      {renderSelectionModal(
        monthModalVisible,
        () => setMonthModalVisible(false),
        'Selecionar Mês',
        monthOptions,
        selectedMonth,
        setSelectedMonth
      )}
      
      {renderSelectionModal(
        statusModalVisible,
        () => setStatusModalVisible(false),
        'Selecionar Status',
        statusOptions,
        selectedStatus,
        setSelectedStatus
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterSelector: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  filterValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  filterArrow: {
    fontSize: 10,
    color: '#007AFF',
    marginLeft: 4,
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceContainer: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  balanceIncome: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  balanceExpense: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  balanceTotal: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  balancePositive: {
    color: '#4CAF50',
  },
  balanceNegative: {
    color: '#F44336',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  entryItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  entryItemInactive: {
    opacity: 0.6,
    backgroundColor: '#F5F5F5',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  entryType: {
    fontSize: 14,
    color: '#666',
  },
  inactiveLabel: {
    fontSize: 10,
    color: '#999',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
  },
  entryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  entryAmountIncome: {
    color: '#4CAF50',
  },
  entryAmountExpense: {
    color: '#F44336',
  },
  entryDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  entryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  duplicateButton: {
    backgroundColor: '#4A90E2',
  },
  toggleButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '300',
  },
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666',
    fontWeight: '300',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOptionCheck: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
