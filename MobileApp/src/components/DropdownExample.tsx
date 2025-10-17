/**
 * Exemplo de como usar os componentes de dropdown com modais integrados
 * Este arquivo demonstra o uso dos dropdowns de Cartão e Estabelecimento
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import CardDropdown from './CardDropdown';
import EstablishmentDropdown from './EstablishmentDropdown';
import { Card, Establishment } from '../services/caderninhoApiService';

export default function DropdownExample() {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);

  const handleCardSelect = (card: Card) => {
    setSelectedCard(card);
    console.log('Cartão selecionado:', card);
  };

  const handleEstablishmentSelect = (establishment: Establishment) => {
    setSelectedEstablishment(establishment);
    console.log('Estabelecimento selecionado:', establishment);
  };

  const clearSelections = () => {
    setSelectedCard(null);
    setSelectedEstablishment(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exemplo de Dropdowns</Text>
      
      <View style={styles.section}>
        <Text style={styles.label}>Cartão:</Text>
        <CardDropdown
          selectedCard={selectedCard}
          onSelectCard={handleCardSelect}
        />
        {selectedCard && (
          <Text style={styles.selectedInfo}>
            Selecionado: {selectedCard.name} (**** {selectedCard.lastFourDigits})
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Estabelecimento:</Text>
        <EstablishmentDropdown
          selectedEstablishment={selectedEstablishment}
          onSelectEstablishment={handleEstablishmentSelect}
        />
        {selectedEstablishment && (
          <Text style={styles.selectedInfo}>
            Selecionado: {selectedEstablishment.name}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearSelections}
        >
          <Text style={styles.clearButtonText}>Limpar Seleções</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  selectedInfo: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});