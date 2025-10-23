import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import CaderninhoApiService, { User } from '../services/caderninhoApiService';
import UserStorageService from '../services/userStorageService';

type UserSelectionScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'UserSelection'>;
};

/**
 * Tela de seleção de usuário
 * Exibida quando não há usuário salvo no storage
 */
export default function UserSelectionScreen({ navigation }: UserSelectionScreenProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Carrega a lista de usuários do backend
   */
  const loadUsers = async () => {
    setLoading(true);
    try {
      console.log('[UserSelection] Iniciando busca de usuários...');
      console.log('[UserSelection] Chamando CaderninhoApiService.users.getAll()');
      
      const userList = await CaderninhoApiService.users.getAll();
      
      console.log('[UserSelection] Usuários recebidos:', userList.length);
      console.log('[UserSelection] Dados:', JSON.stringify(userList));
      
      setUsers(userList);
      
      if (userList.length === 0) {
        Alert.alert(
          'Nenhum Usuário',
          'Não há usuários cadastrados no sistema. Por favor, cadastre um usuário no backend primeiro.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('[UserSelection] Erro ao carregar usuários:', error);
      console.error('[UserSelection] Erro message:', error.message);
      console.error('[UserSelection] Erro stack:', error.stack);
      console.error('[UserSelection] Erro response:', error.response);
      console.error('[UserSelection] Erro request:', error.request);
      
      Alert.alert(
        'Erro',
        `Não foi possível carregar os usuários. 
        
Erro: ${error.message}
        
Verifique:
- A conexão com o backend
- Se você está na mesma rede
- Se o IP está correto: 10.0.0.131`,
        [{ text: 'Tentar Novamente', onPress: loadUsers }]
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seleciona o usuário e salva no storage
   */
  const selectUser = async (user: User) => {
    setSelectedUserId(user.id);
    
    try {
      await UserStorageService.saveUser(user);
      
      // Navega para a Home após salvar
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      Alert.alert('Erro', 'Não foi possível salvar o usuário selecionado.');
      setSelectedUserId(null);
    }
  };

  /**
   * Formata a data de criação do usuário
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bem-vindo!</Text>
        <Text style={styles.headerSubtitle}>
          Selecione seu usuário para continuar
        </Text>
        
        {/* Botão de Debug */}
        <TouchableOpacity 
          style={styles.debugButton}
          onPress={() => navigation.navigate('Debug')}
        >
          <Text style={styles.debugButtonText}>🔧 Debug</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de usuários */}
      <ScrollView style={styles.userList} contentContainerStyle={styles.userListContent}>
        {users.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👤</Text>
            <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadUsers}>
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        ) : (
          users.map((user) => (
            <TouchableOpacity
              key={user.id}
              style={[
                styles.userCard,
                selectedUserId === user.id && styles.userCardSelecting,
              ]}
              onPress={() => selectUser(user)}
              disabled={selectedUserId === user.id}
            >
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userDate}>
                  Cadastrado em {formatDate(user.createdAt)}
                </Text>
              </View>

              {selectedUserId === user.id && (
                <ActivityIndicator size="small" color="#2196F3" />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Footer com informação */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Seu usuário ficará salvo neste dispositivo
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  debugButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  debugButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userList: {
    flex: 1,
  },
  userListContent: {
    padding: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userCardSelecting: {
    opacity: 0.6,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
