import { NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { AssessmentScreen } from '../screens/AssessmentScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { CompanionScreen } from '../screens/CompanionScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LoadingScreen } from '../screens/LoadingScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ScenarioScreen } from '../screens/ScenarioScreen';
import { useApp } from '../state/AppContext';
import { colors } from '../ui/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme: Theme = {
  dark: false,
  colors: {
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '800' },
  },
};

export function RootNavigator() {
  const { stage } = useApp();

  if (stage === 'loading') return <LoadingScreen />;
  if (stage === 'signed-out') return <AuthScreen />;
  if (stage === 'onboarding') return <OnboardingScreen />;
  if (stage === 'assessment') return <AssessmentScreen />;

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: { fontWeight: '700' },
          headerTintColor: colors.primary,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Scenario"
          component={ScenarioScreen}
          options={{ title: 'Training', headerBackTitle: 'Back' }}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen
          name="Companion"
          component={CompanionScreen}
          options={{ title: 'Companion' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
