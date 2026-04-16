import AsyncStorage from '@react-native-async-storage/async-storage';
import { Budget } from '../types/budget';

const STORAGE_KEY = '@budgets';

export const getBudgets = async (): Promise<Budget[]> => {
  const data = await AsyncStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveBudgets = async (budgets: Budget[]) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
};