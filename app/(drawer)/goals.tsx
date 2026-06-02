import { useFocusEffect } from "@react-navigation/native";
import { Plus, Target } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { Text } from "@/components/ui/Text";
import { createSavingsGoal, getSavingsGoals } from "@/src/api/savingsGoals";
import { SavingsGoal } from "@/src/api/types";
import { useCustomAlert } from "@/src/context/CustomAlertContext";

export default function GoalsScreen() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useCustomAlert();

  // Form state
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetMonths, setTargetMonths] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canCreate = useMemo(() => {
    const amountN = Number(targetAmount);
    const monthsN = Number(targetMonths);
    return (
      title.trim().length > 0 &&
      !Number.isNaN(amountN) &&
      amountN > 0 &&
      Number.isInteger(monthsN) &&
      monthsN > 0
    );
  }, [title, targetAmount, targetMonths]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSavingsGoals();
      setGoals(data);
    } catch (err: any) {
      setError(err.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleCreateGoal = async () => {
    const amountN = Number(targetAmount);
    const monthsN = Number(targetMonths);
    if (
      !title.trim() ||
      !targetAmount ||
      Number.isNaN(amountN) ||
      amountN <= 0 ||
      !Number.isInteger(monthsN) ||
      monthsN <= 0
    ) {
      return showAlert({
        title: "Aviso",
        message: "Preencha todos os campos corretamente.",
        type: "info",
      });
    }

    setSubmitting(true);
    try {
      await createSavingsGoal({
        title,
        targetAmount: amountN,
        targetMonths: monthsN,
      });
      showAlert({
        title: "Sucesso",
        message: "Meta criada com sucesso!",
        type: "success",
      });
      setTitle("");
      setTargetAmount("");
      setTargetMonths("");
      loadData();
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao criar meta",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && goals.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#F9D16B" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-background relative"
      edges={["left", "right", "bottom"]}
    >
      <ScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 60 }}
        refreshControl={
          <RefreshControl
            refreshing={loading && goals.length > 0}
            onRefresh={loadData}
            tintColor="#F9D16B"
          />
        }
      >
        <View className="bg-surface rounded-[34px] p-6 mb-8 border border-surfaceHighlight">
          <Text className="text-xl font-sansBold text-white tracking-wide mb-6">
            NOVA META
          </Text>

          <View className="mb-4">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
              Título
            </Text>
            <TextInput
              className="border-2 border-surfaceHighlight rounded-[24px] p-4 bg-background text-white text-lg font-mono focus:border-accentPurple"
              placeholder="Ex: Viagem, Carro Novo..."
              placeholderTextColor="#525252"
              value={title}
              onChangeText={setTitle}
              selectionColor="#C09FF8"
            />
          </View>

          <View className="flex-row gap-4 mb-8">
            <View className="flex-1">
              <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                Alvo (R$)
              </Text>
              <TextInput
                className="border-2 border-surfaceHighlight rounded-[24px] p-4 bg-background text-white text-lg font-mono focus:border-accentPurple"
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#525252"
                value={targetAmount}
                onChangeText={setTargetAmount}
                selectionColor="#C09FF8"
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                Prazo (Meses)
              </Text>
              <TextInput
                className="border-2 border-surfaceHighlight rounded-[24px] p-4 bg-background text-white text-lg font-mono focus:border-accentPurple"
                keyboardType="numeric"
                placeholder="Ex: 24"
                placeholderTextColor="#525252"
                value={targetMonths}
                onChangeText={setTargetMonths}
                selectionColor="#C09FF8"
              />
            </View>
          </View>

          <Button
            onPress={handleCreateGoal}
            disabled={!canCreate || submitting}
            className="w-full rounded-[34px] py-4 bg-accentPurple"
            style={{
              shadowColor: "#C09FF8",
              shadowOpacity: 0.4,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {submitting ? (
              <ActivityIndicator color="#080808" />
            ) : (
              <View className="flex-row items-center">
                <Plus size={24} color="#080808" className="mr-2" />
                <Text className="text-[#080808] font-sansBold text-lg">
                  Criar Meta
                </Text>
              </View>
            )}
          </Button>
        </View>

        <Text className="text-xl font-sansBold text-white tracking-widest uppercase mb-4 ml-2">
          Minhas Metas
        </Text>

        {error && (
          <View className="mb-6 p-4 rounded-[24px] bg-red-500/10 border border-red-500/50">
            <Text className="text-red-500 font-sansBold">{error}</Text>
          </View>
        )}

        {goals.length === 0 ? (
          <Text className="text-muted text-center py-4 font-sans">
            Nenhuma meta configurada ainda.
          </Text>
        ) : (
          goals.map((goal) => {
            const progressValue = Math.min(
              100,
              (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100,
            );

            return (
              <View
                key={goal.id}
                className="bg-surface rounded-[34px] p-6 mb-4 border border-surfaceHighlight"
              >
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-xl font-sansBold text-primary tracking-wide">
                    {goal.title}
                  </Text>
                  <View className="bg-primary/20 p-2 rounded-full">
                    <Target size={20} color="#F9D16B" />
                  </View>
                </View>

                <View className="flex-row justify-between mb-2">
                  <Text className="text-muted font-mono text-sm">
                    R$ {Number(goal.currentAmount).toFixed(0)}
                  </Text>
                  <Text className="text-muted font-mono text-sm">
                    R$ {Number(goal.targetAmount).toFixed(0)}
                  </Text>
                </View>

                <Progress
                  value={Number(goal.currentAmount)}
                  max={Number(goal.targetAmount)}
                  indicatorClassName="bg-primary"
                  className="h-3"
                />

                <View className="mt-6 flex-row flex-wrap gap-4">
                  <View className="w-[45%]">
                    <Text className="text-muted text-xs uppercase tracking-wider mb-1">
                      Falta
                    </Text>
                    <Text className="text-white font-mono">
                      R$ {Number(goal.remainingAmount).toFixed(0)}
                    </Text>
                  </View>
                  <View className="w-[45%]">
                    <Text className="text-muted text-xs uppercase tracking-wider mb-1">
                      Progresso
                    </Text>
                    <Text className="text-white font-mono">
                      {progressValue.toFixed(1)}%
                    </Text>
                  </View>
                  <View className="w-[45%]">
                    <Text className="text-muted text-xs uppercase tracking-wider mb-1">
                      Guardar/mês
                    </Text>
                    <Text className="text-white font-mono">
                      {goal.jointMonthlyGuardado == null
                        ? "N/A"
                        : `R$ ${Number(goal.jointMonthlyGuardado).toFixed(0)}`}
                    </Text>
                  </View>
                  <View className="w-[45%]">
                    <Text className="text-muted text-xs uppercase tracking-wider mb-1">
                      Meses rest.
                    </Text>
                    <Text className="text-white font-mono">
                      {goal.estimatedMonthsRemaining == null
                        ? "N/A"
                        : goal.estimatedMonthsRemaining}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
