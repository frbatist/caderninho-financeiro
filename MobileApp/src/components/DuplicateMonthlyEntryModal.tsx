/**
 * Modal para duplicar entrada mensal para o próximo mês
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
import { MonthlyEntry } from '../services/caderninhoApiService';

interface DuplicateMonthlyEntryModalProps {
  visible: boolean;
  entry: MonthlyEntry | null;
  onClose: () => void;
  onConfirm: (amount: number) => Promise<void>;
}

export default function DuplicateMonthlyEntryModal({
  visible,
  entry,
  onClose,
  onConfirm,
}: DuplicateMonthlyEntryModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Atualizar valor quando a entrada mudar
  useEffect(() => {
    if (entry) {
      setAmount(entry.amount.toString());
    }
  }, [entry]);

  // Calcular próximo mês
  const getNextMonthYear = () => {
    if (!entry || !entry.month || !entry.year) return { month: '', year: '' };
    
    let nextMonth = entry.month + 1;
    let nextYear = entry.year;
    
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

  if (!entry) return null;

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
            <Text style={styles.label}>Entrada:</Text>
            <Text style={styles.description}>{entry.description}</Text>

            <Text style={styles.label}>Será duplicada para:</Text>
            <Text style={styles.nextMonth}>
              {nextDate.month} / {nextDate.year}
            </Text>

            <Text style={styles.label}>Valor:</Text>
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
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '85%',
    maxWidth: 400,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  header: {
    backgroundColor: '#4A90E2',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  nextMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
    color: '#333',
  },
  formattedValue: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 4,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  button: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#eee',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
});
