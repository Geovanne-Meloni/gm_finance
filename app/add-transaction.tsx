import { ArrowDownCircle, ArrowUpCircle, X } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  View,
  TouchableOpacity,
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
import { useCallback } from "react";
import { useCustomAlert } from "@/src/context/CustomAlertContext";

type EntryType = "ACTIVE_REVENUE" | "PASSIVE_REVENUE" | "EXPENSE_EXTRA";

export default function AddTransactionScreen() {
  const { userId } = useAuth();
  const router = useRouter();
  const { showAlert } = useCustomAlert();
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [rules, setRules] = useState<AllocationRule[]>([]);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Form state
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
      setRules(rows);
      setSelectedCategory((prev) => prev || rows[0]?.label || "");
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
    const n = Number(amount);
    if (Number.isNaN(n) || n <= 0) return false;
    if (
      type === "EXPENSE_EXTRA" &&
      (!reason.trim() || !selectedCategory.trim())
    )
      return false;
    if (type !== "EXPENSE_EXTRA" && !title.trim()) return false;
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) return false;
    return true;
  }, [
    userId,
    selectedOwnerId,
    title,
    amount,
    reason,
    selectedCategory,
    type,
    yearMonth,
  ]);

  const handleSubmit = async () => {
    if (!userId)
      return showAlert({
        title: "Erro",
        message: "Usuário não encontrado",
        type: "error",
      });
    if (!selectedOwnerId)
      return showAlert({
        title: "Erro",
        message: "Pessoa dona da transação é obrigatória",
        type: "error",
      });
    if (!amount || isNaN(Number(amount)))
      return showAlert({
        title: "Erro",
        message: "Valor inválido",
        type: "error",
      });
    if (type === "EXPENSE_EXTRA" && !reason.trim())
      return showAlert({
        title: "Erro",
        message: "Motivo é obrigatório para gastos extras",
        type: "error",
      });
    if (type === "EXPENSE_EXTRA" && !selectedCategory.trim())
      return showAlert({
        title: "Erro",
        message: "Categoria é obrigatória para gastos extras",
        type: "error",
      });
    if (type !== "EXPENSE_EXTRA" && !title.trim())
      return showAlert({
        title: "Erro",
        message: "Título da renda é obrigatório",
        type: "error",
      });
    if (!/^\d{4}-\d{2}$/.test(yearMonth))
      return showAlert({
        title: "Erro",
        message: "Mês inválido. Use YYYY-MM",
        type: "error",
      });

    setSubmitting(true);
    try {
      const numAmount = Number(amount);

      if (type !== "EXPENSE_EXTRA") {
        const revenueType: RevenueType =
          type === "ACTIVE_REVENUE" ? "ACTIVE" : "PASSIVE";

        await createRevenueEntry({
          userId: selectedOwnerId,
          createdByUserId: userId,
          amount: numAmount,
          yearMonth,
          title: title.trim(),
          revenueType,
        });
      } else {
        await createExtraTransaction({
          userId: selectedOwnerId,
          createdByUserId: userId,
          type: "EXPENSE",
          amount: numAmount,
          reason,
          category: selectedCategory,
          yearMonth,
        });
      }

      showAlert({
        title: "Sucesso",
        message: "Lançamento registrado com sucesso!",
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

  return (
    <SafeAreaView className="flex-1 bg-background relative">
      <View className="flex-row justify-between items-center px-6 pt-4 pb-2">
        <Text className="text-2xl font-sansBold text-white tracking-wide">
          Nova Transação
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
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="mb-8">
          <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-3">
            Tipo
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setType("ACTIVE_REVENUE")}
              className={`flex-1 flex-row items-center justify-center p-4 rounded-3xl border-2 ${
                type === "ACTIVE_REVENUE"
                  ? "border-primary bg-primary/10"
                  : "border-surfaceHighlight bg-surface"
              }`}
            >
              <ArrowUpCircle
                size={20}
                color={type === "ACTIVE_REVENUE" ? "#F9D16B" : "#838383"}
                className="mr-2"
              />
              <Text
                className={`font-sansBold ${type === "ACTIVE_REVENUE" ? "text-primary" : "text-muted"}`}
              >
                Ativa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setType("PASSIVE_REVENUE")}
              className={`flex-1 flex-row items-center justify-center p-4 rounded-3xl border-2 ${
                type === "PASSIVE_REVENUE"
                  ? "border-accentGreen bg-accentGreen/10"
                  : "border-surfaceHighlight bg-surface"
              }`}
            >
              <ArrowUpCircle
                size={20}
                color={type === "PASSIVE_REVENUE" ? "#57BF9C" : "#838383"}
                className="mr-2"
              />
              <Text
                className={`font-sansBold ${type === "PASSIVE_REVENUE" ? "text-accentGreen" : "text-muted"}`}
              >
                Passiva
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setType("EXPENSE_EXTRA")}
              className={`flex-1 flex-row items-center justify-center p-4 rounded-3xl border-2 ${
                type === "EXPENSE_EXTRA"
                  ? "border-expense bg-expense/10"
                  : "border-surfaceHighlight bg-surface"
              }`}
            >
              <ArrowDownCircle
                size={20}
                color={type === "EXPENSE_EXTRA" ? "#ff4d4d" : "#838383"}
                className="mr-2"
              />
              <Text
                className={`font-sansBold ${type === "EXPENSE_EXTRA" ? "text-expense" : "text-muted"}`}
              >
                Gasto
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {type !== "EXPENSE_EXTRA" && (
          <View className="mb-6">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
              Título da Renda
            </Text>
            <TextInput
              className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-primary"
              placeholder={
                type === "PASSIVE_REVENUE" ? "Ex: Aluguel" : "Ex: Salário"
              }
              placeholderTextColor="#525252"
              value={title}
              onChangeText={setTitle}
              selectionColor="#F9D16B"
            />
          </View>
        )}

        {type === "EXPENSE_EXTRA" && (
          <View className="mb-6">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
              Motivo / Descrição
            </Text>
            <TextInput
              className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-expense"
              placeholder="Ex: Mercado, Luz..."
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
            className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-primary"
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
            Mês (YYYY-MM)
          </Text>
          <TextInput
            className="border-2 border-surfaceHighlight rounded-[24px] p-5 bg-surface text-white text-lg font-mono focus:border-primary"
            placeholder="2026-05"
            placeholderTextColor="#525252"
            value={yearMonth}
            onChangeText={setYearMonth}
            autoCapitalize="none"
            autoCorrect={false}
            selectionColor="#F9D16B"
          />
        </View>

        {type === "EXPENSE_EXTRA" && rules.length > 0 && (
          <View className="mb-10">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-3 ml-2">
              Categoria
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
          </View>
        )}

        <Button
          onPress={handleSubmit}
          disabled={!canSubmit || submitting}
          className={`w-full rounded-[34px] p-5 overflow-hidden ${type === "EXPENSE_EXTRA" ? "bg-expense" : "bg-primary"}`}
        >
          {submitting ? (
            <ActivityIndicator color="#080808" />
          ) : (
            <Text className="text-[#080808] text-center font-sansBold text-lg">
              {type === "EXPENSE_EXTRA" ? "Registrar Gasto" : "Registrar Renda"}
            </Text>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
