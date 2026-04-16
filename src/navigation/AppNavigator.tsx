import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BudgetListScreen } from '../screens/BudgetListScreen';
import { BudgetFormScreen } from '../screens/BudgetFormScreen';

export type RootStackParamList = {
  BudgetList: undefined;
  BudgetForm: { id?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="BudgetList"
        component={BudgetListScreen}
        options={{ title: 'Orçamentos' }}
      />
      <Stack.Screen
        name="BudgetForm"
        component={BudgetFormScreen}
        options={{ title: 'Orçamento' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);