import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';

export default function TransactionsListScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center">
      <Text className="text-white text-xl font-sansBold">Histórico de Lançamentos</Text>
      <Text className="text-muted mt-2 font-sans">Em breve...</Text>
    </SafeAreaView>
  );
}
