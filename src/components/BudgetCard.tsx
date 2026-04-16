import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Budget } from '../types/budget';
import { colors, spacing, typography } from '../theme';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';

interface Props {
  budget: Budget;
  onPress: () => void;
}

export const BudgetCard: React.FC<Props> = ({ budget, onPress }) => {
  const subtotal = budget.services.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountValue = subtotal * ((budget.discount ?? 0) / 100);
  const total = subtotal - discountValue;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title}>{budget.title}</Text>
        <StatusBadge status={budget.status} />
      </View>
      <Text style={styles.client}>{budget.client}</Text>
      <Text style={styles.value}>{formatCurrency(total)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.titleMd,
    color: colors.gray700,
  },
  client: {
    ...typography.textSm,
    color: colors.gray500,
  },
  value: {
    ...typography.titleSm,
    color: colors.primary,
    marginTop: spacing.sm,
  },
});