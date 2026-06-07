import React, { useState } from "react";
import {
  View,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCustomAlert } from "@/src/context/CustomAlertContext";
import {
  formatBrazilianPhone,
  isBrazilianPhoneValueValid,
  normalizeBrazilianPhone,
} from "@/src/utils/phone";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { showAlert } = useCustomAlert();

  const handleRegister = async () => {
    if (!name.trim())
      return showAlert({
        title: "Aviso",
        message: "Por favor, digite seu nome.",
        type: "info",
      });
    if (!phone.trim())
      return showAlert({
        title: "Aviso",
        message: "Por favor, digite seu telefone.",
        type: "info",
      });
    if (!isBrazilianPhoneValueValid(phone)) {
      return showAlert({
        title: "Aviso",
        message: "Digite um telefone válido com DDD.",
        type: "info",
      });
    }
    if (!password.trim())
      return showAlert({
        title: "Aviso",
        message: "Por favor, digite sua senha.",
        type: "info",
      });

    setLoading(true);
    try {
      await register(name.trim(), normalizeBrazilianPhone(phone), password);
      router.replace("/(drawer)");
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao criar conta",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 20,
          }}
        >
          <View className="w-full max-w-md mx-auto">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-8 self-start p-2 -ml-2 rounded-full bg-surfaceHighlight"
            >
              <ArrowLeft size={24} color="#F9D16B" />
            </TouchableOpacity>

            <View className="mb-10">
              <Text className="text-5xl font-sansBold text-white mb-2">
                Join us<Text className="text-accentPurple">.</Text>
              </Text>
              <Text className="text-muted text-lg font-sans">
                Crie sua conta para gerenciar seu dinheiro
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                Nome Completo
              </Text>
              <TextInput
                className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-accentPurple"
                placeholder="João Silva"
                placeholderTextColor="#525252"
                autoCorrect={false}
                value={name}
                onChangeText={setName}
                selectionColor="#C09FF8"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                Telefone (com DDI)
              </Text>
              <TextInput
                className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-accentPurple"
                placeholder="(11) 99999-9999"
                placeholderTextColor="#525252"
                keyboardType="phone-pad"
                autoCorrect={false}
                value={phone}
                onChangeText={(value) => setPhone(formatBrazilianPhone(value))}
                selectionColor="#C09FF8"
              />
            </View>

            <View className="mb-10">
              <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                Senha
              </Text>
              <TextInput
                className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-accentPurple"
                placeholder="••••••"
                placeholderTextColor="#525252"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                value={password}
                onChangeText={setPassword}
                selectionColor="#C09FF8"
              />
            </View>

            <Button
              variant="default"
              onPress={handleRegister}
              disabled={
                loading || !name.trim() || !phone.trim() || !password.trim()
              }
              className="w-full rounded-[34px] p-5 bg-accentPurple overflow-hidden"
              style={{
                shadowColor: "#C09FF8",
                shadowOpacity: 0.5,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 4 },
              }}
            >
              {loading ? (
                <ActivityIndicator color="#080808" />
              ) : (
                <Text className="text-[#080808] text-center font-sansBold text-lg">
                  Criar Conta
                </Text>
              )}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
