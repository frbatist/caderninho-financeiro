/**
 * Tela de Adicionar/Editar Despesa
 * Permite criar ou editar uma despesa com validação e integração com a API
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
import { EstablishmentDropdown, CardDropdown } from '../components';
import CaderninhoApiService, { 
  CreateExpenseDto, 
  PaymentType, 
  Card, 
  Establishment 
} from '../services/caderninhoApiService';

type AddExpenseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddExpense'>;
type AddExpenseScreenRouteProp = RouteProp<RootStackParamList, 'AddExpense'>;

type AddExpenseScreenProps = {
  navigation: AddExpenseScreenNavigationProp;
  route: AddExpenseScreenRouteProp;
};

// Opções de tipo de pagamento
const paymentTypeOptions = [
  { value: PaymentType.CreditCard, label: 'Cartão de Crédito', icon: '💳', requiresCard: true },
  { value: PaymentType.DebitCard, label: 'Cartão de Débito', icon: '💳', requiresCard: true },
  { value: PaymentType.Cash, label: 'Dinheiro', icon: '💵', requiresCard: false },
  { value: PaymentType.Pix, label: 'PIX', icon: '📱', requiresCard: false },
  { value: PaymentType.Deposit, label: 'Depósito', icon: '🏦', requiresCard: false },
  { value: PaymentType.BankSlip, label: 'Boleto', icon: '🧾', requiresCard: false },
];

export default function AddExpenseScreen({ navigation, route }: AddExpenseScreenProps) {
  // Estados do formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Formato YYYY-MM-DD
  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.CreditCard);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [installmentCount, setInstallmentCount] = useState('1');

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Verificar se o tipo de pagamento requer cartão
  const requiresCard = paymentTypeOptions.find(opt => opt.value === paymentType)?.requiresCard || false;

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!amount.trim()) {
      newErrors.amount = 'Valor é obrigatório';
    } else {
      const numericAmount = parseFloat(amount.replace(',', '.'));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        newErrors.amount = 'Valor deve ser maior que zero';
      }
    }

    if (!date.trim()) {
      newErrors.date = 'Data é obrigatória';
    } else {
      // Validar formato YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        newErrors.date = 'Data inválida. Use o formato AAAA-MM-DD';
      } else {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          newErrors.date = 'Data inválida';
        }
      }
    }

    if (!selectedEstablishment) {
      newErrors.establishment = 'Estabelecimento é obrigatório';
    }

    if (requiresCard && !selectedCard) {
      newErrors.card = 'Cartão é obrigatório para este tipo de pagamento';
    }

    const installments = parseInt(installmentCount);
    if (isNaN(installments) || installments < 1 || installments > 60) {
      newErrors.installmentCount = 'Parcelas devem estar entre 1 e 60';
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
      
      const expenseData: CreateExpenseDto = {
        description: description.trim(),
        establishmentId: selectedEstablishment!.id,
        amount: numericAmount,
        date: date, // Data no formato YYYY-MM-DD
        paymentType,
        cardId: requiresCard ? selectedCard?.id : undefined,
        installmentCount: parseInt(installmentCount),
      };

      await CaderninhoApiService.expenses.create(expenseData);

      // Voltar automaticamente para a tela de despesas
      navigation.goBack();
      
      // Mostrar toast de sucesso (não bloqueia a navegação)
      // O Alert aparecerá na tela anterior
      setTimeout(() => {
        Alert.alert('Sucesso', 'Despesa adicionada com sucesso!');
      }, 300);
    } catch (error) {
      console.error('Erro ao criar despesa:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a despesa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo e limpar erro
  const updateField = (field: string, value: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Descrição */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, errors.description && styles.inputError]}
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              updateField('description', text);
            }}
            placeholder="Ex: Almoço, Compras do mês, etc."
            editable={!loading}
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Valor */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Valor (R$) *</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            value={amount}
            onChangeText={(text) => {
              // Permitir apenas números, vírgula e ponto
              const filtered = text.replace(/[^0-9.,]/g, '');
              setAmount(filtered);
              updateField('amount', filtered);
            }}
            placeholder="0,00"
            keyboardType="decimal-pad"
            editable={!loading}
          />
          {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
        </View>

        {/* Data */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Data *</Text>
          <TextInput
            style={[styles.input, errors.date && styles.inputError]}
            value={date}
            onChangeText={(text) => {
              setDate(text);
              updateField('date', text);
            }}
            placeholder="YYYY-MM-DD"
            editable={!loading}
          />
          {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          <Text style={styles.helperText}>Formato: AAAA-MM-DD (ex: 2025-10-20)</Text>
        </View>

        {/* Tipo de Pagamento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tipo de Pagamento *</Text>
          <View style={styles.paymentTypeGrid}>
            {paymentTypeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.paymentTypeOption,
                  paymentType === option.value && styles.paymentTypeOptionSelected
                ]}
                onPress={() => {
                  setPaymentType(option.value);
                  // Limpar cartão se mudar para tipo que não requer
                  if (!option.requiresCard) {
                    setSelectedCard(null);
                    const newErrors = { ...errors };
                    delete newErrors.card;
                    setErrors(newErrors);
                  }
                }}
                disabled={loading}
              >
                <Text style={styles.paymentTypeIcon}>{option.icon}</Text>
                <Text style={[
                  styles.paymentTypeText,
                  paymentType === option.value && styles.paymentTypeTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Estabelecimento */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Estabelecimento *</Text>
          <EstablishmentDropdown
            selectedEstablishment={selectedEstablishment}
            onSelectEstablishment={(establishment) => {
              setSelectedEstablishment(establishment);
              updateField('establishment', establishment.name);
            }}
            disabled={loading}
          />
          {errors.establishment && <Text style={styles.errorText}>{errors.establishment}</Text>}
        </View>

        {/* Cartão (apenas se tipo requer cartão) */}
        {requiresCard && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Cartão *</Text>
            <CardDropdown
              selectedCard={selectedCard}
              onSelectCard={(card) => {
                setSelectedCard(card);
                updateField('card', card.name);
              }}
              disabled={loading}
            />
            {errors.card && <Text style={styles.errorText}>{errors.card}</Text>}
          </View>
        )}

        {/* Parcelas (apenas para cartão de crédito) */}
        {paymentType === PaymentType.CreditCard && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Número de Parcelas</Text>
            <TextInput
              style={[styles.input, errors.installmentCount && styles.inputError]}
              value={installmentCount}
              onChangeText={(text) => {
                const filtered = text.replace(/[^0-9]/g, '');
                setInstallmentCount(filtered);
                updateField('installmentCount', filtered);
              }}
              placeholder="1"
              keyboardType="numeric"
              editable={!loading}
            />
            {errors.installmentCount && <Text style={styles.errorText}>{errors.installmentCount}</Text>}
          </View>
        )}

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Despesa</Text>
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
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  paymentTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  paymentTypeOption: {
    width: '48%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTypeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  paymentTypeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  paymentTypeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  paymentTypeTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});