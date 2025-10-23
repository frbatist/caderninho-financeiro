import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService from '../services/caderninhoApiService';
import { API_BASE_URL } from '../constants/api';
import UpdateService from '../services/updateService';

type DebugScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Debug'>;
};

interface LogEntry {
  timestamp: string;
  type: 'info' | 'error' | 'success';
  message: string;
}

export default function DebugScreen({ navigation }: DebugScreenProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (type: 'info' | 'error' | 'success', message: string) => {
    const timestamp = new Date().toLocaleTimeString('pt-BR');
    setLogs((prev) => [...prev, { timestamp, type, message }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testApiConnection = async () => {
    addLog('info', '🔍 Testando conexão com API...');
    addLog('info', `URL Base: ${API_BASE_URL}`);
    
    try {
      addLog('info', 'Chamando /api/users...');
      const users = await CaderninhoApiService.users.getAll();
      
      addLog('success', `✅ Sucesso! ${users.length} usuários encontrados`);
      addLog('info', `Usuários: ${JSON.stringify(users, null, 2)}`);
    } catch (error: any) {
      addLog('error', `❌ Erro: ${error.message}`);
      
      if (error.response) {
        addLog('error', `Status: ${error.response.status}`);
        addLog('error', `Data: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        addLog('error', 'Erro de rede - sem resposta do servidor');
        addLog('error', `Code: ${error.code}`);
      } else {
        addLog('error', `Erro ao configurar requisição: ${error.message}`);
      }
    }
  };

  const testHealthCheck = async () => {
    addLog('info', '🏥 Testando Health Check...');
    
    try {
      const url = API_BASE_URL.replace('/api', '/health');
      addLog('info', `URL: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      addLog('success', `✅ Status: ${response.status}`);
      addLog('info', `Resposta: ${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      addLog('error', `❌ Erro: ${error.message}`);
    }
  };

  const testNetworkInfo = () => {
    addLog('info', '📡 Informações de Rede:');
    addLog('info', `API Base URL: ${API_BASE_URL}`);
    addLog('info', `Versão: ${UpdateService.getCurrentVersion()}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔧 Debug</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testHealthCheck}>
          <Text style={styles.buttonText}>Testar Health</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testApiConnection}>
          <Text style={styles.buttonText}>Testar API Users</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={testNetworkInfo}>
          <Text style={styles.buttonText}>Info de Rede</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>Limpar Logs</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.logsContainer}>
        {logs.length === 0 ? (
          <Text style={styles.emptyText}>Nenhum log ainda. Execute um teste acima.</Text>
        ) : (
          logs.map((log, index) => (
            <View
              key={index}
              style={[
                styles.logEntry,
                log.type === 'error' && styles.logError,
                log.type === 'success' && styles.logSuccess,
              ]}
            >
              <Text style={styles.logTimestamp}>{log.timestamp}</Text>
              <Text style={styles.logMessage}>{log.message}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    backgroundColor: '#2d2d2d',
    padding: 15,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#4CAF50',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  buttonContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    minWidth: '47%',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  logsContainer: {
    flex: 1,
    padding: 15,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
  },
  logEntry: {
    backgroundColor: '#2d2d2d',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  logError: {
    borderLeftColor: '#f44336',
  },
  logSuccess: {
    borderLeftColor: '#4CAF50',
  },
  logTimestamp: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  logMessage: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
