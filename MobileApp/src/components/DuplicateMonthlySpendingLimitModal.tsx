/**
 * Modal para duplicar limite de gasto mensal para o próximo mês
 * Permite editar o valor antes de confirmar
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MonthlySpendingLimit } from '../services/caderninhoApiService';
import { EstablishmentType, establishmentTypeNames } from '../types/establishmentType';

interface DuplicateMonthlySpendingLimitModalProps {
  visible: boolean;
  limit: MonthlySpendingLimit | null;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
}

export default function DuplicateMonthlySpendingLimitModal({
  visible,
  limit,
  onClose,
  onConfirm,
}: DuplicateMonthlySpendingLimitModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Atualizar valor quando o limite mudar
  useEffect(() => {
    if (limit) {
      setAmount(limit.limitAmount.toString());
    }
  }, [limit]);

  // Calcular próximo mês
  const getNextMonthYear = () => {
    if (!limit) return { month: '', year: '' };
    
    let nextMonth = limit.month + 1;
    let nextYear = limit.year;
    
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear++;
    }
    
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    return {
      month: monthNames[nextMonth - 1],
      year: nextYear.toString(),
    };
  };

  // Obter nome legível do tipo de estabelecimento
  const getEstablishmentTypeName = (type: EstablishmentType) => {
    return establishmentTypeNames[type] || 'Outros';
  };

  // Confirmar duplicação
  const handleConfirm = async () => {
    const numericAmount = parseFloat(amount);
    
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return;
    }
    
    setLoading(true);
    try {
      await onConfirm(numericAmount);
      onClose();
    } catch (error) {
      console.error('Erro ao duplicar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formatar valor como moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  if (!limit) return null;

  const nextDate = getNextMonthYear();
  const numericAmount = parseFloat(amount);
  const isValidAmount = !isNaN(numericAmount) && numericAmount > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Duplicar para o Próximo Mês</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Tipo de Estabelecimento:</Text>
            <Text style={styles.description}>
              {getEstablishmentTypeName(limit.establishmentType)}
            </Text>

            <Text style={styles.label}>Será duplicado para:</Text>
            <Text style={styles.nextMonth}>
              {nextDate.month} / {nextDate.year}
            </Text>

            <Text style={styles.label}>Valor do Limite:</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0,00"
                editable={!loading}
              />
            </View>

            {isValidAmount && (
              <Text style={styles.formattedValue}>
                {formatCurrency(numericAmount)}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                (!isValidAmount || loading) && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!isValidAmount || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nextMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 12,
  },
  formattedValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
});
