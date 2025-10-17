/**
 * Modal para adicionar novo cartão
 * Permite criar um novo cartão com validação e integração com a API
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import CaderninhoApiService, { CreateCardDto, Card, CardType, CardBrand } from '../services/caderninhoApiService';

interface AddCardModalProps {
  visible: boolean;
  onClose: () => void;
  onCardAdded: (card: Card) => void;
}

// Opções para os selects
const cardTypeOptions = [
  { value: CardType.Credit, label: 'Crédito' },
  { value: CardType.Debit, label: 'Débito' },
  { value: CardType.Voucher, label: 'Voucher' },
];

const cardBrandOptions = [
  { value: CardBrand.Visa, label: 'Visa' },
  { value: CardBrand.Mastercard, label: 'Mastercard' },
  { value: CardBrand.Elo, label: 'Elo' },
  { value: CardBrand.AmericanExpress, label: 'American Express' },
  { value: CardBrand.Hipercard, label: 'Hipercard' },
  { value: CardBrand.Other, label: 'Outro' },
];

export default function AddCardModal({ visible, onClose, onCardAdded }: AddCardModalProps) {
  // Estados do formulário
  const [formData, setFormData] = useState<CreateCardDto>({
    name: '',
    type: CardType.Credit,
    brand: CardBrand.Visa,
    lastFourDigits: '',
  });

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateCardDto>>({});

  // Limpar formulário ao fechar
  const handleClose = () => {
    setFormData({
      name: '',
      type: CardType.Credit,
      brand: CardBrand.Visa,
      lastFourDigits: '',
    });
    setErrors({});
    onClose();
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Partial<CreateCardDto> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.lastFourDigits.trim()) {
      newErrors.lastFourDigits = 'Últimos 4 dígitos são obrigatórios';
    } else if (!/^\d{4}$/.test(formData.lastFourDigits)) {
      newErrors.lastFourDigits = 'Digite exatamente 4 números';
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
      const newCard = await CaderninhoApiService.cards.create(formData);
      
      Alert.alert(
        'Sucesso',
        'Cartão adicionado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              onCardAdded(newCard);
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo do formulário
  const updateField = (field: keyof CreateCardDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Renderizar select customizado
  const renderSelect = (
    label: string,
    value: number,
    options: { value: number; label: string }[],
    onSelect: (value: number) => void
  ) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.selectContainer}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.selectOption,
              value === option.value && styles.selectOptionSelected
            ]}
            onPress={() => onSelect(option.value)}
          >
            <Text style={[
              styles.selectOptionText,
              value === option.value && styles.selectOptionTextSelected
            ]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Adicionar Cartão</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Formulário */}
            <View style={styles.form}>
              {/* Nome do cartão */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Nome do Cartão *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => updateField('name', text)}
                  placeholder="Ex: Cartão Principal, Nubank, etc."
                  editable={!loading}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Últimos 4 dígitos */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Últimos 4 dígitos *</Text>
                <TextInput
                  style={[styles.input, errors.lastFourDigits && styles.inputError]}
                  value={formData.lastFourDigits}
                  onChangeText={(text) => updateField('lastFourDigits', text.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  keyboardType="numeric"
                  maxLength={4}
                  editable={!loading}
                />
                {errors.lastFourDigits && <Text style={styles.errorText}>{errors.lastFourDigits}</Text>}
              </View>

              {/* Tipo do cartão */}
              {renderSelect(
                'Tipo do Cartão',
                formData.type,
                cardTypeOptions,
                (value) => updateField('type', value)
              )}

              {/* Bandeira do cartão */}
              {renderSelect(
                'Bandeira',
                formData.brand,
                cardBrandOptions,
                (value) => updateField('brand', value)
              )}
            </View>

            {/* Botões */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
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
                  <Text style={styles.saveButtonText}>Salvar</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  form: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 20,
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
  selectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectOptionTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
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