/**
 * Utilitários para alertas compatíveis com Web e Mobile
 */

import { Alert, Platform } from 'react-native';

export type AlertButton = {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
};

/**
 * Mostra um alerta compatível com Web e Mobile
 * No Web, usa window.confirm e window.alert
 * No Mobile, usa Alert.alert do React Native
 */
export const showAlert = (
  title: string,
  message: string,
  buttons?: AlertButton[]
) => {
  if (Platform.OS === 'web') {
    // No web, usar window.confirm e window.alert
    if (buttons && buttons.length > 1) {
      // Para diálogos com múltiplos botões, usar confirm
      const confirmed = window.confirm(`${title}\n\n${message}`);
      if (confirmed) {
        const confirmButton = buttons.find(b => b.style !== 'cancel');
        if (confirmButton?.onPress) confirmButton.onPress();
      } else {
        const cancelButton = buttons.find(b => b.style === 'cancel');
        if (cancelButton?.onPress) cancelButton.onPress();
      }
    } else {
      // Para alertas simples, usar alert
      window.alert(`${title}\n\n${message}`);
      if (buttons && buttons[0]?.onPress) buttons[0].onPress();
    }
  } else {
    // No mobile, usar Alert nativo
    Alert.alert(title, message, buttons);
  }
};

/**
 * Mostra um alerta de confirmação
 * Retorna Promise<boolean> para uso com async/await
 */
export const showConfirm = (
  title: string,
  message: string
): Promise<boolean> => {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${title}\n\n${message}`);
      resolve(confirmed);
    } else {
      Alert.alert(title, message, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'OK', onPress: () => resolve(true) },
      ]);
    }
  });
};

/**
 * Mostra um alerta simples
 * Retorna Promise<void> para uso com async/await
 */
export const showMessage = (title: string, message: string): Promise<void> => {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
      resolve();
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress: () => resolve() }]);
    }
  });
};
