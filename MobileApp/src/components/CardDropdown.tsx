/**
 * Dropdown específico para seleção de cartões
 * Usa o SearchableDropdown genérico com configurações específicas para cartões
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SearchableDropdown from './SearchableDropdown';
import AddCardModal from './AddCardModal';
import CaderninhoApiService, { Card, CardBrand, CardType } from '../services/caderninhoApiService';

interface CardDropdownProps {
  selectedCard?: Card | null;
  onSelectCard: (card: Card) => void;
  onAddNewCard?: () => void;
  placeholder?: string;
  style?: any;
  disabled?: boolean;
}

// Função para converter enum para texto legível
const getCardTypeText = (type: CardType): string => {
  switch (type) {
    case CardType.Credit: return 'Crédito';
    case CardType.Debit: return 'Débito';
    case CardType.Voucher: return 'Voucher';
    default: return 'Desconhecido';
  }
};

const getCardBrandText = (brand: CardBrand): string => {
  switch (brand) {
    case CardBrand.Visa: return 'Visa';
    case CardBrand.Mastercard: return 'Mastercard';
    case CardBrand.Elo: return 'Elo';
    case CardBrand.AmericanExpress: return 'Amex';
    case CardBrand.Hipercard: return 'Hipercard';
    case CardBrand.Other: return 'Outro';
    default: return 'Desconhecido';
  }
};

export default function CardDropdown({
  selectedCard,
  onSelectCard,
  onAddNewCard,
  placeholder = 'Selecione um cartão...',
  style,
  disabled = false,
}: CardDropdownProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Função para buscar cartões com paginação
  const fetchCards = async (searchText: string, pageNumber: number) => {
    try {
      const response = await CaderninhoApiService.cards.getAll({
        searchText,
        pageNumber,
        pageSize: 20, // Tamanho da página
      });

      return {
        items: response.items,
        hasMore: response.hasNextPage,
      };
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
      return { items: [], hasMore: false };
    }
  };

  // Renderização customizada do item do cartão
  const renderCardItem = (card: Card) => (
    <View style={styles.cardItem}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardName}>{card.name}</Text>
        <Text style={styles.cardDigits}>**** {card.lastFourDigits}</Text>
      </View>
      <View style={styles.cardDetails}>
        <Text style={styles.cardType}>{getCardTypeText(card.type)}</Text>
        <Text style={styles.cardBrand}>{getCardBrandText(card.brand)}</Text>
      </View>
    </View>
  );

  // Handlers para o modal
  const handleAddNew = () => {
    if (onAddNewCard) {
      onAddNewCard(); // Chama o callback externo se fornecido
    } else {
      setShowAddModal(true); // Ou abre o modal interno
    }
  };

  const handleCardAdded = (newCard: Card) => {
    // Incrementar refreshKey para forçar reload do dropdown
    setRefreshKey(prev => prev + 1);
    // Selecionar automaticamente o novo cartão
    onSelectCard(newCard);
  };

  return (
    <>
      <SearchableDropdown<Card>
        key={refreshKey} // Forçar remount quando refreshKey mudar
        selectedItem={selectedCard}
        onSelectItem={onSelectCard}
        fetchData={fetchCards}
        getItemId={(card) => card.id}
        getItemDisplayText={(card) => `${card.name} **** ${card.lastFourDigits}`}
        renderItem={renderCardItem}
        placeholder={placeholder}
        searchPlaceholder="Digite o nome do cartão..."
        emptyMessage="Nenhum cartão encontrado"
        addNewText="Adicionar novo cartão"
        onAddNew={handleAddNew}
        style={style}
        disabled={disabled}
        keepOpenAfterAdd={true}
      />

      <AddCardModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCardAdded={handleCardAdded}
      />
    </>
  );
}

const styles = StyleSheet.create({
  cardItem: {
    paddingVertical: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  cardDigits: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  cardDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  cardType: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardBrand: {
    fontSize: 12,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});