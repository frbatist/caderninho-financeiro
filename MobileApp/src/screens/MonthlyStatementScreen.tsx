import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import CaderninhoApiService, {
  MonthlyStatementDto,
  MonthlyEntry,
  ExpenseByTypeDto,
} from '../services/caderninhoApiService';

/**
 * Tela de Extrato Mensal
 * Exibe entradas mensais (receitas/despesas recorrentes) e despesas agrupadas por tipo
 */
export default function MonthlyStatementScreen() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed

  // Estados
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [activeTab, setActiveTab] = useState<'entries' | 'statement'>('statement');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Dados
  const [monthlyEntries, setMonthlyEntries] = useState<MonthlyEntry[]>([]);
  const [monthlyStatement, setMonthlyStatement] = useState<MonthlyStatementDto | null>(null);
  
  // Estado de expansão para os grupos de despesas
  const [expandedTypes, setExpandedTypes] = useState<Set<number>>(new Set());

  // Opções de anos (2 anos anteriores, atual, 2 anos posteriores)
  const yearOptions = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];

  // Nomes dos meses
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Carregar dados ao montar o componente ou quando mudar mês/ano
  useEffect(() => {
    loadData();
  }, [selectedYear, selectedMonth]);

  /**
   * Carrega os dados de entradas mensais e extrato
   */
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadMonthlyEntries(),
        loadMonthlyStatement(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Carrega as entradas mensais ativas do mês selecionado
   */
  const loadMonthlyEntries = async () => {
    try {
      const response = await CaderninhoApiService.monthlyEntries.getAll({
        year: selectedYear,
        month: selectedMonth,
        isActive: true,
        pageNumber: 1,
        pageSize: 100,
      });
      setMonthlyEntries(response.items);
    } catch (error) {
      console.error('Erro ao carregar entradas mensais:', error);
      throw error;
    }
  };

  /**
   * Carrega o extrato mensal do mês selecionado
   */
  const loadMonthlyStatement = async () => {
    try {
      const statement = await CaderninhoApiService.monthlyStatement.getMonthlyStatement(
        selectedYear,
        selectedMonth
      );
      setMonthlyStatement(statement);
    } catch (error) {
      console.error('Erro ao carregar extrato mensal:', error);
      throw error;
    }
  };

  /**
   * Função de refresh (pull to refresh)
   */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [selectedYear, selectedMonth]);

  /**
   * Navega para o mês anterior
   */
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  /**
   * Navega para o próximo mês
   */
  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  /**
   * Alterna a expansão de um grupo de despesas
   */
  const toggleExpand = (establishmentType: number) => {
    const newExpanded = new Set(expandedTypes);
    if (newExpanded.has(establishmentType)) {
      newExpanded.delete(establishmentType);
    } else {
      newExpanded.add(establishmentType);
    }
    setExpandedTypes(newExpanded);
  };

  /**
   * Formata valor monetário
   */
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  /**
   * Formata data
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  /**
   * Obtém o nome do tipo de operação
   */
  const getOperationTypeName = (operation: number) => {
    return operation === 1 ? 'Receita' : 'Despesa';
  };

  /**
   * Obtém a cor do tipo de operação
   */
  const getOperationColor = (operation: number) => {
    return operation === 1 ? '#4CAF50' : '#f44336';
  };

  /**
   * Renderiza a tab de entradas mensais
   */
  const renderMonthlyEntriesTab = () => {
    if (monthlyEntries.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma entrada mensal ativa para este período</Text>
        </View>
      );
    }

    const totalIncome = monthlyEntries
      .filter(e => e.operation === 1)
      .reduce((sum, e) => sum + e.amount, 0);

    const totalExpense = monthlyEntries
      .filter(e => e.operation === 2)
      .reduce((sum, e) => sum + e.amount, 0);

    const balance = totalIncome - totalExpense;

    return (
      <View style={styles.tabContent}>
        {/* Resumo */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Receitas:</Text>
            <Text style={[styles.summaryValue, styles.incomeText]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Despesas:</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelTotal}>Saldo:</Text>
            <Text style={[styles.summaryValueTotal, balance >= 0 ? styles.incomeText : styles.expenseText]}>
              {formatCurrency(balance)}
            </Text>
          </View>
        </View>

        {/* Lista de entradas */}
        <View style={styles.entriesList}>
          <Text style={styles.sectionTitle}>Entradas do Mês</Text>
          {monthlyEntries.map((entry) => (
            <View key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <Text style={styles.entryDescription}>{entry.description}</Text>
                <Text
                  style={[
                    styles.entryAmount,
                    { color: getOperationColor(entry.operation) }
                  ]}
                >
                  {formatCurrency(entry.amount)}
                </Text>
              </View>
              <View style={styles.entryFooter}>
                <Text style={styles.entryType}>
                  {getOperationTypeName(entry.operation)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  /**
   * Renderiza a tab de extrato mensal (despesas agrupadas)
   */
  const renderStatementTab = () => {
    if (!monthlyStatement) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhum dado de extrato disponível</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        {/* Totais Gerais */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Despesas:</Text>
            <Text style={[styles.summaryValue, styles.expenseText]}>
              {formatCurrency(monthlyStatement.totalExpenses)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Limites:</Text>
            <Text style={styles.summaryValue}>
              {formatCurrency(monthlyStatement.totalLimits)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryLabelTotal}>Saldo:</Text>
            <Text
              style={[
                styles.summaryValueTotal,
                monthlyStatement.availableBalance >= 0 ? styles.incomeText : styles.expenseText
              ]}
            >
              {formatCurrency(monthlyStatement.availableBalance)}
            </Text>
          </View>
          {monthlyStatement.availableBalance < 0 && (
            <View style={styles.overLimitWarning}>
              <Text style={styles.overLimitText}>
                ⚠️ Acima do limite em {monthlyStatement.percentageUsed.toFixed(1)}%
              </Text>
            </View>
          )}
        </View>

        {/* Despesas por Tipo */}
        <View style={styles.expensesList}>
          <Text style={styles.sectionTitle}>Despesas por Tipo</Text>
          {monthlyStatement.expensesByType.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma despesa neste período</Text>
          ) : (
            monthlyStatement.expensesByType.map((expenseType) => (
              <View key={expenseType.establishmentType} style={styles.expenseTypeCard}>
                {/* Cabeçalho do grupo (clicável) */}
                <TouchableOpacity
                  style={styles.expenseTypeHeader}
                  onPress={() => toggleExpand(expenseType.establishmentType)}
                >
                  <View style={styles.expenseTypeHeaderContent}>
                    <Text style={styles.expenseTypeName}>
                      {expandedTypes.has(expenseType.establishmentType) ? '▼' : '▶'}{' '}
                      {expenseType.establishmentTypeName}
                    </Text>
                    <Text style={styles.expenseTypeAmount}>
                      {formatCurrency(expenseType.totalSpent)}
                    </Text>
                  </View>
                  <View style={styles.expenseTypeDetails}>
                    <Text style={styles.expenseTypeLimit}>
                      Limite: {expenseType.monthlyLimit !== null ? formatCurrency(expenseType.monthlyLimit) : 'Não definido'}
                    </Text>
                    {expenseType.availableBalance !== null && (
                      <Text
                        style={[
                          styles.expenseTypeBalance,
                          expenseType.availableBalance >= 0 ? styles.incomeText : styles.expenseText
                        ]}
                      >
                        Saldo: {formatCurrency(expenseType.availableBalance)}
                      </Text>
                    )}
                  </View>
                  {expenseType.isOverLimit && expenseType.percentageUsed !== null && (
                    <Text style={styles.expenseTypeOverLimit}>
                      ⚠️ {expenseType.percentageUsed.toFixed(1)}% acima
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Transações expandidas */}
                {expandedTypes.has(expenseType.establishmentType) && (
                  <View style={styles.transactionsList}>
                    {expenseType.transactions.map((transaction, index) => (
                      <View key={index} style={styles.transactionCard}>
                        <View style={styles.transactionHeader}>
                          <Text style={styles.transactionDescription}>
                            {transaction.description}
                          </Text>
                          <Text style={styles.transactionAmount}>
                            {formatCurrency(transaction.amount)}
                          </Text>
                        </View>
                        <View style={styles.transactionFooter}>
                          <Text style={styles.transactionDate}>
                            {formatDate(transaction.date)}
                          </Text>
                          <Text style={styles.transactionPayment}>
                            {transaction.paymentTypeName}
                          </Text>
                        </View>
                        {transaction.isCreditCardInstallment && transaction.installmentInfo && (
                          <Text style={styles.transactionInstallment}>
                            🔢 {transaction.installmentInfo}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho com filtros */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Extrato Mensal</Text>
        
        {/* Seletor de Ano */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Ano:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.yearScroll}>
            {yearOptions.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  selectedYear === year && styles.yearButtonActive
                ]}
                onPress={() => setSelectedYear(year)}
              >
                <Text
                  style={[
                    styles.yearButtonText,
                    selectedYear === year && styles.yearButtonTextActive
                  ]}
                >
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Navegação de Meses */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousMonth}>
            <Text style={styles.navButtonText}>◀</Text>
          </TouchableOpacity>
          
          <Text style={styles.currentMonth}>
            {monthNames[selectedMonth - 1]} {selectedYear}
          </Text>
          
          <TouchableOpacity style={styles.navButton} onPress={goToNextMonth}>
            <Text style={styles.navButtonText}>▶</Text>
          </TouchableOpacity>
        </View>

        {/* Abas */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'entries' && styles.tabActive]}
            onPress={() => setActiveTab('entries')}
          >
            <Text style={[styles.tabText, activeTab === 'entries' && styles.tabTextActive]}>
              Entradas Mensais
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'statement' && styles.tabActive]}
            onPress={() => setActiveTab('statement')}
          >
            <Text style={[styles.tabText, activeTab === 'statement' && styles.tabTextActive]}>
              Extrato de Despesas
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Conteúdo */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {activeTab === 'entries' ? renderMonthlyEntriesTab() : renderStatementTab()}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  yearScroll: {
    flexGrow: 0,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  yearButtonActive: {
    backgroundColor: '#2196F3',
  },
  yearButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  yearButtonTextActive: {
    color: '#fff',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  navButton: {
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  navButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  currentMonth: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  tabContent: {
    padding: 16,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryRowTotal: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryValueTotal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  incomeText: {
    color: '#4CAF50',
  },
  expenseText: {
    color: '#f44336',
  },
  overLimitWarning: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  overLimitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  entriesList: {
    marginTop: 8,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  entryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryType: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  expensesList: {
    marginTop: 8,
  },
  expenseTypeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  expenseTypeHeader: {
    padding: 16,
    backgroundColor: '#fafafa',
  },
  expenseTypeHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseTypeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  expenseTypeAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
  },
  expenseTypeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  expenseTypeLimit: {
    fontSize: 12,
    color: '#666',
  },
  expenseTypeBalance: {
    fontSize: 12,
    fontWeight: '600',
  },
  expenseTypeOverLimit: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
    marginTop: 4,
  },
  transactionsList: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  transactionCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#2196F3',
    paddingLeft: 12,
    paddingVertical: 12,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 4,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f44336',
    marginLeft: 8,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
  transactionPayment: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionInstallment: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
    marginTop: 4,
  },
});
