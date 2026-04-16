import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Budget } from '../types/budget';
import { getBudgets, saveBudgets } from '../storage/budgetStorage';
import { BudgetCard } from '../components/BudgetCard';
import { Button } from '../components/Button';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BudgetList'
>;

type SortOption = 'recent' | 'oldest' | 'highest' | 'lowest';
type StatusFilter = 'all' | 'draft' | 'sent' | 'approved' | 'declined';

export const BudgetListScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filteredBudgets, setFilteredBudgets] = useState<Budget[]>([]);
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');
  const [sortOption, setSortOption] =
    useState<SortOption>('recent');

  // Carregar orçamentos ao focar na tela
  useFocusEffect(
    React.useCallback(() => {
      loadBudgets();
    }, [])
  );

  const loadBudgets = async () => {
    const data = await getBudgets();
    setBudgets(data);
  };

  // Aplicar filtro e ordenação
  useEffect(() => {
    let data = [...budgets];

    if (statusFilter !== 'all') {
      data = data.filter((b) => b.status === statusFilter);
    }

    data.sort((a, b) => {
      const totalA = calculateTotal(a);
      const totalB = calculateTotal(b);

      switch (sortOption) {
        case 'recent':
          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime()
          );
        case 'highest':
          return totalB - totalA;
        case 'lowest':
          return totalA - totalB;
        default:
          return 0;
      }
    });

    setFilteredBudgets(data);
  }, [budgets, statusFilter, sortOption]);

  const calculateTotal = (budget: Budget) => {
    const subtotal = budget.services.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const discountValue = subtotal * ((budget.discount ?? 0) / 100);
    return subtotal - discountValue;
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir Orçamento',
      'Tem certeza que deseja excluir este orçamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            const updated = budgets.filter((b) => b.id !== id);
            setBudgets(updated);
            await saveBudgets(updated);
          },
        },
      ]
    );
  };

  const handleDuplicate = async (budget: Budget) => {
    const newBudget: Budget = {
      ...budget,
      id: Date.now().toString(),
      title: `${budget.title} (Cópia)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newBudget, ...budgets];
    setBudgets(updated);
    await saveBudgets(updated);
  };

  const renderItem = ({ item }: { item: Budget }) => (
    <View style={styles.cardContainer}>
      <BudgetCard
        budget={item}
        onPress={() =>
          navigation.navigate('BudgetForm', { id: item.id })
        }
      />
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => handleDuplicate(item)}
          style={styles.iconButton}
        >
          <Ionicons name="copy-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.iconButton}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButtons = () => {
    const statuses: { label: string; value: StatusFilter }[] = [
      { label: 'Todos', value: 'all' },
      { label: 'Rascunho', value: 'draft' },
      { label: 'Enviado', value: 'sent' },
      { label: 'Aprovado', value: 'approved' },
      { label: 'Recusado', value: 'declined' },
    ];

    return (
      <View style={styles.filterContainer}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.value}
            style={[
              styles.filterButton,
              statusFilter === status.value &&
                styles.filterButtonActive,
            ]}
            onPress={() => setStatusFilter(status.value)}
          >
            <Text
              style={[
                styles.filterText,
                statusFilter === status.value &&
                  styles.filterTextActive,
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderFilterButtons()}

      {filteredBudgets.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Nenhum orçamento encontrado.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBudgets}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.md }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BudgetForm')}
      >
        <Ionicons name="add" size={24} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray100,
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
  actions: {
    position: 'absolute',
    right: spacing.md,
    top: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    backgroundColor: '#FFF',
    padding: spacing.sm,
    borderRadius: 8,
    elevation: 2,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  filterButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  filterText: {
    ...typography.textSm,
    color: colors.gray600,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.textMd,
    color: colors.gray500,
  },
});