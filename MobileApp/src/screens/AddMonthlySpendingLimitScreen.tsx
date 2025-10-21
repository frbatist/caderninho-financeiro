/**
 * Tela de Adicionar Limite de Gasto Mensal
 * Permite criar um limite de gasto para um tipo de estabelecimento
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { 
  CreateMonthlySpendingLimitDto
} from '../services/caderninhoApiService';
import { EstablishmentType } from '../types/establishmentType';

type AddMonthlySpendingLimitScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMonthlySpendingLimit'>;
type AddMonthlySpendingLimitScreenRouteProp = RouteProp<RootStackParamList, 'AddMonthlySpendingLimit'>;

type AddMonthlySpendingLimitScreenProps = {
  navigation: AddMonthlySpendingLimitScreenNavigationProp;
  route: AddMonthlySpendingLimitScreenRouteProp;
};

// Opções de tipo de estabelecimento
const establishmentTypeOptions = [
  { value: EstablishmentType.Supermarket, label: 'Mercado', icon: '🛒' },
  { value: EstablishmentType.ClothingStore, label: 'Loja de Roupas', icon: '�' },
  { value: EstablishmentType.GasStation, label: 'Posto de Combustível', icon: '⛽' },
  { value: EstablishmentType.OnlineService, label: 'Serviço Online', icon: '�' },
  { value: EstablishmentType.Games, label: 'Games', icon: '🎮' },
  { value: EstablishmentType.DepartmentStore, label: 'Loja de Departamentos', icon: '🏬' },
  { value: EstablishmentType.Restaurant, label: 'Restaurante', icon: '🍽️' },
  { value: EstablishmentType.Delivery, label: 'Delivery', icon: '�' },
  { value: EstablishmentType.Charity, label: 'Caridade', icon: '❤️' },
  { value: EstablishmentType.Church, label: 'Igreja', icon: '⛪' },
  { value: EstablishmentType.Events, label: 'Eventos', icon: '�' },
  { value: EstablishmentType.Entertainment, label: 'Lazer', icon: '🎬' },
  { value: EstablishmentType.Pharmacy, label: 'Farmácia', icon: '💊' },
  { value: EstablishmentType.Health, label: 'Saúde', icon: '🏥' },
  { value: EstablishmentType.Other, label: 'Outros', icon: '🏪' },
];

// Opções de mês
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

export default function AddMonthlySpendingLimitScreen({ navigation }: AddMonthlySpendingLimitScreenProps) {
  // Estados do formulário
  const currentDate = new Date();
  const [establishmentType, setEstablishmentType] = useState<EstablishmentType>(EstablishmentType.Restaurant);
  const [limitAmount, setLimitAmount] = useState('');
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!limitAmount.trim()) {
      newErrors.limitAmount = 'Valor do limite é obrigatório';
    } else {
      const numericAmount = parseFloat(limitAmount.replace(',', '.'));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        newErrors.limitAmount = 'Valor deve ser maior que zero';
      }
    }

    if (month < 1 || month > 12) {
      newErrors.month = 'Mês inválido';
    }

    if (year < 2000 || year > 2100) {
      newErrors.year = 'Ano inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const numericAmount = parseFloat(limitAmount.replace(',', '.'));
      
      const limitData: CreateMonthlySpendingLimitDto = {
        establishmentType,
        limitAmount: numericAmount,
        month,
        year,
      };

      await CaderninhoApiService.monthlySpendingLimits.create(limitData);

      // Voltar automaticamente para a tela de limites
      navigation.goBack();
      
      // Mostrar toast de sucesso
      setTimeout(() => {
        Alert.alert('Sucesso', 'Limite de gasto adicionado com sucesso!');
      }, 300);
    } catch (error: any) {
      console.error('Erro ao criar limite de gasto:', error);
      
      // Verificar se é erro de duplicação
      if (error?.response?.status === 400 && error?.response?.data?.includes('já existe')) {
        Alert.alert('Erro', 'Já existe um limite para este tipo de estabelecimento neste mês e ano.');
      } else {
        Alert.alert('Erro', 'Não foi possível adicionar o limite de gasto. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo e limpar erro
  const updateField = (field: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  // Renderizar opções de seleção
  const renderSelector = (
    options: { value: any; label: string; icon?: string }[],
    selectedValue: any,
    onSelect: (value: any) => void,
    title: string
  ) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.selectorScroll}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectorOption,
              selectedValue === option.value && styles.selectorOptionSelected,
            ]}
            onPress={() => onSelect(option.value)}
          >
            {option.icon && (
              <Text style={styles.selectorIcon}>{option.icon}</Text>
            )}
            <Text
              style={[
                styles.selectorText,
                selectedValue === option.value && styles.selectorTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Novo Limite de Gasto</Text>

        {/* Tipo de Estabelecimento */}
        {renderSelector(
          establishmentTypeOptions,
          establishmentType,
          (value) => {
            setEstablishmentType(value);
            updateField('establishmentType');
          },
          'Tipo de Estabelecimento'
        )}

        {/* Valor do Limite */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Valor do Limite (R$) *</Text>
          <TextInput
            style={[styles.input, errors.limitAmount && styles.inputError]}
            placeholder="Ex: 500.00"
            value={limitAmount}
            onChangeText={(text) => {
              setLimitAmount(text);
              updateField('limitAmount');
            }}
            keyboardType="decimal-pad"
          />
          {errors.limitAmount && (
            <Text style={styles.errorText}>{errors.limitAmount}</Text>
          )}
        </View>

        {/* Mês e Ano */}
        <View style={styles.rowGroup}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Mês *</Text>
            <View style={styles.pickerContainer}>
              {monthOptions.map((monthOption) => (
                <TouchableOpacity
                  key={monthOption.value}
                  style={[
                    styles.pickerOption,
                    month === monthOption.value && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setMonth(monthOption.value);
                    updateField('month');
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      month === monthOption.value && styles.pickerOptionTextSelected,
                    ]}
                  >
                    {monthOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.month && <Text style={styles.errorText}>{errors.month}</Text>}
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Ano *</Text>
            <TextInput
              style={[styles.input, errors.year && styles.inputError]}
              placeholder="Ex: 2024"
              value={year.toString()}
              onChangeText={(text) => {
                setYear(parseInt(text) || currentDate.getFullYear());
                updateField('year');
              }}
              keyboardType="number-pad"
              maxLength={4}
            />
            {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
          </View>
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Adicionar Limite</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  selectorContainer: {
    marginBottom: 24,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  selectorScroll: {
    gap: 12,
  },
  selectorOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    minWidth: 120,
  },
  selectorOptionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#e3f2fd',
  },
  selectorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  selectorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectorTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#f44336',
  },
  errorText: {
    fontSize: 12,
    color: '#f44336',
    marginTop: 4,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxHeight: 200,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
