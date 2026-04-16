import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

interface Props {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const Input: React.FC<Props> = ({
  label,
  value,
  onChangeText,
  placeholder,
}) => (
  <View style={styles.container}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.gray400}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    ...typography.textSm,
    marginBottom: spacing.xs,
    color: colors.gray600,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 10,
    padding: spacing.md,
    backgroundColor: '#FFF',
  },
});