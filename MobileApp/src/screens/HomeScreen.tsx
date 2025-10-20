/**
 * Tela inicial do aplicativo
 * Mostra resumo financeiro e navegação principal
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Seu controle financeiro pessoal</Text>
        </View>

        {/* Card de resumo */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Saldo Total</Text>
          <Text style={styles.summaryAmount}>R$ 0,00</Text>
          <View style={styles.summaryDetails}>
            <View>
              <Text style={styles.summaryLabel}>Receitas</Text>
              <Text style={[styles.summaryValue, styles.income]}>R$ 0,00</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>Despesas</Text>
              <Text style={[styles.summaryValue, styles.expense]}>R$ 0,00</Text>
            </View>
          </View>
        </View>

        {/* Menu de navegação */}
        <View style={styles.menuGrid}>
          <MenuButton
            title="Despesas"
            icon="💳"
            onPress={() => navigation.navigate('Expenses')}
          />
          <MenuButton
            title="Entradas Mensais"
            icon="💵"
            onPress={() => navigation.navigate('MonthlyEntries')}
          />
          <MenuButton
            title="Transações"
            icon="💰"
            onPress={() => navigation.navigate('Transactions')}
          />
          <MenuButton
            title="Contas"
            icon="🏦"
            onPress={() => navigation.navigate('Accounts')}
          />
          <MenuButton
            title="Cartões"
            icon="🃏"
            onPress={() => navigation.navigate('Cards')}
          />
          <MenuButton
            title="Categorias"
            icon="📊"
            onPress={() => navigation.navigate('Categories')}
          />
        </View>

        {/* Informação */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Esta é uma aplicação em desenvolvimento.{'\n'}
            Configure a URL da API em src/constants/api.ts
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

/**
 * Componente de botão de menu
 */
function MenuButton({ title, icon, onPress }: { title: string; icon: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  summaryTitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
  },
  summaryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  income: {
    color: '#4CD964',
  },
  expense: {
    color: '#FF3B30',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  menuButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  infoText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
});
