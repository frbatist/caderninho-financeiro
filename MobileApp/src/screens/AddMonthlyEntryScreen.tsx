/**
 * Tela de Adicionar Entrada Mensal
 * Permite criar uma entrada mensal recorrente
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
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { 
  CreateMonthlyEntryDto, 
  MonthlyEntryType,
  OperationType 
} from '../services/caderninhoApiService';
import { showAlert } from '../utils/alerts';

type AddMonthlyEntryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddMonthlyEntry'>;
type AddMonthlyEntryScreenRouteProp = RouteProp<RootStackParamList, 'AddMonthlyEntry'>;

type AddMonthlyEntryScreenProps = {
  navigation: AddMonthlyEntryScreenNavigationProp;
  route: AddMonthlyEntryScreenRouteProp;
};

// Opções de tipo de entrada
const entryTypeOptions = [
  { value: MonthlyEntryType.Salary, label: 'Salário', icon: '💰' },
  { value: MonthlyEntryType.Tax, label: 'Imposto', icon: '🏛️' },
  { value: MonthlyEntryType.MonthlyBill, label: 'Conta Mensal', icon: '📄' },
  { value: MonthlyEntryType.Other, label: 'Outro', icon: '📌' },
];

// Opções de operação
const operationOptions = [
  { value: OperationType.Income, label: 'Entrada', icon: '💰', color: '#4CAF50' },
  { value: OperationType.Expense, label: 'Saída', icon: '💸', color: '#F44336' },
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

export default function AddMonthlyEntryScreen({ navigation }: AddMonthlyEntryScreenProps) {
  // Estados do formulário
  const currentDate = new Date();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<MonthlyEntryType>(MonthlyEntryType.Salary);
  const [operation, setOperation] = useState<OperationType>(OperationType.Income);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (description.trim().length > 200) {
      newErrors.description = 'Descrição deve ter no máximo 200 caracteres';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Valor é obrigatório';
    } else {
      const numericAmount = parseFloat(amount.replace(',', '.'));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        newErrors.amount = 'Valor deve ser maior que zero';
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
      const numericAmount = parseFloat(amount.replace(',', '.'));
      
      const entryData: CreateMonthlyEntryDto = {
        description: description.trim(),
        amount: numericAmount,
        type,
        operation,
        month,
        year,
      };

      await CaderninhoApiService.monthlyEntries.create(entryData);

      // Voltar automaticamente para a tela de entradas mensais
      navigation.goBack();
      
      // Mostrar toast de sucesso
      setTimeout(() => {
        showAlert('Sucesso', 'Entrada mensal adicionada com sucesso!');
      }, 300);
    } catch (error) {
      console.error('Erro ao criar entrada mensal:', error);
      showAlert('Erro', 'Não foi possível adicionar a entrada mensal. Tente novamente.');
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

  // Renderizar botões de escolha
  const renderChoiceButtons = <T,>(
    options: { value: T; label: string; icon?: string; color?: string }[],
    selectedValue: T,
    onSelect: (value: T) => void,
    error?: string
  ) => (
    <View>
      <View style={styles.choiceContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={String(option.value)}
            style={[
              styles.choiceButton,
              selectedValue === option.value && styles.choiceButtonSelected,
              option.color && selectedValue === option.value && { backgroundColor: option.color },
            ]}
            onPress={() => onSelect(option.value)}
          >
            {option.icon && <Text style={styles.choiceIcon}>{option.icon}</Text>}
            <Text
              style={[
                styles.choiceText,
                selectedValue === option.value && styles.choiceTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Tipo de Operação */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tipo de Operação *</Text>
          {renderChoiceButtons(operationOptions, operation, setOperation)}
        </View>

        {/* Tipo de Entrada */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Categoria *</Text>
          {renderChoiceButtons(entryTypeOptions, type, setType)}
        </View>

        {/* Descrição */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, errors.description && styles.inputError]}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              updateField('description');
            }}
            placeholder="Ex: Salário CLT, Aluguel, Luz, etc."
            maxLength={200}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          <Text style={styles.helperText}>{description.length}/200 caracteres</Text>
        </View>

        {/* Valor */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Valor (R$) *</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            value={amount}
            onChangeText={(text) => {
              setAmount(text);
              updateField('amount');
            }}
            placeholder="0,00"
            keyboardType="decimal-pad"
          />
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        {/* Mês e Ano */}
        <View style={styles.rowContainer}>
          <View style={[styles.fieldContainer, styles.halfField]}>
            <Text style={styles.label}>Mês *</Text>
            <View style={styles.pickerContainer}>
              {monthOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pickerOption,
                    month === option.value && styles.pickerOptionSelected,
                  ]}
                  onPress={() => {
                    setMonth(option.value);
                    updateField('month');
                  }}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      month === option.value && styles.pickerTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.month && <Text style={styles.errorText}>{errors.month}</Text>}
          </View>

          <View style={[styles.fieldContainer, styles.halfField]}>
            <Text style={styles.label}>Ano *</Text>
            <TextInput
              style={[styles.input, errors.year && styles.inputError]}
              value={year.toString()}
              onChangeText={(text) => {
                const numYear = parseInt(text) || currentDate.getFullYear();
                setYear(numYear);
                updateField('year');
              }}
              placeholder="2025"
              keyboardType="number-pad"
              maxLength={4}
            />
            {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
          </View>
        </View>

        {/* Resumo */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Resumo</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tipo:</Text>
            <Text style={styles.summaryValue}>
              {operation === OperationType.Income ? '💰 Entrada' : '💸 Saída'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Categoria:</Text>
            <Text style={styles.summaryValue}>
              {entryTypeOptions.find(o => o.value === type)?.label || '—'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Período:</Text>
            <Text style={styles.summaryValue}>
              {monthOptions.find(m => m.value === month)?.label || '—'}/{year}
            </Text>
          </View>
          {amount && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Valor:</Text>
              <Text style={[
                styles.summaryValue,
                styles.summaryValueBold,
                operation === OperationType.Income ? styles.summaryIncome : styles.summaryExpense
              ]}>
                R$ {parseFloat(amount.replace(',', '.') || '0').toFixed(2).replace('.', ',')}
              </Text>
            </View>
          )}
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
            style={[styles.button, styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>Adicionar</Text>
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
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  choiceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  choiceButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  choiceIcon: {
    fontSize: 20,
  },
  choiceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  choiceTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pickerOption: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pickerText: {
    fontSize: 12,
    color: '#333',
  },
  pickerTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  summaryContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryIncome: {
    color: '#4CAF50',
  },
  summaryExpense: {
    color: '#F44336',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
