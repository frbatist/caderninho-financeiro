/**
 * Tela para adicionar novo estabelecimento
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService from '../services/caderninhoApiService';
import { EstablishmentType, establishmentTypeNames, getEstablishmentTypeIcon } from '../types/establishmentType';

type AddEstablishmentScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'AddEstablishment'>;
  route: RouteProp<RootStackParamList, 'AddEstablishment'>;
};

export default function AddEstablishmentScreen({ navigation, route }: AddEstablishmentScreenProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<EstablishmentType>(EstablishmentType.Other);
  const [loading, setLoading] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const { onEstablishmentAdded } = route.params;

  /**
   * Valida e salva o estabelecimento
   */
  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome do estabelecimento é obrigatório');
      return;
    }

    try {
      setLoading(true);
      await CaderninhoApiService.establishments.create({
        name: name.trim(),
        type,
      });

      Alert.alert('Sucesso', 'Estabelecimento criado com sucesso!', [
        {
          text: 'OK',
          onPress: () => {
            onEstablishmentAdded();
            navigation.goBack();
          },
        },
      ]);
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      Alert.alert('Erro', 'Não foi possível criar o estabelecimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Novo Estabelecimento</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Nome *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Ex: Supermercado ABC"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Tipo *</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setShowTypeDropdown(!showTypeDropdown)}
        >
          <Text style={styles.dropdownButtonText}>
            {getEstablishmentTypeIcon(type)} {establishmentTypeNames[type]}
          </Text>
          <Text style={styles.dropdownArrow}>{showTypeDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showTypeDropdown && (
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
                    setType(item.value);
                    setShowTypeDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>
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
  content: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#34C759',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
