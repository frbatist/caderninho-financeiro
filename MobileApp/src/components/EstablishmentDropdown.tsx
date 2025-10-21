/**
 * Dropdown específico para seleção de estabelecimentos
 * Usa o SearchableDropdown genérico com configurações específicas para estabelecimentos
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SearchableDropdown from './SearchableDropdown';
import AddEstablishmentModal from './AddEstablishmentModal';
import CaderninhoApiService, { Establishment } from '../services/caderninhoApiService';
import { EstablishmentType } from '../types/establishmentType';

interface EstablishmentDropdownProps {
  selectedEstablishment?: Establishment | null;
  onSelectEstablishment: (establishment: Establishment) => void;
  onAddNewEstablishment?: () => void;
  placeholder?: string;
  style?: any;
  disabled?: boolean;
}

// Função para converter enum para texto legível e ícone
const getEstablishmentTypeInfo = (type: EstablishmentType): { text: string; icon: string; color: string } => {
  switch (type) {
    case EstablishmentType.Supermarket:
      return { text: 'Mercado', icon: '🛒', color: '#4CAF50' };
    case EstablishmentType.ClothingStore:
      return { text: 'Loja de Roupas', icon: '�', color: '#E91E63' };
    case EstablishmentType.GasStation:
      return { text: 'Posto de Combustível', icon: '⛽', color: '#FF9800' };
    case EstablishmentType.OnlineService:
      return { text: 'Serviço Online', icon: '�', color: '#795548' };
    case EstablishmentType.Games:
      return { text: 'Games', icon: '🎮', color: '#9C27B0' };
    case EstablishmentType.DepartmentStore:
      return { text: 'Loja de Departamentos', icon: '🏬', color: '#607D8B' };
    case EstablishmentType.Restaurant:
      return { text: 'Restaurante', icon: '🍽️', color: '#FF6B35' };
    case EstablishmentType.Delivery:
      return { text: 'Delivery', icon: '�', color: '#FF5722' };
    case EstablishmentType.Charity:
      return { text: 'Caridade', icon: '❤️', color: '#E91E63' };
    case EstablishmentType.Church:
      return { text: 'Igreja', icon: '⛪', color: '#3F51B5' };
    case EstablishmentType.Events:
      return { text: 'Eventos', icon: '�', color: '#FF9800' };
    case EstablishmentType.Entertainment:
      return { text: 'Lazer', icon: '🎬', color: '#FF5722' };
    case EstablishmentType.Pharmacy:
      return { text: 'Farmácia', icon: '💊', color: '#2196F3' };
    case EstablishmentType.Health:
      return { text: 'Saúde', icon: '🏥', color: '#F44336' };
    case EstablishmentType.Other:
      return { text: 'Outros', icon: '🏪', color: '#757575' };
    default:
      return { text: 'Desconhecido', icon: '❓', color: '#757575' };
  }
};

export default function EstablishmentDropdown({
  selectedEstablishment,
  onSelectEstablishment,
  onAddNewEstablishment,
  placeholder = 'Selecione um estabelecimento...',
  style,
  disabled = false,
}: EstablishmentDropdownProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Função para buscar estabelecimentos com paginação
  const fetchEstablishments = async (searchText: string, pageNumber: number) => {
    try {
      const response = await CaderninhoApiService.establishments.getAll({
        searchText,
        pageNumber,
        pageSize: 20, // Tamanho da página
      });

      return {
        items: response.items,
        hasMore: response.hasNextPage,
      };
    } catch (error) {
      console.error('Erro ao buscar estabelecimentos:', error);
      return { items: [], hasMore: false };
    }
  };

  // Renderização customizada do item do estabelecimento
  const renderEstablishmentItem = (establishment: Establishment) => {
    const typeInfo = getEstablishmentTypeInfo(establishment.type);
    
    return (
      <View style={styles.establishmentItem}>
        <View style={styles.establishmentHeader}>
          <Text style={styles.establishmentIcon}>{typeInfo.icon}</Text>
          <View style={styles.establishmentInfo}>
            <Text style={styles.establishmentName}>{establishment.name}</Text>
            <View style={styles.establishmentTypeContainer}>
              <Text style={[styles.establishmentType, { color: typeInfo.color }]}>
                {typeInfo.text}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  // Handlers para o modal
  const handleAddNew = () => {
    if (onAddNewEstablishment) {
      onAddNewEstablishment(); // Chama o callback externo se fornecido
    } else {
      setShowAddModal(true); // Ou abre o modal interno
    }
  };

  const handleEstablishmentAdded = (newEstablishment: Establishment) => {
    // Incrementar refreshKey para forçar reload do dropdown
    setRefreshKey(prev => prev + 1);
    // Selecionar automaticamente o novo estabelecimento
    onSelectEstablishment(newEstablishment);
  };

  return (
    <>
      <SearchableDropdown<Establishment>
        key={refreshKey} // Forçar remount quando refreshKey mudar
        selectedItem={selectedEstablishment}
        onSelectItem={onSelectEstablishment}
        fetchData={fetchEstablishments}
        getItemId={(establishment) => establishment.id}
        getItemDisplayText={(establishment) => establishment.name}
        renderItem={renderEstablishmentItem}
        placeholder={placeholder}
        searchPlaceholder="Digite o nome do estabelecimento..."
        emptyMessage="Nenhum estabelecimento encontrado"
        addNewText="Adicionar novo estabelecimento"
        onAddNew={handleAddNew}
        style={style}
        disabled={disabled}
        keepOpenAfterAdd={true}
      />

      <AddEstablishmentModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onEstablishmentAdded={handleEstablishmentAdded}
        keepDropdownOpen={true}
      />
    </>
  );
}

const styles = StyleSheet.create({
  establishmentItem: {
    paddingVertical: 4,
  },
  establishmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  establishmentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  establishmentInfo: {
    flex: 1,
  },
  establishmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  establishmentTypeContainer: {
    alignSelf: 'flex-start',
  },
  establishmentType: {
    fontSize: 12,
    fontWeight: '500',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});