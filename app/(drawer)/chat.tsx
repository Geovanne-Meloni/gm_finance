import { Send, Bot, User as UserIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { queryWhatsappBot } from "@/src/api/whatsapp";
import { useAuth } from "@/src/context/AuthContext";
import { useCustomAlert } from "@/src/context/CustomAlertContext";
import { onlyDigits } from "@/src/utils/phone";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  meta?: string;
};

function phoneToRemoteJid(phone: string | null): string | null {
  if (!phone) return null;
  const digits = onlyDigits(phone);
  if (!digits) return null;
  return `${digits}@s.whatsapp.net`;
}

export default function ChatScreen() {
  const { user } = useAuth();
  const { showAlert } = useCustomAlert();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Oi, eu sou o Rot!\nSeu assistente financeiro pessoal.",
    },
  ]);

  const remoteJid = useMemo(
    () => phoneToRemoteJid(user?.phone ?? null),
    [user],
  );
  const currentYearMonth = new Date().toISOString().slice(0, 7);

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    if (!remoteJid) {
      showAlert({
        title: "Erro",
        message:
          "Seu telefone cadastrado nao esta disponivel para montar o remoteJid.",
        type: "error",
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setSending(true);

    try {
      const response = await queryWhatsappBot({
        remoteJid,
        message: trimmed,
        yearMonth: currentYearMonth,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          text: response.answer,
          meta: response.toolName
            ? `${response.intent} via ${response.toolName}`
            : response.intent,
        },
      ]);
    } catch (err: any) {
      const errorMessage =
        err.message || "Falha ao consultar o bot financeiro.";

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: errorMessage,
          meta: "erro",
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
      >
        <View className="px-6 pt-4 pb-3 border-b border-surfaceHighlight bg-background">
          <Text className="text-white font-sansBold text-xl tracking-wide">
            Chat Financeiro
          </Text>
          <Text className="text-muted font-sans text-sm mt-1">
            {remoteJid ?? "Telefone indisponivel"}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-5"
          contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {messages.map((item) => {
            const isUser = item.role === "user";

            return (
              <View
                key={item.id}
                className={`max-w-[88%] rounded-[26px] px-4 py-4 border ${
                  isUser
                    ? "self-end bg-primary/15 border-primary/40"
                    : "self-start bg-surface border-surfaceHighlight"
                }`}
              >
                <View className="flex-row items-center mb-2">
                  {isUser ? (
                    <UserIcon size={16} color="#F9D16B" />
                  ) : (
                    <Bot size={16} color="#57BF9C" />
                  )}
                  <Text
                    className={`ml-2 font-sansBold text-xs uppercase tracking-wider ${
                      isUser ? "text-primary" : "text-accentGreen"
                    }`}
                  >
                    {isUser ? "Voce" : "Rot"}
                  </Text>
                </View>

                <Text className="text-white font-sans text-base leading-6">
                  {item.text}
                </Text>

                {item.meta ? (
                  <Text className="text-muted font-mono text-xs mt-3">
                    {item.meta}
                  </Text>
                ) : null}
              </View>
            );
          })}

          {sending ? (
            <View className="self-start rounded-[26px] px-4 py-4 border bg-surface border-surfaceHighlight">
              <ActivityIndicator color="#57BF9C" />
            </View>
          ) : null}
        </ScrollView>

        <View className="px-6 py-4 border-t border-surfaceHighlight bg-background flex-row items-center gap-3">
          <View className="flex-1 rounded-[24px] border border-surfaceHighlight bg-surface px-4 py-1">
            <TextInput
              value={message}
              onChangeText={setMessage}
              placeholder="Sua mensagem..."
              placeholderTextColor="#525252"
              multiline
              className="text-white font-sans text-base "
              selectionColor="#F9D16B"
              editable={!sending}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={sending || !message.trim() || !remoteJid}
            activeOpacity={0.7}
            className={`w-14 h-14 rounded-full items-center justify-center ${
              sending || !message.trim() || !remoteJid
                ? "bg-surfaceHighlight"
                : "bg-primary"
            }`}
          >
            {sending ? (
              <ActivityIndicator color="#080808" size="small" />
            ) : (
              <Send size={20} color="#080808" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
