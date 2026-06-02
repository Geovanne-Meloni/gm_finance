import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  LogOut,
  Plus,
  Target,
  Menu,
} from "lucide-react-native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Text } from "@/components/ui/Text";
import { getUserSummary } from "@/src/api/summary";
import { Summary } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";

const SPLIT_CHART_COLORS = [
  "#F9D16B", // Neon Yellow
  "#C09FF8", // Neon Purple
  "#57BF9C", // Mint Green
  "#00e57a",
  "#00f0ff",
  "#ff4d4d",
];

export default function HomeScreen() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [yearMonth, setYearMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [yearMonthInput, setYearMonthInput] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userId, logout } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
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
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F9D16B" />
      </SafeAreaView>
    );
  }

  if (!summary) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center p-6 bg-background">
        <Text className="text-red-500 text-center font-sansBold mb-4">
          {error || "No data available"}
        </Text>
        <Button onPress={logout} className="mt-4">
          <Text className="text-white">Sair</Text>
        </Button>
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
    textColor: "#080808",
  }));

  return (
    <SafeAreaView
      className="flex-1 bg-background relative"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadSummary}
            tintColor="#F9D16B"
          />
        }
      >
        {error && (
          <View className="mb-6 p-4 rounded-[24px] bg-red-500/10 border border-red-500/50">
            <Text className="text-red-500 font-sansBold">{error}</Text>
          </View>
        )}

        <View className="mb-8 items-center">
          <Text className="text-muted font-sans text-lg mb-1 tracking-wider uppercase">
            Your Balance
          </Text>
          <Text className="text-[42px] font-sansBold text-white tracking-tight">
            R$ {balance.toFixed(2)}
          </Text>
        </View>

        <View className="flex-row justify-between mb-8">
          <View className="w-[48%] bg-[#1A1A1A] rounded-[34px] p-5 border border-surfaceHighlight items-center flex-row">
            <View className="bg-gain/20 p-2 rounded-full mr-3">
              <ArrowUpCircle size={24} color="#00e57a" />
            </View>
            <View>
              <Text className="text-muted font-sans text-xs uppercase tracking-wider mb-1">
                Rendas
              </Text>
              <Text className="text-white font-sansBold text-lg">
                R$ {totalRevenue.toFixed(0)}
              </Text>
            </View>
          </View>

          <View className="w-[48%] bg-[#1A1A1A] rounded-[34px] p-5 border border-surfaceHighlight items-center flex-row">
            <View className="bg-expense/20 p-2 rounded-full mr-3">
              <ArrowDownCircle size={24} color="#ff4d4d" />
            </View>
            <View>
              <Text className="text-muted font-sans text-xs uppercase tracking-wider mb-1">
                Saídas
              </Text>
              <Text className="text-white font-sansBold text-lg">
                R$ {totalExpense.toFixed(0)}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-surface rounded-[34px] p-6 mb-8 border border-surfaceHighlight">
          <Text className="text-lg font-sansBold text-white mb-6 tracking-wide">
            Distribuição
          </Text>
          {pieData.length > 0 ? (
            <View className="items-center">
              <PieChart
                data={pieData}
                donut
                showText
                textColor="#080808"
                radius={110}
                innerRadius={70}
                textSize={14}
                backgroundColor="transparent"
                innerCircleColor="#1A1A1A"
              />
              <View className="w-full mt-8 gap-y-4">
                {summary.splits.map((split, index) => (
                  <View
                    key={split.label}
                    className="flex-row items-center justify-between"
                  >
                    <View className="flex-row items-center">
                      <View
                        className="w-4 h-4 rounded-full mr-3"
                        style={{
                          backgroundColor:
                            SPLIT_CHART_COLORS[
                              index % SPLIT_CHART_COLORS.length
                            ],
                        }}
                      />
                      <Text className="text-white font-sansBold text-base">
                        {split.label}
                      </Text>
                    </View>
                    <Text className="text-muted font-mono text-sm">
                      R$ {Number(split.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text className="text-muted text-center py-6 font-sans">
              Sem dados de distribuição.
            </Text>
          )}
        </View>

        {summary.primaryGoal && (
          <View className="bg-surface rounded-[34px] p-6 mb-8 border border-surfaceHighlight">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-sansBold text-white tracking-wide">
                Objetivo Principal
              </Text>
              <Target size={24} color="#00f0ff" />
            </View>
            <Text className="text-accentPurple font-sansBold text-xl mb-4">
              {summary.primaryGoal.title}
            </Text>
            <Progress
              value={Number(summary.primaryGoal.currentAmount)}
              max={Number(summary.primaryGoal.targetAmount)}
              indicatorClassName="bg-accentPurple"
            />
            <View className="flex-row justify-between mt-4">
              <View>
                <Text className="text-muted font-sans text-xs uppercase mb-1">
                  Atual
                </Text>
                <Text className="text-white font-mono">
                  R$ {Number(summary.primaryGoal.currentAmount).toFixed(0)}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-muted font-sans text-xs uppercase mb-1">
                  Meta
                </Text>
                <Text className="text-white font-mono">
                  R$ {Number(summary.primaryGoal.targetAmount).toFixed(0)}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View className="absolute bottom-10 self-center">
        <TouchableOpacity
          onPress={() => router.push("/add-transaction")}
          className="bg-primary size-16 rounded-full items-center justify-center"
          style={{
            shadowColor: "#F9D16B",
            shadowOpacity: 0.6,
            shadowRadius: 15,
            shadowOffset: { width: 0, height: 4 },
          }}
        >
          <Plus size={32} color="#080808" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
