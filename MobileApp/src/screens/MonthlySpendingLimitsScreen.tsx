/**
 * Tela de Limites de Gasto Mensal
 * Lista limites de gasto por tipo de estabelecimento com filtros de ano/mês/tipo e status
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { 
  MonthlySpendingLimit, 
  MonthlySpendingLimitFilterRequest
} from '../services/caderninhoApiService';
import { 
  EstablishmentType, 
  getEstablishmentTypeIcon, 
  getEstablishmentTypeName,
  getEstablishmentTypeOptionsWithIcons 
} from '../types/establishmentType';
import DuplicateMonthlySpendingLimitModal from '../components/DuplicateMonthlySpendingLimitModal';

type MonthlySpendingLimitsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MonthlySpendingLimits'>;
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

// Opções para filtro de tipo de estabelecimento
const getEstablishmentTypeFilterOptions = () => [
  { value: undefined, label: 'Todos os Tipos', icon: '📋' },
  ...getEstablishmentTypeOptionsWithIcons()
];

// Labels para tipos de estabelecimento
const getEstablishmentTypeLabel = (type: EstablishmentType): string => {
  return `${getEstablishmentTypeIcon(type)} ${getEstablishmentTypeName(type)}`;
};

export default function MonthlySpendingLimitsScreen({ navigation }: MonthlySpendingLimitsScreenProps) {
  // Estados de filtro
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>(undefined);
  const [selectedEstablishmentType, setSelectedEstablishmentType] = useState<EstablishmentType | undefined>(undefined);
  
  // Estados de modal de filtros
  const [yearModalVisible, setYearModalVisible] = useState(false);
  const [monthModalVisible, setMonthModalVisible] = useState(false);
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  
  // Estados de dados
  const [limits, setLimits] = useState<MonthlySpendingLimit[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Estados do modal de duplicação
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [limitToDuplicate, setLimitToDuplicate] = useState<MonthlySpendingLimit | null>(null);

  // Carregar limites
  const loadLimits = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const filter: MonthlySpendingLimitFilterRequest = {
        year: selectedYear,
        month: selectedMonth,
        isActive: selectedStatus,
        establishmentType: selectedEstablishmentType,
        pageSize: 100,
      };

      const response = await CaderninhoApiService.monthlySpendingLimits.getAll(filter);
      setLimits(response.items);
    } catch (error) {
      console.error('Erro ao carregar limites de gasto:', error);
      Alert.alert('Erro', 'Não foi possível carregar os limites de gasto');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedYear, selectedMonth, selectedStatus, selectedEstablishmentType]);

  // Carregar limites quando a tela receber foco
  useFocusEffect(
    useCallback(() => {
      loadLimits();
    }, [loadLimits])
  );

  // Refresh da lista
  const onRefresh = () => {
    setRefreshing(true);
    loadLimits(false);
  };

  // Toggle status ativo/inativo
  const handleToggleActive = async (limit: MonthlySpendingLimit) => {
    const newStatus = !limit.isActive;
    const statusText = newStatus ? 'ativar' : 'desativar';
    
    Alert.alert(
      'Confirmar Alteração',
      `Deseja realmente ${statusText} o limite de ${getEstablishmentTypeLabel(limit.establishmentType)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await CaderninhoApiService.monthlySpendingLimits.toggleActive(limit.id, newStatus);
              Alert.alert('Sucesso', `Limite ${newStatus ? 'ativado' : 'desativado'} com sucesso`);
              loadLimits();
            } catch (error) {
              console.error('Erro ao alterar status:', error);
              Alert.alert('Erro', 'Não foi possível alterar o status do limite');
            }
          },
        },
      ]
    );
  };

  // Deletar limite
  const handleDeleteLimit = (limit: MonthlySpendingLimit) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o limite de ${getEstablishmentTypeLabel(limit.establishmentType)}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await CaderninhoApiService.monthlySpendingLimits.delete(limit.id);
              Alert.alert('Sucesso', 'Limite excluído com sucesso');
              loadLimits();
            } catch (error) {
              console.error('Erro ao deletar limite:', error);
              Alert.alert('Erro', 'Não foi possível excluir o limite');
            }
          },
        },
      ]
    );
  };

  // Abrir modal de duplicação
  const handleDuplicateLimit = (limit: MonthlySpendingLimit) => {
    setLimitToDuplicate(limit);
    setShowDuplicateModal(true);
  };

  // Confirmar duplicação
  const handleConfirmDuplicate = async (amount: number) => {
    if (!limitToDuplicate) return;

    try {
      await CaderninhoApiService.monthlySpendingLimits.duplicateToNextMonth(limitToDuplicate.id, { amount });
      Alert.alert('Sucesso', 'Limite duplicado para o próximo mês com sucesso!');
      loadLimits();
    } catch (error) {
      console.error('Erro ao duplicar limite:', error);
      Alert.alert('Erro', 'Não foi possível duplicar o limite');
      throw error; // Re-throw para o modal tratar
    }
  };

  // Navegar para adicionar limite
  const handleAddLimit = () => {
    navigation.navigate('AddMonthlySpendingLimit');
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
    options: { value: any; label: string; icon?: string }[],
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
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  selectedValue === item.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedValue === item.value && styles.modalOptionTextSelected
                ]}>
                  {item.icon ? `${item.icon} ${item.label}` : item.label}
                </Text>
                {selectedValue === item.value && (
                  <Text style={styles.modalOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  // Renderizar item de limite
  const renderLimitItem = ({ item }: { item: MonthlySpendingLimit }) => {
    return (
      <View style={[styles.limitItem, !item.isActive && styles.limitItemInactive]}>
        <View style={styles.limitHeader}>
          <View style={styles.limitHeaderLeft}>
            <Text style={styles.limitType}>
              {getEstablishmentTypeLabel(item.establishmentType)}
            </Text>
            {!item.isActive && (
              <Text style={styles.inactiveLabel}>INATIVO</Text>
            )}
          </View>
          <Text style={styles.limitAmount}>
            {formatCurrency(item.limitAmount)}
          </Text>
        </View>
        
        <Text style={styles.limitPeriod}>
          {monthOptions.find(m => m.value === item.month)?.label} {item.year}
        </Text>
        
        <View style={styles.limitActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => handleToggleActive(item)}
          >
            <Text style={styles.actionButtonText}>
              {item.isActive ? '⏸️ Desativar' : '▶️ Ativar'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.duplicateButton]}
            onPress={() => handleDuplicateLimit(item)}
          >
            <Text style={styles.actionButtonText}>📋 Duplicar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteLimit(item)}
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
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={styles.emptyTitle}>Nenhum limite encontrado</Text>
      <Text style={styles.emptySubtitle}>
        Não há limites para {monthOptions.find(m => m.value === selectedMonth)?.label} de {selectedYear}
      </Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddLimit}>
        <Text style={styles.addButtonText}>+ Adicionar Primeiro Limite</Text>
      </TouchableOpacity>
    </View>
  );

  // Calcular total de limites ativos
  const activeLimits = limits.filter(l => l.isActive);
  const totalLimitAmount = activeLimits.reduce((sum, l) => sum + l.limitAmount, 0);

  // Obter labels para exibição nos filtros
  const getYearLabel = () => selectedYear.toString();
  const getMonthLabel = () => monthOptions.find(m => m.value === selectedMonth)?.label || '';
  const getTypeLabel = () => {
    if (selectedEstablishmentType === undefined) return 'Todos os Tipos';
    return getEstablishmentTypeName(selectedEstablishmentType);
  };
  const getStatusLabel = () => statusOptions.find(s => s.value === selectedStatus)?.label || '';

  return (
    <View style={styles.container}>
      {/* Header com filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Limites de Gasto Mensal</Text>
        
        {/* Grid de Filtros (2 por linha) */}
        <View style={styles.filtersRow}>
          {renderFilterSelector('Ano', getYearLabel(), () => setYearModalVisible(true))}
          {renderFilterSelector('Mês', getMonthLabel(), () => setMonthModalVisible(true))}
        </View>
        
        <View style={styles.filtersRow}>
          {renderFilterSelector('Tipo', getTypeLabel(), () => setTypeModalVisible(true))}
          {renderFilterSelector('Status', getStatusLabel(), () => setStatusModalVisible(true))}
        </View>
        
        {/* Resumo */}
        {activeLimits.length > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total de Limites Ativos</Text>
              <Text style={styles.summaryTotal}>{formatCurrency(totalLimitAmount)}</Text>
              <Text style={styles.summaryCount}>{activeLimits.length} limite(s)</Text>
            </View>
          </View>
        )}
      </View>

      {/* Lista de limites */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando limites...</Text>
        </View>
      ) : (
        <FlatList
          data={limits}
          renderItem={renderLimitItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContainer,
            limits.length === 0 && styles.listContainerEmpty
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmpty}
        />
      )}

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
        typeModalVisible,
        () => setTypeModalVisible(false),
        'Selecionar Tipo',
        getEstablishmentTypeFilterOptions(),
        selectedEstablishmentType,
        setSelectedEstablishmentType
      )}
      
      {renderSelectionModal(
        statusModalVisible,
        () => setStatusModalVisible(false),
        'Selecionar Status',
        statusOptions,
        selectedStatus,
        setSelectedStatus
      )}

      {/* Botão Flutuante Adicionar */}
      <TouchableOpacity style={styles.fab} onPress={handleAddLimit}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modal de Duplicação */}
      <DuplicateMonthlySpendingLimitModal
        visible={showDuplicateModal}
        limit={limitToDuplicate}
        onClose={() => setShowDuplicateModal(false)}
        onConfirm={handleConfirmDuplicate}
      />
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  filterSelector: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  filterLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4,
    fontWeight: '600',
  },
  filterValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterValue: {
    fontSize: 14,
    color: '#212529',
    fontWeight: '500',
    flex: 1,
  },
  filterArrow: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryCard: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#1976d2',
    marginBottom: 8,
    fontWeight: '600',
  },
  summaryTotal: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  summaryCount: {
    fontSize: 12,
    color: '#1976d2',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOptionCheck: {
    fontSize: 20,
    color: '#007AFF',
    marginLeft: 8,
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
  listContainer: {
    padding: 16,
  },
  listContainerEmpty: {
    flex: 1,
  },
  limitItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  limitItemInactive: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  limitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  limitHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  limitType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  inactiveLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#999',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  limitAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  limitPeriod: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  limitActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#4CAF50',
  },
  duplicateButton: {
    backgroundColor: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    fontSize: 16,
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
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
