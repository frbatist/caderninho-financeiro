/**
 * Tela de Limites de Gasto Mensal
 * Lista limites de gasto por tipo de estabelecimento com filtros de ano/mês/tipo e status
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
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { 
  MonthlySpendingLimit, 
  MonthlySpendingLimitFilterRequest
} from '../services/caderninhoApiService';
import { EstablishmentType, getEstablishmentTypeIcon, getEstablishmentTypeName } from '../types/establishmentType';

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
const establishmentTypeOptions = [
  { value: undefined, label: 'Todos' },
  { value: EstablishmentType.Supermarket, label: '🛒 Mercado' },
  { value: EstablishmentType.ClothingStore, label: '👗 Loja de Roupas' },
  { value: EstablishmentType.GasStation, label: '⛽ Posto de Combustível' },
  { value: EstablishmentType.OnlineService, label: '📺 Serviço Online' },
  { value: EstablishmentType.Games, label: '🎮 Games' },
  { value: EstablishmentType.DepartmentStore, label: '🏬 Loja de Departamentos' },
  { value: EstablishmentType.Restaurant, label: '🍽️ Restaurante' },
  { value: EstablishmentType.Delivery, label: '🏍️ Delivery' },
  { value: EstablishmentType.Charity, label: '❤️ Caridade' },
  { value: EstablishmentType.Church, label: '⛪ Igreja' },
  { value: EstablishmentType.Events, label: '🎵 Eventos' },
  { value: EstablishmentType.Entertainment, label: '🎬 Lazer' },
  { value: EstablishmentType.Pharmacy, label: '💊 Farmácia' },
  { value: EstablishmentType.Health, label: '🏥 Saúde' },
  { value: EstablishmentType.Other, label: '🏪 Outros' },
];

// Labels para tipos de estabelecimento
const getEstablishmentTypeLabel = (type: EstablishmentType): string => {
  const option = establishmentTypeOptions.find(opt => opt.value === type);
  return option ? option.label : '❓';
};

export default function MonthlySpendingLimitsScreen({ navigation }: MonthlySpendingLimitsScreenProps) {
  // Estados de filtro
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>(undefined);
  const [selectedEstablishmentType, setSelectedEstablishmentType] = useState<EstablishmentType | undefined>(undefined);
  
  // Estados de dados
  const [limits, setLimits] = useState<MonthlySpendingLimit[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [totalLimits, setTotalLimits] = useState(0);

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
      setTotalLimits(response.totalItems);
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

  // Renderizar dropdown customizado (horizontal scrollable)
  const renderDropdown = (
    value: number | boolean | undefined,
    options: { value: any; label: string }[],
    onSelect: (value: any) => void,
    label: string
  ) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.dropdownScroll}
      >
        <View style={styles.dropdownOptions}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
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
      </ScrollView>
    </View>
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

  return (
    <View style={styles.container}>
      {/* Header com filtros */}
      <View style={styles.header}>
        <Text style={styles.title}>Limites de Gasto Mensal</Text>
        
        {/* Filtro de Ano */}
        {renderDropdown(selectedYear, generateYearOptions(), setSelectedYear, 'Ano')}
        
        {/* Filtro de Mês */}
        {renderDropdown(selectedMonth, monthOptions, setSelectedMonth, 'Mês')}
        
        {/* Filtro de Tipo de Estabelecimento */}
        {renderDropdown(selectedEstablishmentType, establishmentTypeOptions, setSelectedEstablishmentType, 'Tipo')}
        
        {/* Filtro de Status */}
        {renderDropdown(selectedStatus, statusOptions, setSelectedStatus, 'Status')}
        
        {/* Resumo */}
        {activeLimits.length > 0 && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total de Limites Ativos</Text>
              <Text style={styles.summaryTotal}>{formatCurrency(totalLimitAmount)}</Text>
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

      {/* Botão Flutuante Adicionar */}
      <TouchableOpacity style={styles.fab} onPress={handleAddLimit}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
  dropdownContainer: {
    marginBottom: 12,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dropdownScroll: {
    flexGrow: 0,
  },
  dropdownOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginRight: 8,
  },
  dropdownOptionSelected: {
    backgroundColor: '#007AFF',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0d47a1',
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
