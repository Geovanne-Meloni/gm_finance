import { useFocusEffect } from "@react-navigation/native";
import { Plus, Target } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Text } from "@/components/ui/Text";
import { createSavingsGoal, getSavingsGoals } from "@/src/api/savingsGoals";
import { SavingsGoal } from "@/src/api/types";

export default function GoalsScreen() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      return Alert.alert("Erro", "Preencha todos os campos corretamente");
    }

    setSubmitting(true);
    try {
      await createSavingsGoal({
        title,
        targetAmount: amountN,
        targetMonths: monthsN,
      });
      Alert.alert("Sucesso", "Meta criada com sucesso!");
      setTitle("");
      setTargetAmount("");
      setTargetMonths("");
      loadData();
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao criar meta");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && goals.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1 p-4 md:max-w-3xl md:mx-auto md:w-full"
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={loading && goals.length > 0}
            onRefresh={loadData}
            tintColor="#0f172a"
          />
        }
      >
        <Text className="text-2xl font-bold mb-6 mt-2">Metas de Economia</Text>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Nova Meta</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="mb-4">
              <Text className="text-sm font-medium mb-1 text-neutral-700">
                Título
              </Text>
              <TextInput
                className="border border-neutral-300 rounded-md p-3 bg-white"
                placeholder="Ex: Viagem, Carro Novo..."
                value={title}
                onChangeText={setTitle}
              />
            </View>
            <View className="mb-6">
              <Text className="text-sm font-medium mb-1 text-neutral-700">
                Valor Alvo (R$)
              </Text>
              <TextInput
                className="border border-neutral-300 rounded-md p-3 bg-white"
                keyboardType="numeric"
                placeholder="0.00"
                value={targetAmount}
                onChangeText={setTargetAmount}
              />
            </View>
            <View className="mb-6">
              <Text className="text-sm font-medium mb-1 text-neutral-700">
                Prazo (meses)
              </Text>
              <TextInput
                className="border border-neutral-300 rounded-md p-3 bg-white"
                keyboardType="numeric"
                placeholder="Ex: 24"
                value={targetMonths}
                onChangeText={setTargetMonths}
              />
            </View>
            <Button
              onPress={handleCreateGoal}
              disabled={!canCreate || submitting}
              className="w-full"
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Plus size={20} color="white" className="mr-2" />
                  <Text className="text-white font-bold ml-2">Criar Meta</Text>
                </View>
              )}
            </Button>
          </CardContent>
        </Card>

        <Text className="text-xl font-bold mb-4">Minhas Metas</Text>

        {error && <Text className="text-red-500 mb-4">{error}</Text>}

        {goals.length === 0 ? (
          <Text className="text-neutral-500 text-center py-4">
            Nenhuma meta configurada.
          </Text>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id} className="mb-4">
              <CardHeader className="pb-2 flex-row items-center justify-between">
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <Target size={20} color="#3b82f6" />
              </CardHeader>
              <CardContent>
                <View className="mb-2">
                  <Text className="text-sm text-neutral-500">
                    Falta: R$ {Number(goal.remainingAmount).toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm text-neutral-500">
                    R$ {Number(goal.currentAmount).toFixed(2)}
                  </Text>
                  <Text className="text-sm text-neutral-500">
                    R$ {Number(goal.targetAmount).toFixed(2)}
                  </Text>
                </View>
                <Progress
                  value={Number(goal.currentAmount)}
                  max={Number(goal.targetAmount)}
                  indicatorClassName="bg-blue-500"
                />
                <View className="mt-3 gap-1">
                  <Text className="text-sm text-neutral-600">
                    Progresso:{" "}
                    {Math.min(
                      100,
                      (Number(goal.currentAmount) / Number(goal.targetAmount)) *
                        100,
                    ).toFixed(1)}
                    %
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    Prazo alvo:{" "}
                    {goal.targetMonths == null ? "não informado" : `${goal.targetMonths} meses`}
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    Guardado mensal estimado:{" "}
                    {goal.jointMonthlyGuardado == null
                      ? "indisponível"
                      : `R$ ${Number(goal.jointMonthlyGuardado).toFixed(2)}`}
                  </Text>
                  <Text className="text-sm text-neutral-600">
                    Meses estimados restantes:{" "}
                    {goal.estimatedMonthsRemaining == null
                      ? "indisponível"
                      : goal.estimatedMonthsRemaining}
                  </Text>
                </View>
              </CardContent>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
