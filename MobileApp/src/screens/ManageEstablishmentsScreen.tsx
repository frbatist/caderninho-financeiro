/**
 * Tela de gerenciamento de estabelecimentos
 * Permite consulta, cadastro, edição e exclusão de estabelecimentos
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { Establishment, EstablishmentFilterRequest } from '../services/caderninhoApiService';
import { EstablishmentType, establishmentTypeNames, getEstablishmentTypeIcon } from '../types/establishmentType';

type ManageEstablishmentsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ManageEstablishments'>;
};

export default function ManageEstablishmentsScreen({ navigation }: ManageEstablishmentsScreenProps) {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedType, setSelectedType] = useState<EstablishmentType | undefined>(undefined);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [editingEstablishment, setEditingEstablishment] = useState<Establishment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<EstablishmentType>(EstablishmentType.Other);
  const [showEditTypeDropdown, setShowEditTypeDropdown] = useState(false);

  // Carregar estabelecimentos ao focar na tela
  useFocusEffect(
    useCallback(() => {
      loadEstablishments();
    }, [searchText, selectedType])
  );

  /**
   * Carrega estabelecimentos da API com filtros aplicados
   */
  const loadEstablishments = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const filter: EstablishmentFilterRequest = {
        pageSize: 1000,
      };

      if (searchText.trim()) {
        filter.searchText = searchText.trim();
      }

      if (selectedType !== undefined) {
        filter.type = selectedType;
      }

      const response = await CaderninhoApiService.establishments.getAll(filter);
      setEstablishments(response.items);
    } catch (error) {
      console.error('Erro ao carregar estabelecimentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar os estabelecimentos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refresh da lista
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadEstablishments(false);
  };

  /**
   * Abre modal para criar novo estabelecimento
   */
  const handleCreate = () => {
    navigation.navigate('AddEstablishment', {
      onEstablishmentAdded: () => {
        loadEstablishments();
      },
    });
  };

  /**
   * Abre modal para editar estabelecimento
   */
  const handleEdit = (establishment: Establishment) => {
    setEditingEstablishment(establishment);
    setEditName(establishment.name);
    setEditType(establishment.type);
    setShowEditModal(true);
  };

  /**
   * Salva edição do estabelecimento
   */
  const handleSaveEdit = async () => {
    if (!editingEstablishment) return;

    if (!editName.trim()) {
      Alert.alert('Erro', 'O nome do estabelecimento é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await CaderninhoApiService.establishments.update(editingEstablishment.id, {
        name: editName.trim(),
        type: editType,
      });

      Alert.alert('Sucesso', 'Estabelecimento atualizado com sucesso!');
      setShowEditModal(false);
      setEditingEstablishment(null);
      loadEstablishments();
    } catch (error) {
      console.error('Erro ao atualizar estabelecimento:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancela edição
   */
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingEstablishment(null);
    setEditName('');
    setEditType(EstablishmentType.Other);
  };

  /**
   * Confirma e exclui estabelecimento
   */
  const handleDelete = (establishment: Establishment) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o estabelecimento "${establishment.name}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await CaderninhoApiService.establishments.delete(establishment.id);
              Alert.alert('Sucesso', 'Estabelecimento excluído com sucesso!');
              loadEstablishments();
            } catch (error) {
              console.error('Erro ao excluir estabelecimento:', error);
              Alert.alert('Erro', 'Não foi possível excluir o estabelecimento. Ele pode estar vinculado a despesas.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  /**
   * Limpa filtros
   */
  const handleClearFilters = () => {
    setSearchText('');
    setSelectedType(undefined);
  };

  /**
   * Renderiza cada item da lista
   */
  const renderItem = ({ item }: { item: Establishment }) => (
    <View style={styles.establishmentCard}>
      <View style={styles.establishmentInfo}>
        <Text style={styles.establishmentIcon}>{getEstablishmentTypeIcon(item.type)}</Text>
        <View style={styles.establishmentDetails}>
          <Text style={styles.establishmentName}>{item.name}</Text>
          <Text style={styles.establishmentType}>{establishmentTypeNames[item.type]}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.editButtonText}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  /**
   * Renderiza dropdown de tipos
   */
  const renderTypeFilterModal = () => (
    <Modal
      visible={showTypeFilter}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowTypeFilter(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowTypeFilter(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filtrar por Tipo</Text>
          <FlatList
            data={[
              { value: undefined, label: 'Todos os tipos' },
              ...Object.entries(establishmentTypeNames).map(([value, label]) => ({
                value: Number(value) as EstablishmentType,
                label: `${getEstablishmentTypeIcon(Number(value) as EstablishmentType)} ${label}`,
              })),
            ]}
            keyExtractor={(item) => item.value?.toString() ?? 'all'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  selectedType === item.value && styles.typeOptionSelected,
                ]}
                onPress={() => {
                  setSelectedType(item.value);
                  setShowTypeFilter(false);
                }}
              >
                <Text
                  style={[
                    styles.typeOptionText,
                    selectedType === item.value && styles.typeOptionTextSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  /**
   * Renderiza modal de edição
   */
  const renderEditModal = () => (
    <Modal
      visible={showEditModal}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCancelEdit}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.editModalContent}>
          <Text style={styles.modalTitle}>Editar Estabelecimento</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="Nome do estabelecimento"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Tipo</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowEditTypeDropdown(!showEditTypeDropdown)}
          >
            <Text style={styles.dropdownButtonText}>
              {getEstablishmentTypeIcon(editType)} {establishmentTypeNames[editType]}
            </Text>
            <Text style={styles.dropdownArrow}>{showEditTypeDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showEditTypeDropdown && (
            <View style={styles.dropdownList}>
              <FlatList
                data={Object.entries(establishmentTypeNames).map(([value, label]) => ({
                  value: Number(value) as EstablishmentType,
                  label: `${getEstablishmentTypeIcon(Number(value) as EstablishmentType)} ${label}`,
                }))}
                keyExtractor={(item) => item.value.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setEditType(item.value);
                      setShowEditTypeDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={handleCancelEdit}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveEdit}
            >
              <Text style={styles.saveButtonText}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Estabelecimentos</Text>
      </View>

      {/* Filtros */}
      <View style={styles.filters}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Buscar por nome..."
            placeholderTextColor="#999"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.typeFilterButton}
          onPress={() => setShowTypeFilter(true)}
        >
          <Text style={styles.typeFilterButtonText}>
            {selectedType !== undefined
              ? `${getEstablishmentTypeIcon(selectedType)} ${establishmentTypeNames[selectedType]}`
              : '📋 Tipo'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {(searchText || selectedType !== undefined) && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={handleClearFilters}>
            <Text style={styles.clearFiltersButtonText}>Limpar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Botão de adicionar */}
      <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
        <Text style={styles.addButtonText}>+ Novo Estabelecimento</Text>
      </TouchableOpacity>

      {/* Lista de estabelecimentos */}
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={establishments}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum estabelecimento encontrado</Text>
            </View>
          }
        />
      )}

      {/* Modais */}
      {renderTypeFilterModal()}
      {renderEditModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  filters: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#666',
  },
  typeFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  typeFilterButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  clearFiltersButton: {
    backgroundColor: '#ff3b30',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  clearFiltersButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#34C759',
    margin: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  list: {
    padding: 15,
  },
  establishmentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  establishmentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  establishmentIcon: {
    fontSize: 30,
    marginRight: 15,
  },
  establishmentDetails: {
    flex: 1,
  },
  establishmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  establishmentType: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    fontSize: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  loader: {
    marginTop: 50,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  typeOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  typeOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  typeOptionText: {
    fontSize: 16,
    color: '#333',
  },
  typeOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  editModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
