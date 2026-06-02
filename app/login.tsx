import React, { useState } from 'react';
import { View, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/src/context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!phone.trim()) {
      return Alert.alert('Aviso', 'Por favor, digite seu telefone.');
    }
    if (!password.trim()) {
      return Alert.alert('Aviso', 'Por favor, digite sua senha.');
    }

    setLoading(true);
    try {
      await login(phone.trim(), password);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Erro', err.message || 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 justify-center p-6">
      <View className="w-full max-w-md mx-auto">
        <Text className="text-4xl font-bold text-center mb-2 text-slate-900">GM Finance</Text>
        <Text className="text-slate-500 text-center mb-10 text-lg">
          Faça login para acessar seu cofre
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-medium mb-2 text-slate-700">Telefone</Text>
          <TextInput
            className="border border-slate-300 rounded-md p-4 bg-white text-lg text-slate-900"
            placeholder="+5511981443833"
            placeholderTextColor="#94a3b8"
            keyboardType="phone-pad"
            autoCorrect={false}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View className="mb-8">
          <Text className="text-sm font-medium mb-2 text-slate-700">Senha</Text>
          <TextInput
            className="border border-slate-300 rounded-md p-4 bg-white text-lg text-slate-900"
            placeholder="123456"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <Button
          variant="default"
          onPress={handleLogin}
          disabled={loading || !phone.trim() || !password.trim()}
          className="w-full rounded-lg px-5 py-3.5 bg-slate-900"
          label={loading ? undefined : 'Entrar'}
        >
          {loading ? <ActivityIndicator color="#ffffff" /> : null}
        </Button>
      </View>
    </SafeAreaView>
  );
}
