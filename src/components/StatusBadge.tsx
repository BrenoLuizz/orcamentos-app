import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { BudgetStatus } from '../types/budget';

const statusConfig = {
  draft: { label: 'Rascunho', color: colors.gray500 },
  sent: { label: 'Enviado', color: colors.info },
  approved: { label: 'Aprovado', color: colors.success },
  declined: { label: 'Recusado', color: colors.danger },
};

export const StatusBadge = ({ status }: { status: BudgetStatus }) => {
  const config = statusConfig[status];

  return (
    <View style={[styles.badge, { backgroundColor: `${config.color}20` }]}>
      <Text style={[styles.text, { color: config.color }]}>
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.textXs,
    fontWeight: '700',
  },
});