import { useFocusEffect } from "@react-navigation/native";
import { Save, Trash2, PlusCircle } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import {
  getUserAllocationRules,
  getUsers,
  updateUserAllocationRules,
  updateUserMonthlySalary,
} from "@/src/api/users";
import { AllocationRule, User } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";
import { useCustomAlert } from "@/src/context/CustomAlertContext";

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
  const { showAlert } = useCustomAlert();
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
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao carregar configurações",
        type: "error",
      });
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
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao carregar regras da pessoa",
        type: "error",
      });
    }
  };

  const handleSaveSalary = async () => {
    if (!selectedUserId) return;
    const salaryTrim = salary.trim();
    const parsed = salaryTrim === "" ? null : Number(salaryTrim);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      showAlert({
        title: "Aviso",
        message: "Salário mensal inválido.",
        type: "info",
      });
      return;
    }

    setSavingSalary(true);
    try {
      await updateUserMonthlySalary(selectedUserId, parsed);
      showAlert({
        title: "Sucesso",
        message: "Salário mensal atualizado.",
        type: "success",
      });
      const rows = await getUsers();
      setUsers(rows);
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao salvar salário mensal",
        type: "error",
      });
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

    if (
      normalized.some(
        (r) => !r.label || Number.isNaN(r.percent) || r.percent < 0,
      )
    ) {
      showAlert({
        title: "Aviso",
        message: "Preencha todas as regras com nome e percentual válidos.",
        type: "info",
      });
      return;
    }

    const total = normalized.reduce((sum, r) => sum + r.percent, 0);
    if (Math.abs(total - 100) > 0.001) {
      showAlert({
        title: "Aviso",
        message: "A soma dos percentuais precisa ser 100%.",
        type: "info",
      });
      return;
    }

    setSavingRules(true);
    try {
      const saved = await updateUserAllocationRules(selectedUserId, normalized);
      setRules(parseRulesToEditable(saved));
      showAlert({
        title: "Sucesso",
        message: "Faixas percentuais salvas.",
        type: "success",
      });
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao salvar regras",
        type: "error",
      });
    } finally {
      setSavingRules(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#57BF9C" />
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
      >
        <View className="mb-8">
          <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-4 ml-2">
            Pessoa
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {users.map((u) => (
              <TouchableOpacity
                key={u.id}
                onPress={() => handleSelectUser(u.id)}
                className={`px-6 py-3 rounded-full border-2 ${
                  selectedUserId === u.id
                    ? "border-accentGreen bg-accentGreen/20"
                    : "border-surfaceHighlight bg-surface"
                }`}
              >
                <Text
                  className={`font-sansBold ${selectedUserId === u.id ? "text-accentGreen" : "text-muted"}`}
                >
                  {u.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-surface rounded-[34px] p-6 mb-8 border border-surfaceHighlight">
          <Text className="text-xl font-sansBold text-white tracking-wide mb-6">
            SALÁRIO MENSAL
          </Text>

          <View className="mb-6">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
              Base de Projeção (R$)
            </Text>
            <TextInput
              className="border-2 border-surfaceHighlight rounded-[24px] p-4 bg-background text-white text-lg font-mono focus:border-accentGreen"
              keyboardType="numeric"
              placeholder="Ex: 3000.00"
              placeholderTextColor="#525252"
              value={salary}
              onChangeText={setSalary}
              selectionColor="#57BF9C"
            />
          </View>

          <Button
            onPress={handleSaveSalary}
            disabled={!selectedUserId || savingSalary}
            className="w-full rounded-[24px] py-4 bg-accentGreen"
          >
            {savingSalary ? (
              <ActivityIndicator color="#080808" />
            ) : (
              <View className="flex-row items-center">
                <Save size={20} color="#080808" className="mr-2" />
                <Text className="text-[#080808] font-sansBold text-lg">
                  Salvar Salário
                </Text>
              </View>
            )}
          </Button>
        </View>

        <View className="bg-surface rounded-[34px] p-6 mb-8 border border-surfaceHighlight">
          <Text className="text-xl font-sansBold text-white tracking-wide mb-2">
            FAIXAS DE ALOCAÇÃO
          </Text>
          <Text
            className={`text-sm font-mono mb-6 ${Math.abs(sumPercent - 100) <= 0.001 ? "text-gain" : "text-expense"}`}
          >
            Soma atual: {sumPercent.toFixed(2)}%
          </Text>

          {rules.map((rule, index) => (
            <View
              key={rule.key}
              className="mb-6 bg-background rounded-[24px] p-4 border border-surfaceHighlight"
            >
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-muted font-sansBold text-xs uppercase tracking-wider">
                  Regra #{index + 1}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setRules((prev) => prev.filter((r) => r.key !== rule.key))
                  }
                  className="bg-expense/10 p-2 rounded-full"
                >
                  <Trash2 size={18} color="#ff4d4d" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                  Categoria
                </Text>
                <TextInput
                  className="border-b-2 border-surfaceHighlight py-2 text-white text-lg font-mono focus:border-accentGreen"
                  value={rule.label}
                  onChangeText={(text) => {
                    setRules((prev) =>
                      prev.map((r) =>
                        r.key === rule.key ? { ...r, label: text } : r,
                      ),
                    );
                  }}
                  placeholder="Ex: Contas"
                  placeholderTextColor="#525252"
                  selectionColor="#57BF9C"
                />
              </View>

              <View className="mb-2">
                <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                  Percentual (%)
                </Text>
                <TextInput
                  className="border-b-2 border-surfaceHighlight py-2 text-white text-lg font-mono focus:border-accentGreen"
                  keyboardType="numeric"
                  value={rule.percent}
                  onChangeText={(text) => {
                    setRules((prev) =>
                      prev.map((r) =>
                        r.key === rule.key ? { ...r, percent: text } : r,
                      ),
                    );
                  }}
                  placeholder="Ex: 25"
                  placeholderTextColor="#525252"
                  selectionColor="#57BF9C"
                />
              </View>
            </View>
          ))}

          <TouchableOpacity
            className="flex-row items-center justify-center border-2 border-dashed border-surfaceHighlight rounded-[24px] p-4 mb-6"
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
            <PlusCircle size={20} color="#838383" className="mr-2" />
            <Text className="text-muted font-sansBold uppercase tracking-wider">
              Adicionar Faixa
            </Text>
          </TouchableOpacity>

          <Button
            onPress={handleSaveRules}
            disabled={!selectedUserId || savingRules}
            className="w-full rounded-[24px] py-4 bg-primary"
            style={{
              shadowColor: "#F9D16B",
              shadowOpacity: 0.3,
              shadowRadius: 15,
              shadowOffset: { width: 0, height: 4 },
            }}
          >
            {savingRules ? (
              <ActivityIndicator color="#080808" />
            ) : (
              <View className="flex-row items-center">
                <Save size={20} color="#080808" className="mr-2" />
                <Text className="text-[#080808] font-sansBold text-lg">
                  Salvar Faixas
                </Text>
              </View>
            )}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
