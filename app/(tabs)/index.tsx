import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  LogOut,
  PlusCircle,
  Target,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Text } from "@/components/ui/Text";
import { getUserSummary } from "@/src/api/summary";
import { Summary } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";

/** Paleta suave para fatias do donut e legenda (splits). */
const SPLIT_CHART_COLORS = [
  "#86efac",
  "#93c5fd",
  "#fcd34d",
  "#c4b5fd",
  "#f9a8d4",
  "#a5e3e9",
];

export default function HomeScreen() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [yearMonth, setYearMonth] = useState(new Date().toISOString().slice(0, 7));
  const [yearMonthInput, setYearMonthInput] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId, logout } = useAuth();
  const router = useRouter();
  const summaryRef = useRef<Summary | null>(null);
  summaryRef.current = summary;

  const loadSummary = useCallback(async () => {
    if (!userId) return;
    const hadData = summaryRef.current !== null;
    if (!hadData) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
        throw new Error("Mês inválido. Use o formato YYYY-MM.");
      }
      const data = await getUserSummary(userId, yearMonth);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || "Failed to load summary");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, yearMonth]);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [loadSummary]),
  );

  if (loading && summary === null && !error) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color="#22c55e" />
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-neutral-50">
        <Text className="text-red-500 text-center mb-4">
          {error || "No data available"}
        </Text>
      </SafeAreaView>
    );
  }

  const totalRevenue = Number(summary.totalRevenueForSplit);
  const totalExpense = Number(summary.extraExpenseTotal);
  const balance = totalRevenue - totalExpense;

  const pieData = summary.splits.map((split, index) => ({
    value: Number(split.amount),
    color: SPLIT_CHART_COLORS[index % SPLIT_CHART_COLORS.length],
    text: `${split.percent}%`,
  }));

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1 p-4 md:max-w-3xl md:mx-auto md:w-full"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadSummary}
            tintColor="#0f172a"
          />
        }
      >
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <Text className="text-2xl font-bold">Resumo do Mês</Text>
          <Button variant="ghost" size="icon" onPress={logout}>
            <LogOut size={24} color="#ef4444" />
          </Button>
        </View>
        {error && (
          <Card className="mb-4 border-red-200">
            <CardContent className="pt-4">
              <Text className="text-red-500">{error}</Text>
            </CardContent>
          </Card>
        )}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Text className="text-sm font-medium mb-1 text-neutral-700">
              Mês de referência (YYYY-MM)
            </Text>
            <TextInput
              className="border border-neutral-300 rounded-md p-3 bg-white"
              value={yearMonthInput}
              onChangeText={setYearMonthInput}
              placeholder="2026-05"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Button
              className="mt-3"
              onPress={() => {
                if (!/^\d{4}-\d{2}$/.test(yearMonthInput)) {
                  setError("Mês inválido. Use o formato YYYY-MM.");
                  return;
                }
                setYearMonth(yearMonthInput);
              }}
            >
              <Text className="text-white font-medium">Atualizar mês</Text>
            </Button>
          </CardContent>
        </Card>

        <Button
          className="mb-6 w-full flex-row items-center px-5 py-3.5"
          variant="default"
          onPress={() => router.push("/transactions")}
        >
          <PlusCircle size={20} color="white" className="mr-2" />
          <Text className="ml-2 text-white font-bold text-base">
            Nova Renda / Gasto
          </Text>
        </Button>

        <View className="flex-row flex-wrap justify-between mb-6">
          <Card className="w-full md:w-[48%] mb-4">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm text-neutral-500">
                Rendas
              </CardTitle>
              <ArrowUpCircle size={16} color="#22c55e" />
            </CardHeader>
            <CardContent>
              <Text className="text-xl font-bold text-gain">
                R$ {totalRevenue.toFixed(2)}
              </Text>
            </CardContent>
          </Card>

          <Card className="w-full md:w-[48%] mb-4">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-sm text-neutral-500">Saídas</CardTitle>
              <ArrowDownCircle size={16} color="#ef4444" />
            </CardHeader>
            <CardContent>
              <Text className="text-xl font-bold text-expense">
                R$ {totalExpense.toFixed(2)}
              </Text>
            </CardContent>
          </Card>

          <Card className="w-full md:w-[48%] mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-neutral-500">
                Saldo Geral
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Text
                className={`text-xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                R$ {balance.toFixed(2)}
              </Text>
            </CardContent>
          </Card>
        </View>

        {summary.primaryGoal && (
          <Card className="mb-6">
            <CardHeader className="pb-2 flex-row items-center justify-between">
              <CardTitle className="text-lg">
                Meta: {summary.primaryGoal.title}
              </CardTitle>
              <Target size={20} color="#3b82f6" />
            </CardHeader>
            <CardContent>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-neutral-500">
                  R$ {Number(summary.primaryGoal.currentAmount).toFixed(2)}
                </Text>
                <Text className="text-sm text-neutral-500">
                  R$ {Number(summary.primaryGoal.targetAmount).toFixed(2)}
                </Text>
              </View>
              <Progress
                value={Number(summary.primaryGoal.currentAmount)}
                max={Number(summary.primaryGoal.targetAmount)}
                indicatorClassName="bg-blue-500"
              />
              <View className="mt-3 gap-1">
                <Text className="text-sm text-neutral-600">
                  Falta: R$ {Number(summary.primaryGoal.remainingAmount).toFixed(2)}
                </Text>
                <Text className="text-sm text-neutral-600">
                  Meses estimados restantes:{" "}
                  {summary.primaryGoal.estimatedMonthsRemaining == null
                    ? "indisponível"
                    : summary.primaryGoal.estimatedMonthsRemaining}
                </Text>
              </View>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Saldo disponível por categoria</CardTitle>
          </CardHeader>
          <CardContent className="items-center">
            {pieData.length > 0 ? (
              <View className="items-center justify-center">
                <PieChart
                  data={pieData}
                  donut
                  showText
                  textColor="#334155"
                  radius={120}
                  innerRadius={60}
                  textSize={12}
                />
                <View className="w-full mt-6 px-1">
                  {summary.splits.map((split, index) => {
                    const isLast = index === summary.splits.length - 1;
                    return (
                      <View
                        key={split.label}
                        className={`flex-row items-center w-full py-3 ${!isLast ? "border-b border-neutral-100" : ""}`}
                      >
                        <View
                          className="w-3 h-3 rounded-full mr-3 shrink-0"
                          style={{
                            backgroundColor:
                              SPLIT_CHART_COLORS[
                                index % SPLIT_CHART_COLORS.length
                              ],
                          }}
                        />
                        <Text className="text-sm text-neutral-600 flex-1">
                          {split.label}: disponível R$ {Number(split.amount).toFixed(2)} | planejado R$ {Number(split.plannedAmount).toFixed(2)} | gasto R$ {Number(split.spentAmount).toFixed(2)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : (
              <Text className="text-neutral-500 text-center py-4">
                Nenhuma distribuição configurada.
              </Text>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
