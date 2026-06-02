import { ArrowDownCircle, ArrowUpCircle, ListPlus } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import {
  createExtraTransaction,
  createRevenueEntry,
} from "@/src/api/transactions";
import { getUserAllocationRules, getUsers } from "@/src/api/users";
import { AllocationRule, RevenueType, User } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";
import { useCallback } from "react";

type EntryType = "ACTIVE_REVENUE" | "PASSIVE_REVENUE" | "EXPENSE_EXTRA";

export default function TransactionsScreen() {
  const { userId } = useAuth();
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
  const [yearMonth, setYearMonth] = useState(new Date().toISOString().slice(0, 7));

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
    if (type === "EXPENSE_EXTRA" && (!reason.trim() || !selectedCategory.trim())) return false;
    if (type !== "EXPENSE_EXTRA" && !title.trim()) return false;
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) return false;
    return true;
  }, [userId, selectedOwnerId, title, amount, reason, selectedCategory, type, yearMonth]);

  const handleSubmit = async () => {
    if (!userId) return Alert.alert("Erro", "Usuário não encontrado");
    if (!selectedOwnerId) return Alert.alert("Erro", "Pessoa dona da transação é obrigatória");
    if (!amount || isNaN(Number(amount)))
      return Alert.alert("Erro", "Valor inválido");
    if (type === "EXPENSE_EXTRA" && !reason.trim())
      return Alert.alert("Erro", "Motivo é obrigatório para gastos extras");
    if (type === "EXPENSE_EXTRA" && !selectedCategory.trim())
      return Alert.alert("Erro", "Categoria é obrigatória para gastos extras");
    if (type !== "EXPENSE_EXTRA" && !title.trim())
      return Alert.alert("Erro", "Título da renda é obrigatório");
    if (!/^\d{4}-\d{2}$/.test(yearMonth))
      return Alert.alert("Erro", "Mês inválido. Use YYYY-MM");

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

      Alert.alert("Sucesso", "Lançamento registrado com sucesso!");
      setTitle("");
      setAmount("");
      setReason("");
      setSelectedCategory((prev) => prev || rules[0]?.label || "");
      setYearMonth(new Date().toISOString().slice(0, 7));
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao registrar lançamento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1 p-4 md:max-w-3xl md:mx-auto md:w-full"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <Text className="text-2xl font-bold">Nova Renda / Gasto</Text>
          <ListPlus size={28} color="#64748b" />
        </View>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Tipo de Movimentação</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="mb-4">
              <Text className="text-sm font-medium mb-1 text-neutral-700">
                Pessoa dona do lançamento
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {users.map((u) => (
                  <Button
                    key={u.id}
                    variant={selectedOwnerId === u.id ? "default" : "outline"}
                    onPress={() => setSelectedOwnerId(u.id)}
                    className="px-3 py-2"
                  >
                    <Text
                      className={
                        selectedOwnerId === u.id
                          ? "text-white font-medium"
                          : "text-neutral-700"
                      }
                    >
                      {u.name}
                    </Text>
                  </Button>
                ))}
              </View>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Button
                variant={type === "ACTIVE_REVENUE" ? "default" : "outline"}
                className={`flex-1 min-w-[100px] ${type === "ACTIVE_REVENUE" ? "bg-blue-500 border-blue-500" : ""}`}
                onPress={() => setType("ACTIVE_REVENUE")}
              >
                <View className="flex-row items-center justify-center">
                  <ArrowUpCircle
                    size={16}
                    color={type === "ACTIVE_REVENUE" ? "white" : "#3b82f6"}
                    className="mr-2"
                  />
                  <Text
                    className={`${type === "ACTIVE_REVENUE" ? "text-white font-medium" : "text-neutral-700"} ml-2`}
                  >
                    Renda Ativa
                  </Text>
                </View>
              </Button>

              <Button
                variant={type === "PASSIVE_REVENUE" ? "default" : "outline"}
                className={`flex-1 min-w-[100px] ${type === "PASSIVE_REVENUE" ? "bg-emerald-500 border-emerald-500" : ""}`}
                onPress={() => setType("PASSIVE_REVENUE")}
              >
                <View className="flex-row items-center justify-center">
                  <ArrowUpCircle
                    size={16}
                    color={type === "PASSIVE_REVENUE" ? "white" : "#22c55e"}
                    className="mr-2"
                  />
                  <Text
                    className={`${
                      type === "PASSIVE_REVENUE"
                        ? "text-white font-medium"
                        : "text-neutral-700"
                    } ml-2`}
                  >
                    Renda Passiva
                  </Text>
                </View>
              </Button>

              <Button
                variant={type === "EXPENSE_EXTRA" ? "default" : "outline"}
                className={`w-full mt-2 ${type === "EXPENSE_EXTRA" ? "bg-red-500 border-red-500" : ""}`}
                onPress={() => setType("EXPENSE_EXTRA")}
              >
                <View className="flex-row items-center justify-center">
                  <ArrowDownCircle
                    size={16}
                    color={type === "EXPENSE_EXTRA" ? "white" : "#ef4444"}
                    className="mr-2"
                  />
                  <Text
                    className={`${
                      type === "EXPENSE_EXTRA"
                        ? "text-white font-medium"
                        : "text-neutral-700"
                    } ml-2`}
                  >
                    Gasto Extra
                  </Text>
                </View>
              </Button>
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardContent className="pt-6">
            {type !== "EXPENSE_EXTRA" && (
              <View className="mb-4">
                <Text className="text-sm font-medium mb-1 text-neutral-700">
                  Título da renda
                </Text>
                <TextInput
                  className="border border-neutral-300 rounded-md p-3 bg-white text-lg"
                  placeholder={
                    type === "PASSIVE_REVENUE"
                      ? "Ex: Aluguel"
                      : "Ex: Salário"
                  }
                  value={title}
                  onChangeText={setTitle}
                />
                <Text className="text-xs text-neutral-500 mt-2">
                  Exemplo: {type === "PASSIVE_REVENUE" ? "Aluguel: +500/mês" : "Salário: +2400/mês"}
                </Text>
              </View>
            )}
            <View className="mb-4">
              <Text className="text-sm font-medium mb-1 text-neutral-700">
                Valor (R$)
              </Text>
              <TextInput
                className="border border-neutral-300 rounded-md p-3 bg-white text-lg"
                keyboardType="numeric"
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View className="mb-4">
              <Text className="text-sm font-medium mb-1 text-neutral-700">
                Mês de referência (YYYY-MM)
              </Text>
              <TextInput
                className="border border-neutral-300 rounded-md p-3 bg-white text-lg"
                placeholder="2026-05"
                value={yearMonth}
                onChangeText={setYearMonth}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {type === "EXPENSE_EXTRA" && (
              <View className="mb-6">
                <Text className="text-sm font-medium mb-1 text-neutral-700">
                  Motivo / Descrição
                </Text>
                <TextInput
                  className="border border-neutral-300 rounded-md p-3 bg-white text-lg"
                  placeholder="Ex: Mercado, Conta de Luz..."
                  value={reason}
                  onChangeText={setReason}
                />
                <Text className="text-sm font-medium mt-4 mb-1 text-neutral-700">
                  Categoria do gasto
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {rules.map((rule) => (
                    <Button
                      key={rule.id}
                      variant={selectedCategory === rule.label ? "default" : "outline"}
                      onPress={() => setSelectedCategory(rule.label)}
                      className="px-3 py-2"
                    >
                      <Text
                        className={
                          selectedCategory === rule.label
                            ? "text-white font-medium"
                            : "text-neutral-700"
                        }
                      >
                        {rule.label}
                      </Text>
                    </Button>
                  ))}
                </View>
              </View>
            )}

            <Button
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              className="w-full py-4"
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {type === "EXPENSE_EXTRA" ? "Registrar Gasto" : "Registrar Renda"}
                </Text>
              )}
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
