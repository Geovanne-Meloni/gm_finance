import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  Filter,
  Search,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import {
  getExtraTransactions,
  getRevenueEntries,
} from "@/src/api/transactions";
import { ExtraTransaction, RevenueEntry } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";
import { formatCurrency, formatDate } from "@/src/utils/format";

type CombinedTransaction = {
  id: string;
  type: "REVENUE" | "EXPENSE";
  amount: number;
  title: string;
  yearMonth: string;
  category?: string | null;
  isPassive?: boolean;
};

export default function TransactionsListScreen() {
  const { userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"ALL" | "REVENUE" | "EXPENSE">("ALL");
  const [transactions, setTransactions] = useState<CombinedTransaction[]>([]);

  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      const [revenues, extras] = await Promise.all([
        getRevenueEntries(userId),
        getExtraTransactions(userId),
      ]);

      const combined: CombinedTransaction[] = [
        ...revenues.map((r: RevenueEntry) => ({
          id: r.id,
          type: "REVENUE" as const,
          amount: parseFloat(r.amount),
          title: r.title,
          yearMonth: r.yearMonth,
          isPassive: r.revenueType === "PASSIVE",
        })),
        ...extras.map((e: ExtraTransaction) => ({
          id: e.id,
          type: e.type,
          amount: parseFloat(e.amount),
          title: e.reason,
          yearMonth: e.yearMonth,
          category: e.category,
        })),
      ];

      // Sort by yearMonth descending (could improve with full date if available)
      combined.sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));

      setTransactions(combined);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.category?.toLowerCase().includes(search.toLowerCase()) ?? false);
      const matchesFilter = filter === "ALL" || t.type === filter;
      return matchesSearch && matchesFilter;
    });
  }, [transactions, search, filter]);

  const totals = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === "REVENUE") acc.revenue += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { revenue: 0, expense: 0 },
    );
  }, [filteredTransactions]);

  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#F9D16B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background"
      edges={["left", "right", "bottom"]}
    >
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row items-center justify-between mb-6">
          <Text className="text-white text-2xl font-sansBold tracking-widest uppercase">
            Histórico
          </Text>
          <View className="bg-surfaceHighlight p-2 rounded-full">
            <Filter size={20} color="#838383" />
          </View>
        </View>

        <View className="flex-row items-center bg-surface border border-surfaceHighlight rounded-2xl px-4 py-3 mb-6">
          <Search size={20} color="#525252" />
          <TextInput
            placeholder="Buscar por descrição ou categoria..."
            placeholderTextColor="#525252"
            value={search}
            onChangeText={setSearch}
            className="flex-1 ml-3 text-white font-sans text-base"
            selectionColor="#F9D16B"
          />
        </View>

        <View className="flex-row gap-3 mb-8">
          {(["ALL", "REVENUE", "EXPENSE"] as const).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              className={`flex-1 py-3 rounded-xl border items-center justify-center ${
                filter === f
                  ? "bg-primary/20 border-primary"
                  : "bg-surface border-surfaceHighlight"
              }`}
            >
              <Text
                className={`font-sansBold text-xs uppercase tracking-tighter ${
                  filter === f ? "text-primary" : "text-muted"
                }`}
              >
                {f === "ALL" ? "Todos" : f === "REVENUE" ? "Rendas" : "Gastos"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row justify-between mb-6">
          <View className="flex-row items-center">
            <TrendingUp size={16} color="#00e57a" />
            <Text className="text-[#00e57a] font-monoBold text-sm ml-2">
              {formatCurrency(totals.revenue)}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TrendingDown size={16} color="#ff4d4d" />
            <Text className="text-[#ff4d4d] font-monoBold text-sm ml-2">
              {formatCurrency(totals.expense)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor="#F9D16B"
          />
        }
      >
        {filteredTransactions.length === 0 ? (
          <View className="items-center justify-center py-20">
            <Text className="text-muted font-sans text-center">
              Nenhuma transação encontrada com os filtros atuais.
            </Text>
          </View>
        ) : (
          filteredTransactions.map((item, index) => (
            <View
              key={item.id}
              className="mb-4 bg-surface border border-surfaceHighlight rounded-[28px] p-5 flex-row items-center"
            >
              <View
                className={`p-3 rounded-2xl mr-4 ${
                  item.type === "REVENUE" ? "bg-gain/10" : "bg-expense/10"
                }`}
              >
                {item.type === "REVENUE" ? (
                  <ArrowUpCircle size={24} color="#00e57a" />
                ) : (
                  <ArrowDownCircle size={24} color="#ff4d4d" />
                )}
              </View>

              <View className="flex-1">
                <Text
                  className="text-white font-sansBold text-base leading-tight mb-1"
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
                <View className="flex-row items-center">
                  <Calendar size={12} color="#838383" />
                  <Text className="text-muted font-sans text-xs ml-1">
                    {formatDate(item.yearMonth)}
                  </Text>
                  {item.category && (
                    <>
                      <View className="w-1 h-1 bg-muted rounded-full mx-2" />
                      <Text className="text-accentPurple font-sansBold text-[10px] uppercase tracking-wider">
                        {item.category}
                      </Text>
                    </>
                  )}
                  {item.isPassive && (
                    <>
                      <View className="w-1 h-1 bg-muted rounded-full mx-2" />
                      <Text className="text-accentGreen font-sansBold text-[10px] uppercase tracking-wider">
                        PASSIVA
                      </Text>
                    </>
                  )}
                </View>
              </View>

              <View className="items-end">
                <Text
                  className={`font-monoBold text-base ${
                    item.type === "REVENUE" ? "text-gain" : "text-white"
                  }`}
                >
                  {item.type === "REVENUE" ? "+" : "-"}{" "}
                  {formatCurrency(item.amount).replace("R$", "").trim()}
                </Text>
                <Text className="text-muted font-mono text-[10px]">BRL</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
