import { ArrowDownCircle, ArrowUpCircle, Repeat, X } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
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
import { useFocusEffect, useRouter } from "expo-router";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import {
  createExtraTransaction,
  createRevenueEntry,
} from "@/src/api/transactions";
import { getUserAllocationRules, getUsers } from "@/src/api/users";
import { AllocationRule, RevenueType, User } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";
import { useCustomAlert } from "@/src/context/CustomAlertContext";

type EntryType = "EXTRA_REVENUE" | "PASSIVE_REVENUE" | "EXPENSE_EXTRA";

export default function AddTransactionScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const { showAlert } = useCustomAlert();
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [rules, setRules] = useState<AllocationRule[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [type, setType] = useState<EntryType>("EXPENSE_EXTRA");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [yearMonth, setYearMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );

  const loadUsers = useCallback(async () => {
    try {
      const rows = await getUsers();
      setUsers(rows);
      setSelectedOwnerId((prev) => prev ?? userId ?? rows[0]?.id ?? null);
    } catch {}
  }, [userId]);

  const loadRules = useCallback(async (ownerId: string | null) => {
    if (!ownerId) {
      setRules([]);
      return;
    }

    try {
      const rows = await getUserAllocationRules(ownerId);
      const expenseRules = rows.filter((rule) => rule.kind === "EXPENSE");
      setRules(expenseRules);
      setSelectedCategory((prev) => prev || expenseRules[0]?.label || "");
    } catch {
      setRules([]);
      setSelectedCategory("");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers]),
  );

  useFocusEffect(
    useCallback(() => {
      loadRules(selectedOwnerId);
    }, [loadRules, selectedOwnerId]),
  );

  const canSubmit = useMemo(() => {
    if (!userId || !selectedOwnerId) return false;
    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) return false;
    if (type === "EXPENSE_EXTRA") {
      return reason.trim().length > 0;
    }
    return title.trim().length > 0 && /^\d{4}-\d{2}$/.test(yearMonth);
  }, [
    amount,
    reason,
    selectedCategory,
    selectedOwnerId,
    title,
    type,
    userId,
    yearMonth,
  ]);

  const handleSubmit = async () => {
    if (!userId || !selectedOwnerId) {
      return showAlert({
        title: "Erro",
        message: "Usuário da transação não encontrado.",
        type: "error",
      });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      return showAlert({
        title: "Erro",
        message: "Valor inválido.",
        type: "error",
      });
    }

    setSubmitting(true);
    try {
      if (type === "EXPENSE_EXTRA") {
        await createExtraTransaction({
          userId: selectedOwnerId,
          createdByUserId: userId,
          type: "EXPENSE",
          amount: numericAmount,
          reason: reason.trim(),
          category: selectedCategory.trim() || undefined,
          yearMonth,
        });
      } else {
        const revenueType: RevenueType =
          type === "PASSIVE_REVENUE" ? "PASSIVE" : "ACTIVE";

        await createRevenueEntry({
          userId: selectedOwnerId,
          createdByUserId: userId,
          amount: numericAmount,
          yearMonth,
          title: title.trim(),
          revenueType,
        });
      }

      showAlert({
        title: "Sucesso",
        message:
          type === "PASSIVE_REVENUE"
            ? "Renda passiva recorrente cadastrada com sucesso!"
            : "Lançamento registrado com sucesso!",
        type: "success",
        onConfirm: () => router.back(),
      });
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao registrar lançamento",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const titlePlaceholder =
    type === "PASSIVE_REVENUE" ? "Ex: Aluguel, dividendos" : "Ex: Freelance";

  return (
    <SafeAreaView className="flex-1 bg-background relative">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
          <Text className="text-2xl font-sansBold text-white tracking-wide">
            Novo Lançamento
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-surface p-2 rounded-full"
          >
            <X size={24} color="#838383" />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-6 pt-6"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 80 }}
        >
          <View className="mb-8">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-3">
              Tipo de Renda / Gasto
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setType("EXTRA_REVENUE")}
                className={`flex-1 items-center justify-center rounded-3xl border-2 p-4 ${
                  type === "EXTRA_REVENUE"
                    ? "border-primary bg-primary/10"
                    : "border-surfaceHighlight bg-surface"
                }`}
              >
                <ArrowUpCircle
                  size={20}
                  color={type === "EXTRA_REVENUE" ? "#F9D16B" : "#838383"}
                />
                <Text
                  className={`mt-2 font-sansBold ${type === "EXTRA_REVENUE" ? "text-primary" : "text-muted"}`}
                >
                  Extra
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType("PASSIVE_REVENUE")}
                className={`flex-1 items-center justify-center rounded-3xl border-2 p-4 ${
                  type === "PASSIVE_REVENUE"
                    ? "border-accentGreen bg-accentGreen/10"
                    : "border-surfaceHighlight bg-surface"
                }`}
              >
                <Repeat
                  size={20}
                  color={type === "PASSIVE_REVENUE" ? "#57BF9C" : "#838383"}
                />
                <Text
                  className={`mt-2 font-sansBold ${type === "PASSIVE_REVENUE" ? "text-accentGreen" : "text-muted"}`}
                >
                  Passiva
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType("EXPENSE_EXTRA")}
                className={`flex-1 items-center justify-center rounded-3xl border-2 p-4 ${
                  type === "EXPENSE_EXTRA"
                    ? "border-expense bg-expense/10"
                    : "border-surfaceHighlight bg-surface"
                }`}
              >
                <ArrowDownCircle
                  size={20}
                  color={type === "EXPENSE_EXTRA" ? "#ff4d4d" : "#838383"}
                />
                <Text
                  className={`mt-2 font-sansBold ${type === "EXPENSE_EXTRA" ? "text-expense" : "text-muted"}`}
                >
                  Gasto
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {type !== "EXPENSE_EXTRA" ? (
            <View className="mb-6">
              <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                Título
              </Text>
              <TextInput
                className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono"
                placeholder={titlePlaceholder}
                placeholderTextColor="#525252"
                value={title}
                onChangeText={setTitle}
                selectionColor="#F9D16B"
              />
            </View>
          ) : (
            <View className="mb-6">
              <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                Motivo / descrição
              </Text>
              <TextInput
                className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono"
                placeholder="Ex: Remédio, presente, conserto"
                placeholderTextColor="#525252"
                value={reason}
                onChangeText={setReason}
                selectionColor="#ff4d4d"
              />
            </View>
          )}

          <View className="mb-6">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
              Valor (R$)
            </Text>
            <TextInput
              className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono"
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#525252"
              value={amount}
              onChangeText={setAmount}
              selectionColor="#F9D16B"
            />
          </View>

          <View className="mb-8">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
              {type === "PASSIVE_REVENUE"
                ? "Início (YYYY-MM)"
                : "Mês (YYYY-MM)"}
            </Text>
            <TextInput
              className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono"
              placeholder="2026-06"
              placeholderTextColor="#525252"
              value={yearMonth}
              onChangeText={setYearMonth}
              selectionColor="#F9D16B"
            />
          </View>

          {type === "EXPENSE_EXTRA" && rules.length > 0 && (
            <View className="mb-10">
              <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-3 ml-2">
                Categoria do gasto (opcional)
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {rules.map((rule) => (
                  <TouchableOpacity
                    key={rule.id}
                    onPress={() => setSelectedCategory(rule.label)}
                    className={`px-5 py-3 rounded-full border-2 ${
                      selectedCategory === rule.label
                        ? "border-accentPurple bg-accentPurple/20"
                        : "border-surfaceHighlight bg-surface"
                    }`}
                  >
                    <Text
                      className={`font-sansBold ${selectedCategory === rule.label ? "text-accentPurple" : "text-muted"}`}
                    >
                      {rule.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                onPress={() => setSelectedCategory("")}
                className={`mt-3 self-start px-5 py-3 rounded-full border-2 ${
                  selectedCategory === ""
                    ? "border-primary bg-primary/10"
                    : "border-surfaceHighlight bg-surface"
                }`}
              >
                <Text
                  className={`font-sansBold ${selectedCategory === "" ? "text-primary" : "text-muted"}`}
                >
                  Sem categoria
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {type === "PASSIVE_REVENUE" && (
            <View className="mb-8 rounded-[24px] border border-surfaceHighlight bg-surface p-4">
              <Text className="text-muted font-sans text-sm">
                Esta renda vai entrar todos os meses a partir da data informada,
                até você cancelá-la nos ajustes.
              </Text>
            </View>
          )}

          <Button
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full rounded-[34px] p-5 overflow-hidden ${
              type === "EXPENSE_EXTRA"
                ? "bg-expense"
                : type === "PASSIVE_REVENUE"
                  ? "bg-accentGreen"
                  : "bg-primary"
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#080808" />
            ) : (
              <Text className="text-[#080808] text-center font-sansBold text-lg">
                {type === "EXPENSE_EXTRA"
                  ? "Registrar gasto"
                  : type === "PASSIVE_REVENUE"
                    ? "Cadastrar renda passiva"
                    : "Registrar renda extra"}
              </Text>
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
