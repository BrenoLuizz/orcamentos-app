import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { Budget, ServiceItem, BudgetStatus } from '../types/budget';
import { getBudgets, saveBudgets } from '../storage/budgetStorage';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { formatCurrency } from '../utils/formatCurrency';
import { colors, spacing, typography } from '../theme';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'BudgetForm'
>;

type RouteProps = RouteProp<RootStackParamList, 'BudgetForm'>;

export const BudgetFormScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { id } = route.params || {};

  const [title, setTitle] = useState('');
  const [client, setClient] = useState('');
  const [status, setStatus] = useState<BudgetStatus>('draft');
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [discount, setDiscount] = useState('0');

  useEffect(() => {
    if (id) {
      loadBudget();
    }
  }, [id]);

  const loadBudget = async () => {
    const budgets = await getBudgets();
    const budget = budgets.find((b) => b.id === id);
    if (budget) {
      setTitle(budget.title);
      setClient(budget.client);
      setStatus(budget.status);
      setServices(budget.services);
      setDiscount(String(budget.discount ?? 0));
    }
  };

  const addService = () => {
    const newService: ServiceItem = {
      id: Date.now().toString(),
      name: 'Novo Serviço',
      price: 0,
      quantity: 1,
    };
    setServices([...services, newService]);
  };

  const updateService = (
    id: string,
    field: keyof ServiceItem,
    value: any
  ) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };

  const removeService = (id: string) => {
    setServices((prev) => prev.filter((service) => service.id !== id));
  };

  const subtotal = services.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const discountValue = subtotal * (Number(discount) / 100);
  const total = subtotal - discountValue;

  const handleSave = async () => {
    if (!title || !client) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const budgets = await getBudgets();

    let updatedBudgets: Budget[];

    if (id) {
      updatedBudgets = budgets.map((b) =>
        b.id === id
          ? {
              ...b,
              title,
              client,
              status,
              services,
              discount: Number(discount),
              updatedAt: new Date().toISOString(),
            }
          : b
      );
    } else {
      const newBudget: Budget = {
        id: Date.now().toString(),
        title,
        client,
        status,
        services,
        discount: Number(discount),
        createdAt: new Date().toISOString(),
      };
      updatedBudgets = [newBudget, ...budgets];
    }

    await saveBudgets(updatedBudgets);
    navigation.goBack();
  };

  const statuses: { label: string; value: BudgetStatus }[] = [
    { label: 'Rascunho', value: 'draft' },
    { label: 'Enviado', value: 'sent' },
    { label: 'Aprovado', value: 'approved' },
    { label: 'Recusado', value: 'declined' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Informações Gerais</Text>
      <Input label="Título" value={title} onChangeText={setTitle} />
      <Input label="Cliente" value={client} onChangeText={setClient} />

      <Text style={styles.sectionTitle}>Status</Text>
      <View style={styles.statusContainer}>
        {statuses.map((s) => (
          <TouchableOpacity
            key={s.value}
            style={[
              styles.statusButton,
              status === s.value && styles.statusButtonActive,
            ]}
            onPress={() => setStatus(s.value)}
          >
            <Text
              style={[
                styles.statusText,
                status === s.value && styles.statusTextActive,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Serviços</Text>
      {services.map((service) => (
        <View key={service.id} style={styles.serviceContainer}>
          <Input
            label="Nome"
            value={service.name}
            onChangeText={(text) =>
              updateService(service.id, 'name', text)
            }
          />
          <Input
            label="Preço"
            value={String(service.price)}
            onChangeText={(text) =>
              updateService(
                service.id,
                'price',
                Number(text.replace(',', '.'))
              )
            }
          />
          <Input
            label="Quantidade"
            value={String(service.quantity)}
            onChangeText={(text) =>
              updateService(service.id, 'quantity', Number(text))
            }
          />
          <TouchableOpacity
            onPress={() => removeService(service.id)}
            style={styles.deleteService}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={colors.danger}
            />
          </TouchableOpacity>
        </View>
      ))}

      <Button title="Adicionar Serviço" onPress={addService} />

      <Text style={styles.sectionTitle}>Resumo Financeiro</Text>
      <Input
        label="Desconto (%)"
        value={discount}
        onChangeText={setDiscount}
      />

      <View style={styles.summary}>
        <Text>Subtotal: {formatCurrency(subtotal)}</Text>
        <Text>Desconto: {formatCurrency(discountValue)}</Text>
        <Text style={styles.total}>
          Total: {formatCurrency(total)}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
        <Button title="Salvar" onPress={handleSave} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.gray100,
  },
  sectionTitle: {
    ...typography.titleMd,
    marginVertical: spacing.md,
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statusButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: '#FFF',
  },
  statusButtonActive: {
    backgroundColor: colors.primaryLight,
  },
  statusText: {
    color: colors.gray600,
  },
  statusTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  serviceContainer: {
    backgroundColor: '#FFF',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  deleteService: {
    alignItems: 'flex-end',
  },
  summary: {
    marginVertical: spacing.md,
  },
  total: {
    fontWeight: 'bold',
    color: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
});