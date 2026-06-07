import { useFocusEffect } from "@react-navigation/native";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  Target,
} from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { KeyboardScrollView } from "@/components/ui/KeyboardScrollView";
import { Progress } from "@/components/ui/Progress";
import { Text } from "@/components/ui/Text";
import {
  createSavingsGoal,
  getSavingsGoals,
  moveSavingsGoalBalance,
} from "@/src/api/savingsGoals";
import { getUserSummary } from "@/src/api/summary";
import { SavingsGoal, Summary } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";
import { useCustomAlert } from "@/src/context/CustomAlertContext";
import { formatCurrency } from "@/src/utils/format";

type GoalMovement = "DEPOSIT" | "WITHDRAW";

export default function GoalsScreen() {
  const { userId } = useAuth();
  const { showAlert } = useCustomAlert();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [movementAmounts, setMovementAmounts] = useState<
    Record<string, string>
  >({});
  const [movingGoalId, setMovingGoalId] = useState<string | null>(null);

  const canCreate = useMemo(() => {
    const amount = Number(targetAmount);
    return title.trim().length > 0 && !Number.isNaN(amount) && amount > 0;
  }, [title, targetAmount]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const yearMonth = new Date().toISOString().slice(0, 7);
      const [goalsData, summaryData] = await Promise.all([
        getSavingsGoals(),
        getUserSummary(userId, yearMonth),
      ]);
      setGoals(goalsData);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || "Falha ao carregar metas");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleCreateGoal = async () => {
    const amount = Number(targetAmount);
    if (!title.trim() || Number.isNaN(amount) || amount <= 0) {
      return showAlert({
        title: "Aviso",
        message: "Preencha título e valor alvo corretamente.",
        type: "info",
      });
    }

    setSubmitting(true);
    try {
      await createSavingsGoal({
        title: title.trim(),
        targetAmount: amount,
      });
      setTitle("");
      setTargetAmount("");
      await loadData();
      showAlert({
        title: "Sucesso",
        message: "Meta criada com sucesso.",
        type: "success",
      });
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

  const handleMoveGoalBalance = async (
    goal: SavingsGoal,
    movement: GoalMovement,
  ) => {
    if (!userId) {
      return showAlert({
        title: "Erro",
        message: "Sessão inválida.",
        type: "error",
      });
    }

    const amount = Number(movementAmounts[goal.id] ?? "");
    if (Number.isNaN(amount) || amount <= 0) {
      return showAlert({
        title: "Aviso",
        message: "Informe um valor válido para movimentar a meta.",
        type: "info",
      });
    }

    const currentAmount = Number(goal.currentAmount);
    const nextAmount =
      movement === "DEPOSIT" ? currentAmount + amount : currentAmount - amount;

    if (nextAmount < 0) {
      return showAlert({
        title: "Aviso",
        message: "A retirada não pode deixar a meta negativa.",
        type: "info",
      });
    }

    setMovingGoalId(goal.id);
    try {
      await moveSavingsGoalBalance(goal.id, {
        amount,
        direction: movement,
      });

      setMovementAmounts((prev) => ({ ...prev, [goal.id]: "" }));
      await loadData();
      showAlert({
        title: "Sucesso",
        message:
          movement === "DEPOSIT"
            ? "Valor aportado na meta."
            : "Valor retirado da meta.",
        type: "success",
      });
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao movimentar meta",
        type: "error",
      });
    } finally {
      setMovingGoalId(null);
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
      <KeyboardScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
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

            <View className="mb-8">
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
              const isPrimary = summary?.primaryGoal?.id === goal.id;
              const savingsSplit = summary?.splits.find(
                (s) => s.kind === "SAVINGS",
              );
              const savingsAmount =
                isPrimary && savingsSplit ? Number(savingsSplit.amount) : 0;

              const current = Number(goal.currentAmount) + savingsAmount;
              const target = Number(goal.targetAmount);
              const progressValue =
                target <= 0 ? 0 : Math.min(100, (current / target) * 100);
              const movementValue = movementAmounts[goal.id] ?? "";

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
                      {formatCurrency(current)}
                    </Text>
                    <Text className="text-muted font-mono text-sm">
                      {formatCurrency(target)}
                    </Text>
                  </View>

                  <Progress
                    value={current}
                    max={target}
                    indicatorClassName="bg-primary"
                    className="h-3"
                  />

                  <View className="mt-6 flex-row flex-wrap gap-4">
                    <View className="w-[45%]">
                      <Text className="text-muted text-xs uppercase tracking-wider mb-1">
                        Falta
                      </Text>
                      <Text className="text-white font-mono">
                        {formatCurrency(goal.remainingAmount)}
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
                          : formatCurrency(goal.jointMonthlyGuardado)}
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

                  <View className="mt-6 rounded-[24px] border border-surfaceHighlight bg-background p-4">
                    <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                      Movimentar cofre
                    </Text>
                    <TextInput
                      className="border-2 border-surfaceHighlight rounded-[20px] p-4 bg-surface text-white text-lg font-mono mb-4"
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#525252"
                      value={movementValue}
                      onChangeText={(value) =>
                        setMovementAmounts((prev) => ({
                          ...prev,
                          [goal.id]: value,
                        }))
                      }
                      selectionColor="#F9D16B"
                    />

                    <View className="flex-row gap-3">
                      <Button
                        onPress={() => handleMoveGoalBalance(goal, "DEPOSIT")}
                        disabled={movingGoalId === goal.id}
                        className="flex-1 rounded-[24px] py-4 bg-primary"
                      >
                        <View className="flex-row items-center justify-center">
                          <ArrowUpCircle
                            size={18}
                            color="#080808"
                            className="mr-2"
                          />
                          <Text className="text-[#080808] font-sansBold">
                            Aportar
                          </Text>
                        </View>
                      </Button>
                      <Button
                        onPress={() => handleMoveGoalBalance(goal, "WITHDRAW")}
                        disabled={movingGoalId === goal.id}
                        className="flex-1 rounded-[24px] py-4 bg-expense"
                      >
                        <View className="flex-row items-center justify-center">
                          <ArrowDownCircle
                            size={18}
                            color="#ffffff"
                            className="mr-2"
                          />
                          <Text className="text-white font-sansBold">
                            Retirar
                          </Text>
                        </View>
                      </Button>
                    </View>
                  </View>
                </View>
              );
          })
        )}
      </KeyboardScrollView>
    </SafeAreaView>
  );
}
