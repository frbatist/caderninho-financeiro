/**
 * Tela de gerenciamento de cartões
 * Permite visualizar, adicionar, editar e excluir cartões
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { Card, CardType, CardBrand } from '../services/caderninhoApiService';
import AddCardModal from '../components/AddCardModal';

type CardsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Cards'>;
};

export default function CardsScreen({ navigation }: CardsScreenProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Carregar dados quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [])
  );

  /**
   * Carrega a lista de cartões
   */
  const loadCards = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const response = await CaderninhoApiService.cards.getAll({
        pageSize: 1000,
      });
      setCards(response.items);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      Alert.alert('Erro', 'Não foi possível carregar os cartões');
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
    loadCards(false);
  };

  /**
   * Callback quando um cartão é adicionado
   */
  const handleCardAdded = (newCard: Card) => {
    setCards((prev) => [newCard, ...prev]);
  };

  /**
   * Excluir cartão
   */
  const handleDeleteCard = (card: Card) => {
    Alert.alert(
      'Excluir Cartão',
      `Deseja realmente excluir o cartão "${card.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Como não há método delete na API, apenas removemos da lista
              // Se houver um método delete na API, descomente a linha abaixo
              // await CaderninhoApiService.cards.delete(card.id);
              Alert.alert('Aviso', 'Funcionalidade de exclusão não disponível na API');
              // setCards((prev) => prev.filter((c) => c.id !== card.id));
            } catch (error) {
              console.error('Erro ao excluir cartão:', error);
              Alert.alert('Erro', 'Não foi possível excluir o cartão');
            }
          },
        },
      ]
    );
  };

  /**
   * Formata o tipo do cartão
   */
  const formatCardType = (type: CardType): string => {
    switch (type) {
      case CardType.Credit:
        return 'Crédito';
      case CardType.Debit:
        return 'Débito';
      case CardType.Voucher:
        return 'Voucher';
      default:
        return 'Desconhecido';
    }
  };

  /**
   * Formata a bandeira do cartão
   */
  const formatCardBrand = (brand: CardBrand): string => {
    switch (brand) {
      case CardBrand.Visa:
        return 'Visa';
      case CardBrand.Mastercard:
        return 'Mastercard';
      case CardBrand.Elo:
        return 'Elo';
      case CardBrand.AmericanExpress:
        return 'American Express';
      case CardBrand.Hipercard:
        return 'Hipercard';
      case CardBrand.Other:
        return 'Outro';
      default:
        return 'Desconhecido';
    }
  };

  /**
   * Retorna o emoji da bandeira
   */
  const getCardBrandEmoji = (brand: CardBrand): string => {
    switch (brand) {
      case CardBrand.Visa:
        return '💳';
      case CardBrand.Mastercard:
        return '💳';
      case CardBrand.Elo:
        return '💳';
      case CardBrand.AmericanExpress:
        return '💳';
      case CardBrand.Hipercard:
        return '💳';
      default:
        return '💳';
    }
  };

  /**
   * Retorna cor baseada no tipo do cartão
   */
  const getCardColor = (type: CardType): string => {
    switch (type) {
      case CardType.Credit:
        return '#007AFF';
      case CardType.Debit:
        return '#34C759';
      case CardType.Voucher:
        return '#FF9500';
      default:
        return '#8E8E93';
    }
  };

  /**
   * Renderiza um item da lista
   */
  const renderCardItem = ({ item }: { item: Card }) => (
    <TouchableOpacity
      style={styles.cardItem}
      onLongPress={() => handleDeleteCard(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.cardIconContainer, { backgroundColor: getCardColor(item.type) }]}>
        <Text style={styles.cardIcon}>{getCardBrandEmoji(item.brand)}</Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.cardDetails}>
          <Text style={styles.cardType}>{formatCardType(item.type)}</Text>
          <Text style={styles.cardSeparator}>•</Text>
          <Text style={styles.cardBrand}>{formatCardBrand(item.brand)}</Text>
        </View>
        <Text style={styles.cardDigits}>**** {item.lastFourDigits}</Text>
        {item.closingDay && (
          <Text style={styles.cardClosing}>Fechamento: dia {item.closingDay}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  /**
   * Mensagem quando não há cartões
   */
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>💳</Text>
      <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
      <Text style={styles.emptySubtext}>Toque no botão + para adicionar um cartão</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Carregando cartões...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cards}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={cards.length === 0 ? styles.emptyList : styles.list}
            ListEmptyComponent={renderEmptyList}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />

          {/* Botão de adicionar */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>

          {/* Modal de adicionar cartão */}
          <AddCardModal
            visible={showAddModal}
            onClose={() => setShowAddModal(false)}
            onCardAdded={handleCardAdded}
            keepDropdownOpen={false}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  list: {
    padding: 15,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  cardItem: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 14,
    color: '#666',
  },
  cardSeparator: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 6,
  },
  cardBrand: {
    fontSize: 14,
    color: '#666',
  },
  cardDigits: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  cardClosing: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
});
