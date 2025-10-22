/**
 * Dropdown com busca, paginação infinita e opção de adicionar novo item
 * Componente genérico reutilizável para selecionar entidades da API
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

// Props genéricas do componente
export interface SearchableDropdownProps<T> {
  // Dados e controle
  selectedItem?: T | null;
  onSelectItem: (item: T) => void;
  
  // Função para buscar dados (deve implementar paginação)
  fetchData: (searchText: string, pageNumber: number) => Promise<{
    items: T[];
    hasMore: boolean;
  }>;
  
  // Funções de renderização
  getItemId: (item: T) => string | number;
  getItemDisplayText: (item: T) => string;
  renderItem?: (item: T) => React.ReactNode;
  
  // Configurações
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  addNewText?: string;
  keepOpenAfterAdd?: boolean; // Manter dropdown aberto após adicionar novo item
  
  // Eventos
  onAddNew?: () => void;
  onItemAdded?: () => void; // Callback após item ser adicionado
  
  // Estilo
  style?: any;
  disabled?: boolean;
}

export default function SearchableDropdown<T>({
  selectedItem,
  onSelectItem,
  fetchData,
  getItemId,
  getItemDisplayText,
  renderItem,
  placeholder = 'Selecione...',
  searchPlaceholder = 'Digite para buscar...',
  emptyMessage = 'Nenhum item encontrado',
  addNewText = 'Adicionar novo',
  keepOpenAfterAdd = false,
  onAddNew,
  onItemAdded,
  style,
  disabled = false,
}: SearchableDropdownProps<T>) {
  
  // Estados
  const [isVisible, setIsVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Limpar dados ao abrir o modal
  const openModal = () => {
    if (disabled) return;
    
    setIsVisible(true);
    setSearchText('');
    setItems([]);
    setCurrentPage(1);
    setHasMore(true);
    loadItems('', 1);
  };

  // Carregar itens
  const loadItems = useCallback(async (text: string, page: number, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await fetchData(text, page);
      
      if (page === 1) {
        setItems(result.items);
      } else {
        setItems(prev => [...prev, ...result.items]);
      }
      
      setHasMore(result.hasMore);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [fetchData]);

  // Buscar com debounce
  useEffect(() => {
    if (!isVisible) return;
    
    const timeoutId = setTimeout(() => {
      if (currentPage === 1 || searchText !== '') {
        loadItems(searchText, 1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText, isVisible, loadItems]);

  // Recarregar dados quando selectedItem mudar e dropdown estiver aberto (keepOpenAfterAdd)
  useEffect(() => {
    if (isVisible && keepOpenAfterAdd && selectedItem) {
      // Pequeno delay para garantir que o item foi salvo no backend
      const timeoutId = setTimeout(() => {
        setSearchText('');
        setItems([]);
        setCurrentPage(1);
        setHasMore(true);
        loadItems('', 1);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedItem, isVisible, keepOpenAfterAdd, loadItems]);

  // Carregar mais itens
  const loadMoreItems = () => {
    if (hasMore && !loadingMore && !loading) {
      loadItems(searchText, currentPage + 1, true);
    }
  };

  // Selecionar item
  const handleSelectItem = (item: T) => {
    onSelectItem(item);
    setIsVisible(false);
  };

  // Renderizar item da lista
  const renderListItem = ({ item }: { item: T }) => {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handleSelectItem(item)}
      >
        {renderItem ? renderItem(item) : (
          <Text style={styles.listItemText}>{getItemDisplayText(item)}</Text>
        )}
      </TouchableOpacity>
    );
  };

  // Renderizar footer com "Adicionar novo" ou loading
  const renderFooter = () => {
    return (
      <View style={styles.footer}>
        {loadingMore && (
          <View style={styles.loadingMore}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingMoreText}>Carregando...</Text>
          </View>
        )}
        
        {onAddNew && (
          <TouchableOpacity
            style={styles.addNewButton}
            onPress={() => {
              if (!keepOpenAfterAdd) {
                setIsVisible(false);
              }
              onAddNew();
            }}
          >
            <Text style={styles.addNewText}>+ {addNewText}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Renderizar item vazio
  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  };

  return (
    <>
      {/* Botão para abrir o dropdown */}
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          disabled && styles.dropdownButtonDisabled,
          style
        ]}
        onPress={openModal}
        disabled={disabled}
      >
        <Text style={[
          styles.dropdownButtonText,
          disabled && styles.dropdownButtonTextDisabled
        ]}>
          {selectedItem ? getItemDisplayText(selectedItem) : placeholder}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      {/* Modal com lista */}
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header com busca */}
            <View style={styles.modalHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder={searchPlaceholder}
                value={searchText}
                onChangeText={setSearchText}
                autoFocus={true}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de itens */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Carregando...</Text>
              </View>
            ) : (
              <FlatList
                data={items}
                keyExtractor={(item) => getItemId(item).toString()}
                renderItem={renderListItem}
                ListEmptyComponent={renderEmpty}
                ListFooterComponent={renderFooter}
                onEndReached={loadMoreItems}
                onEndReachedThreshold={0.1}
                style={styles.list}
              />
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Botão do dropdown
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  dropdownButtonTextDisabled: {
    color: '#999',
  },
  dropdownIcon: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
  },
  closeButton: {
    marginLeft: 12,
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },

  // Lista
  list: {
    maxHeight: 300,
  },
  listItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemText: {
    fontSize: 16,
    color: '#333',
  },

  // Estados de loading
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  loadingMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },

  // Empty state
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  addNewButton: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  addNewText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});