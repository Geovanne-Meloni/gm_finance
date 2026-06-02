import { useFocusEffect } from "@react-navigation/native";
import { Save, Settings, Trash2 } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import {
  getUserAllocationRules,
  getUsers,
  updateUserAllocationRules,
  updateUserMonthlySalary,
} from "@/src/api/users";
import { AllocationRule, User } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";

type EditableRule = {
  key: string;
  label: string;
  percent: string;
};

function parseRulesToEditable(rules: AllocationRule[]): EditableRule[] {
  return rules.map((r) => ({
    key: r.id,
    label: r.label,
    percent: String(r.percent),
  }));
}

export default function SettingsScreen() {
  const { userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [salary, setSalary] = useState("");
  const [rules, setRules] = useState<EditableRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSalary, setSavingSalary] = useState(false);
  const [savingRules, setSavingRules] = useState(false);

  const loadUsersAndRules = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getUsers();
      setUsers(rows);
      const effectiveUserId = selectedUserId ?? userId ?? rows[0]?.id ?? null;
      setSelectedUserId(effectiveUserId);
      if (!effectiveUserId) {
        setRules([]);
        setSalary("");
        return;
      }
      const selectedUser = rows.find((u) => u.id === effectiveUserId) ?? null;
      setSalary(selectedUser?.monthlySalary ?? "");
      const loadedRules = await getUserAllocationRules(effectiveUserId);
      setRules(parseRulesToEditable(loadedRules));
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao carregar configurações");
    } finally {
      setLoading(false);
    }
  }, [selectedUserId, userId]);

  useFocusEffect(
    useCallback(() => {
      loadUsersAndRules();
    }, [loadUsersAndRules]),
  );

  const sumPercent = useMemo(
    () =>
      rules.reduce((sum, r) => {
        const n = Number(r.percent);
        return Number.isNaN(n) ? sum : sum + n;
      }, 0),
    [rules],
  );

  const handleSelectUser = async (nextUserId: string) => {
    setSelectedUserId(nextUserId);
    const selectedUser = users.find((u) => u.id === nextUserId) ?? null;
    setSalary(selectedUser?.monthlySalary ?? "");
    try {
      const loadedRules = await getUserAllocationRules(nextUserId);
      setRules(parseRulesToEditable(loadedRules));
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao carregar regras da pessoa");
    }
  };

  const handleSaveSalary = async () => {
    if (!selectedUserId) return;
    const salaryTrim = salary.trim();
    const parsed = salaryTrim === "" ? null : Number(salaryTrim);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      Alert.alert("Erro", "Salário mensal inválido.");
      return;
    }

    setSavingSalary(true);
    try {
      await updateUserMonthlySalary(selectedUserId, parsed);
      Alert.alert("Sucesso", "Salário mensal atualizado.");
      const rows = await getUsers();
      setUsers(rows);
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao salvar salário mensal");
    } finally {
      setSavingSalary(false);
    }
  };

  const handleSaveRules = async () => {
    if (!selectedUserId) return;

    const normalized = rules.map((r) => ({
      label: r.label.trim(),
      percent: Number(r.percent),
    }));

    if (normalized.some((r) => !r.label || Number.isNaN(r.percent) || r.percent < 0)) {
      Alert.alert("Erro", "Preencha todas as regras com nome e percentual válidos.");
      return;
    }

    const total = normalized.reduce((sum, r) => sum + r.percent, 0);
    if (Math.abs(total - 100) > 0.001) {
      Alert.alert("Erro", "A soma dos percentuais precisa ser 100%.");
      return;
    }

    setSavingRules(true);
    try {
      const saved = await updateUserAllocationRules(selectedUserId, normalized);
      setRules(parseRulesToEditable(saved));
      Alert.alert("Sucesso", "Faixas percentuais salvas.");
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha ao salvar regras");
    } finally {
      setSavingRules(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-neutral-50">
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ScrollView
        className="flex-1 p-4 md:max-w-3xl md:mx-auto md:w-full"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="flex-row justify-between items-center mb-6 mt-2">
          <Text className="text-2xl font-bold">Configurações</Text>
          <Settings size={24} color="#64748b" />
        </View>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Pessoa</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row flex-wrap gap-2">
              {users.map((u) => (
                <Button
                  key={u.id}
                  variant={selectedUserId === u.id ? "default" : "outline"}
                  onPress={() => handleSelectUser(u.id)}
                >
                  <Text
                    className={
                      selectedUserId === u.id
                        ? "text-white font-medium"
                        : "text-neutral-700"
                    }
                  >
                    {u.name}
                  </Text>
                </Button>
              ))}
            </View>
          </CardContent>
        </Card>

        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-lg">Salário Mensal de Projeção</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-sm font-medium mb-1 text-neutral-700">
              Salário (R$)
            </Text>
            <TextInput
              className="border border-neutral-300 rounded-md p-3 bg-white text-lg"
              keyboardType="numeric"
              placeholder="Ex: 3000"
              value={salary}
              onChangeText={setSalary}
            />
            <Button
              className="mt-3"
              onPress={handleSaveSalary}
              disabled={!selectedUserId || savingSalary}
            >
              {savingSalary ? (
                <ActivityIndicator color="white" />
              ) : (
                <View className="flex-row items-center">
                  <Save size={16} color="white" />
                  <Text className="text-white font-medium ml-2">
                    Salvar Salário
                  </Text>
                </View>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Faixas Percentuais</CardTitle>
          </CardHeader>
          <CardContent>
            <Text
              className={`text-sm mb-3 ${Math.abs(sumPercent - 100) <= 0.001 ? "text-emerald-600" : "text-red-500"}`}
            >
              Soma atual: {sumPercent.toFixed(2)}%
            </Text>

            {rules.map((rule, index) => (
              <View key={rule.key} className="mb-3 border border-neutral-200 rounded-lg p-3">
                <Text className="text-xs text-neutral-500 mb-2">Regra #{index + 1}</Text>
                <Text className="text-sm font-medium mb-1 text-neutral-700">Categoria</Text>
                <TextInput
                  className="border border-neutral-300 rounded-md p-3 bg-white mb-2"
                  value={rule.label}
                  onChangeText={(text) => {
                    setRules((prev) =>
                      prev.map((r) => (r.key === rule.key ? { ...r, label: text } : r)),
                    );
                  }}
                  placeholder="Ex: contas"
                />
                <Text className="text-sm font-medium mb-1 text-neutral-700">Percentual</Text>
                <TextInput
                  className="border border-neutral-300 rounded-md p-3 bg-white"
                  keyboardType="numeric"
                  value={rule.percent}
                  onChangeText={(text) => {
                    setRules((prev) =>
                      prev.map((r) => (r.key === rule.key ? { ...r, percent: text } : r)),
                    );
                  }}
                  placeholder="Ex: 25"
                />
                <Button
                  variant="outline"
                  className="mt-2 border-red-300"
                  onPress={() =>
                    setRules((prev) => prev.filter((r) => r.key !== rule.key))
                  }
                >
                  <View className="flex-row items-center">
                    <Trash2 size={14} color="#ef4444" />
                    <Text className="text-red-500 ml-2">Remover</Text>
                  </View>
                </Button>
              </View>
            ))}

            <Button
              variant="outline"
              className="mb-3"
              onPress={() =>
                setRules((prev) => [
                  ...prev,
                  {
                    key: `new-${Date.now()}-${prev.length}`,
                    label: "",
                    percent: "0",
                  },
                ])
              }
            >
              <Text className="text-neutral-700">Adicionar faixa</Text>
            </Button>

            <Button
              onPress={handleSaveRules}
              disabled={!selectedUserId || savingRules}
            >
              {savingRules ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-medium">Salvar faixas</Text>
              )}
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
