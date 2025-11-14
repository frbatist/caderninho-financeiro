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
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { 
  CreateMonthlySpendingLimitDto
} from '../services/caderninhoApiService';
import { showAlert } from '../utils/alerts';
import { 
  EstablishmentType, 
  getEstablishmentTypeOptionsWithIcons,
  getEstablishmentTypeIcon,
  getEstablishmentTypeName
} from '../types/establishmentType';

type AddMonthlySpendingLimitScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMonthlySpendingLimit'>;
type AddMonthlySpendingLimitScreenRouteProp = RouteProp<RootStackParamList, 'AddMonthlySpendingLimit'>;

type AddMonthlySpendingLimitScreenProps = {
  navigation: AddMonthlySpendingLimitScreenNavigationProp;
  route: AddMonthlySpendingLimitScreenRouteProp;
};

// Opções de tipo de estabelecimento
const establishmentTypeOptions = getEstablishmentTypeOptionsWithIcons();

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
  
  // Estados dos modais
  const [typeModalVisible, setTypeModalVisible] = useState(false);
  const [monthModalVisible, setMonthModalVisible] = useState(false);

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
        showAlert('Sucesso', 'Limite de gasto adicionado com sucesso!');
      }, 300);
    } catch (error: any) {
      console.error('Erro ao criar limite de gasto:', error);
      
      // Verificar se é erro de duplicação
      if (error?.response?.status === 400 && error?.response?.data?.includes('já existe')) {
        showAlert('Erro', 'Já existe um limite para este tipo de estabelecimento neste mês e ano.');
      } else {
        showAlert('Erro', 'Não foi possível adicionar o limite de gasto. Tente novamente.');
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

  // Renderizar campo de seleção (abre modal)
  const renderDropdownField = (
    label: string,
    value: string,
    onPress: () => void,
    error?: string
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label} *</Text>
      <TouchableOpacity
        style={[styles.dropdownButton, error && styles.inputError]}
        onPress={onPress}
      >
        <Text style={styles.dropdownButtonText}>{value}</Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  // Renderizar modal de seleção
  const renderSelectionModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: { value: any; label: string; icon?: string }[],
    selectedValue: any,
    onSelect: (value: any) => void
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  selectedValue === item.value && styles.modalOptionSelected
                ]}
                onPress={() => {
                  onSelect(item.value);
                  onClose();
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  selectedValue === item.value && styles.modalOptionTextSelected
                ]}>
                  {item.icon ? `${item.icon} ${item.label}` : item.label}
                </Text>
                {selectedValue === item.value && (
                  <Text style={styles.modalOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Novo Limite de Gasto</Text>

        {/* Tipo de Estabelecimento */}
        {renderDropdownField(
          'Tipo de Estabelecimento',
          `${getEstablishmentTypeIcon(establishmentType)} ${getEstablishmentTypeName(establishmentType)}`,
          () => setTypeModalVisible(true),
          errors.establishmentType
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
          <View style={styles.halfWidth}>
            {renderDropdownField(
              'Mês',
              monthOptions.find(m => m.value === month)?.label || '',
              () => setMonthModalVisible(true),
              errors.month
            )}
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Ano *</Text>
            <TextInput
              style={[styles.input, errors.year && styles.inputError]}
              placeholder="Ex: 2025"
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

      {/* Modais de Seleção */}
      {renderSelectionModal(
        typeModalVisible,
        () => setTypeModalVisible(false),
        'Selecionar Tipo de Estabelecimento',
        establishmentTypeOptions,
        establishmentType,
        (value) => {
          setEstablishmentType(value);
          updateField('establishmentType');
        }
      )}

      {renderSelectionModal(
        monthModalVisible,
        () => setMonthModalVisible(false),
        'Selecionar Mês',
        monthOptions,
        month,
        (value) => {
          setMonth(value);
          updateField('month');
        }
      )}
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
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    flex: 1,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
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
  dropdownButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 24,
    color: '#666',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalOptionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  modalOptionCheck: {
    fontSize: 20,
    color: '#007AFF',
    marginLeft: 8,
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
