/**
 * Modal para adicionar novo estabelecimento
 * Permite criar um novo estabelecimento com validação e integração com a API
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
import CaderninhoApiService, { CreateEstablishmentDto, Establishment, EstablishmentType } from '../services/caderninhoApiService';

interface AddEstablishmentModalProps {
  visible: boolean;
  onClose: () => void;
  onEstablishmentAdded: (establishment: Establishment) => void;
}

// Opções para os tipos de estabelecimento com ícones
const establishmentTypeOptions = [
  { value: EstablishmentType.Restaurant, label: 'Restaurante', icon: '🍽️' },
  { value: EstablishmentType.Supermarket, label: 'Supermercado', icon: '🛒' },
  { value: EstablishmentType.GasStation, label: 'Posto de Gasolina', icon: '⛽' },
  { value: EstablishmentType.Pharmacy, label: 'Farmácia', icon: '💊' },
  { value: EstablishmentType.Clothing, label: 'Roupas', icon: '👕' },
  { value: EstablishmentType.Electronics, label: 'Eletrônicos', icon: '📱' },
  { value: EstablishmentType.Services, label: 'Serviços', icon: '🔧' },
  { value: EstablishmentType.Education, label: 'Educação', icon: '📚' },
  { value: EstablishmentType.Health, label: 'Saúde', icon: '🏥' },
  { value: EstablishmentType.Entertainment, label: 'Entretenimento', icon: '🎬' },
  { value: EstablishmentType.Transport, label: 'Transporte', icon: '🚗' },
  { value: EstablishmentType.Other, label: 'Outros', icon: '🏪' },
];

export default function AddEstablishmentModal({ 
  visible, 
  onClose, 
  onEstablishmentAdded 
}: AddEstablishmentModalProps) {
  // Estados do formulário
  const [formData, setFormData] = useState<CreateEstablishmentDto>({
    name: '',
    type: EstablishmentType.Restaurant,
  });

  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<CreateEstablishmentDto>>({});

  // Limpar formulário ao fechar
  const handleClose = () => {
    setFormData({
      name: '',
      type: EstablishmentType.Restaurant,
    });
    setErrors({});
    onClose();
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const newErrors: Partial<CreateEstablishmentDto> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
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
      const newEstablishment = await CaderninhoApiService.establishments.create({
        ...formData,
        name: formData.name.trim(),
      });
      
      Alert.alert(
        'Sucesso',
        'Estabelecimento adicionado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              onEstablishmentAdded(newEstablishment);
              handleClose();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao criar estabelecimento:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o estabelecimento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo do formulário
  const updateField = (field: keyof CreateEstablishmentDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando o usuário digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

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
              <Text style={styles.title}>Adicionar Estabelecimento</Text>
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
              {/* Nome do estabelecimento */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Nome do Estabelecimento *</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(text) => updateField('name', text)}
                  placeholder="Ex: McDonald's, Extra Supermercado, etc."
                  editable={!loading}
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* Tipo do estabelecimento */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Categoria</Text>
                <View style={styles.typeGrid}>
                  {establishmentTypeOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.typeOption,
                        formData.type === option.value && styles.typeOptionSelected
                      ]}
                      onPress={() => updateField('type', option.value)}
                      disabled={loading}
                    >
                      <Text style={styles.typeIcon}>{option.icon}</Text>
                      <Text style={[
                        styles.typeText,
                        formData.type === option.value && styles.typeTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
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
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeOption: {
    width: '30%',
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  typeTextSelected: {
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