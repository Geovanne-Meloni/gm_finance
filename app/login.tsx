import React, { useState } from "react";
import {
  View,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardScrollView } from "@/components/ui/KeyboardScrollView";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { useCustomAlert } from "@/src/context/CustomAlertContext";
import {
  formatBrazilianPhone,
  isBrazilianPhoneValueValid,
  normalizeBrazilianPhone,
} from "@/src/utils/phone";

export default function LoginScreen() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const { login, loginWithBiometrics, canUseBiometricLogin } = useAuth();
  const router = useRouter();
  const { showAlert } = useCustomAlert();

  const handleLogin = async () => {
    if (!phone.trim()) {
      return showAlert({
        title: "Aviso",
        message: "Por favor, digite seu telefone.",
        type: "info",
      });
    }
    if (!isBrazilianPhoneValueValid(phone)) {
      return showAlert({
        title: "Aviso",
        message: "Digite um telefone válido com DDD.",
        type: "info",
      });
    }
    if (!password.trim()) {
      return showAlert({
        title: "Aviso",
        message: "Por favor, digite sua senha.",
        type: "info",
      });
    }

    setLoading(true);
    try {
      await login(normalizeBrazilianPhone(phone), password);
      router.replace("/(drawer)");
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao fazer login",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    try {
      await loginWithBiometrics();
      router.replace("/(drawer)");
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao entrar com biometria",
        type: "error",
      });
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardScrollView
        keyboardVerticalOffset={0}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 20,
        }}
      >
        <View className="w-full max-w-md mx-auto">
          <View className="mb-12">
            <Text className="text-5xl font-sansBold text-white mb-2">
              Welcome<Text className="text-primary">.</Text>
            </Text>
            <Text className="text-muted text-lg font-sans">
              Acesse sua conta para continuar
            </Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
              Telefone
            </Text>
            <TextInput
              className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-primary"
              placeholder="(11) 99999-9999"
              placeholderTextColor="#525252"
              keyboardType="phone-pad"
              autoCorrect={false}
              value={phone}
              onChangeText={(value) => setPhone(formatBrazilianPhone(value))}
              selectionColor="#F9D16B"
            />
          </View>

          <View className="mb-10">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
              Senha
            </Text>
            <TextInput
              className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-primary"
              placeholder="••••••"
              placeholderTextColor="#525252"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              value={password}
              onChangeText={setPassword}
              selectionColor="#F9D16B"
            />
          </View>

          <Button
            variant="default"
            onPress={handleLogin}
            disabled={loading || !phone.trim() || !password.trim()}
            className="w-full rounded-[34px] p-5 bg-primary overflow-hidden"
            style={{
              shadowColor: "#F9D16B",
              shadowOpacity: 0.5,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {loading ? (
              <ActivityIndicator color="#080808" />
            ) : (
              <Text className="text-[#080808] text-center font-sansBold text-lg">
                Entrar
              </Text>
            )}
          </Button>

          {canUseBiometricLogin && (
            <Button
              variant="outline"
              onPress={handleBiometricLogin}
              disabled={biometricLoading || loading}
              className="w-full rounded-[34px] p-5 mt-4 border border-surfaceHighlight bg-surface"
            >
              {biometricLoading ? (
                <ActivityIndicator color="#F9D16B" />
              ) : (
                <Text className="text-white text-center font-sansBold text-lg">
                  Entrar com biometria
                </Text>
              )}
            </Button>
          )}

          <View className="mt-8 flex-row justify-center items-center">
            <Text className="text-muted font-sans mr-2">
              Ainda não tem conta?
            </Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-accentPurple font-sansBold">
                Cadastre-se
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardScrollView>
    </SafeAreaView>
  );
}
