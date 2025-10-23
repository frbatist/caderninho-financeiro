/**
 * Serviço para verificar atualizações disponíveis no servidor
 */

import { Platform, Linking, Alert } from 'react-native';

const UPDATE_URL = 'http://10.0.0.131:8080/updates/latest.json';
const APK_BASE_URL = 'http://10.0.0.131:8080';

// Versão atual do app (deve corresponder ao app.json)
const CURRENT_VERSION = '1.0.3';

interface UpdateInfo {
  version: string;
  buildDate: string;
  url: string;
  fileName: string;
  size: number;
}

export class UpdateService {
  /**
   * Obtém a versão atual do app
   */
  static getCurrentVersion(): string {
    return CURRENT_VERSION;
  }

  /**
   * Verifica se há atualizações disponíveis no servidor
   */
  static async checkForUpdates(): Promise<{ hasUpdate: boolean; updateInfo?: UpdateInfo }> {
    try {
      console.log('[UpdateService] Verificando atualizações...');
      console.log('[UpdateService] Versão atual:', this.getCurrentVersion());

      const response = await fetch(UPDATE_URL, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        console.warn('[UpdateService] Erro ao verificar atualizações:', response.status);
        return { hasUpdate: false };
      }

      const updateInfo: UpdateInfo = await response.json();
      console.log('[UpdateService] Info do servidor:', updateInfo);

      // Compara versões (você pode melhorar isso com um parser de versão semântica)
      const currentVersion = this.getCurrentVersion();
      const hasUpdate = this.compareVersions(updateInfo.version, currentVersion) > 0;

      console.log('[UpdateService] Há atualização?', hasUpdate);

      return {
        hasUpdate,
        updateInfo: hasUpdate ? updateInfo : undefined,
      };
    } catch (error) {
      console.error('[UpdateService] Erro ao verificar atualizações:', error);
      return { hasUpdate: false };
    }
  }

  /**
   * Compara duas versões no formato "x.y.z"
   * Retorna: 1 se v1 > v2, -1 se v1 < v2, 0 se iguais
   */
  static compareVersions(v1: string, v2: string): number {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const part1 = parts1[i] || 0;
      const part2 = parts2[i] || 0;

      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }

    return 0;
  }

  /**
   * Formata tamanho de arquivo em MB
   */
  static formatFileSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  /**
   * Formata data de build
   */
  static formatBuildDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Abre a URL de download do APK
   */
  static openDownloadPage(updateInfo?: UpdateInfo) {
    const url = updateInfo
      ? `${APK_BASE_URL}${updateInfo.url}`
      : `${APK_BASE_URL}`;

    console.log('[UpdateService] Abrindo URL:', url);

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Erro', 'Não foi possível abrir o navegador');
        }
      })
      .catch((err) => {
        console.error('[UpdateService] Erro ao abrir URL:', err);
        Alert.alert('Erro', 'Não foi possível abrir o link de download');
      });
  }

  /**
   * Mostra alerta de atualização disponível
   */
  static showUpdateAlert(updateInfo: UpdateInfo) {
    const message = `
Nova versão disponível!

Versão: ${updateInfo.version}
Tamanho: ${this.formatFileSize(updateInfo.size)}
Data: ${this.formatBuildDate(updateInfo.buildDate)}

Deseja baixar agora?
    `.trim();

    Alert.alert(
      '🚀 Atualização Disponível',
      message,
      [
        {
          text: 'Agora não',
          style: 'cancel',
        },
        {
          text: 'Baixar',
          onPress: () => this.openDownloadPage(updateInfo),
        },
      ]
    );
  }

  /**
   * Verifica e mostra alerta se houver atualização
   */
  static async checkAndNotify(): Promise<void> {
    if (Platform.OS !== 'android') {
      // Por enquanto, apenas Android é suportado
      return;
    }

    const { hasUpdate, updateInfo } = await this.checkForUpdates();

    if (hasUpdate && updateInfo) {
      this.showUpdateAlert(updateInfo);
    }
  }
}

export default UpdateService;
