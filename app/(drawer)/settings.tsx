import { useFocusEffect } from "@react-navigation/native";
import { PlusCircle, Save, Trash2 } from "lucide-react-native";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { KeyboardScrollView } from "@/components/ui/KeyboardScrollView";
import { Text } from "@/components/ui/Text";
import {
  cancelRecurringIncome,
  getRecurringIncomes,
} from "@/src/api/transactions";
import {
  getUserAllocationRules,
  getUsers,
  updateUserAllocationRules,
  updateUserMonthlySalary,
} from "@/src/api/users";
import { AllocationRule, RecurringIncome, User } from "@/src/api/types";
import { useAuth } from "@/src/context/AuthContext";
import { useCustomAlert } from "@/src/context/CustomAlertContext";
import { formatCurrency } from "@/src/utils/format";

type EditableRule = {
  key: string;
  label: string;
  kind: "EXPENSE" | "SAVINGS";
  fixedAmount: string;
  percent: string;
};

function parseRulesToEditable(rules: AllocationRule[]): EditableRule[] {
  return rules.map((rule) => ({
    key: rule.id,
    label: rule.label,
    kind: rule.kind,
    fixedAmount: rule.fixedAmount,
    percent: String(rule.percent),
  }));
}

function derivePercent(fixedAmount: string, salary: string): string {
  const amountValue = Number(fixedAmount);
  const salaryValue = Number(salary);
  if (
    Number.isNaN(amountValue) ||
    Number.isNaN(salaryValue) ||
    salaryValue <= 0
  ) {
    return "0.00";
  }
  return ((amountValue / salaryValue) * 100).toFixed(2);
}

export default function SettingsScreen() {
  const {
    userId,
    isBiometricAvailable,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
  } = useAuth();
  const { showAlert } = useCustomAlert();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [salary, setSalary] = useState("");
  const [rules, setRules] = useState<EditableRule[]>([]);
  const [recurringIncomes, setRecurringIncomes] = useState<RecurringIncome[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [savingSalary, setSavingSalary] = useState(false);
  const [savingRules, setSavingRules] = useState(false);
  const [savingBiometric, setSavingBiometric] = useState(false);
  const [cancelingIncomeId, setCancelingIncomeId] = useState<string | null>(
    null,
  );

  const loadContext = useCallback(
    async (forcedUserId?: string | null) => {
      setLoading(true);
      try {
        const rows = await getUsers();
        setUsers(rows);
        const effectiveUserId =
          forcedUserId ?? selectedUserId ?? userId ?? rows[0]?.id ?? null;
        setSelectedUserId(effectiveUserId);

        if (!effectiveUserId) {
          setRules([]);
          setSalary("");
          setRecurringIncomes([]);
          return;
        }

        const selectedUser =
          rows.find((entry) => entry.id === effectiveUserId) ?? null;
        setSalary(selectedUser?.monthlySalary ?? "");

        const [loadedRules, loadedRecurringIncomes] = await Promise.all([
          getUserAllocationRules(effectiveUserId),
          getRecurringIncomes(effectiveUserId),
        ]);

        setRules(parseRulesToEditable(loadedRules));
        setRecurringIncomes(loadedRecurringIncomes);
      } catch (err: any) {
        showAlert({
          title: "Erro",
          message: err.message || "Falha ao carregar configurações",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedUserId, showAlert, userId],
  );

  useFocusEffect(
    useCallback(() => {
      loadContext();
    }, [loadContext]),
  );

  const sumPercent = useMemo(
    () =>
      rules.reduce((sum, rule) => {
        const percent = Number(derivePercent(rule.fixedAmount, salary));
        return Number.isNaN(percent) ? sum : sum + percent;
      }, 0),
    [rules, salary],
  );

  const sumFixedAmount = useMemo(
    () =>
      rules.reduce((sum, rule) => {
        const fixedAmount = Number(rule.fixedAmount);
        return Number.isNaN(fixedAmount) ? sum : sum + fixedAmount;
      }, 0),
    [rules],
  );

  const projectedFreeBalance = useMemo(() => {
    const salaryAmount = Number(salary);
    if (Number.isNaN(salaryAmount)) {
      return null;
    }
    return salaryAmount - sumFixedAmount;
  }, [salary, sumFixedAmount]);

  const handleSelectUser = async (nextUserId: string) => {
    await loadContext(nextUserId);
  };

  const handleSaveSalary = async () => {
    if (!selectedUserId) return;
    const parsed = salary.trim() === "" ? null : Number(salary.trim());
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
      await loadContext(selectedUserId);
      showAlert({
        title: "Sucesso",
        message: "Salário mensal atualizado.",
        type: "success",
      });
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

    const normalized = rules.map((rule) => ({
      label: rule.label.trim(),
      kind: rule.kind,
      fixedAmount: Number(rule.fixedAmount),
    }));

    if (
      normalized.some(
        (rule) =>
          !rule.label || Number.isNaN(rule.fixedAmount) || rule.fixedAmount < 0,
      )
    ) {
      showAlert({
        title: "Aviso",
        message: "Preencha todas as faixas com nome e valor fixo válidos.",
        type: "info",
      });
      return;
    }

    if (normalized.filter((rule) => rule.kind === "SAVINGS").length > 1) {
      showAlert({
        title: "Aviso",
        message: "Mantenha apenas uma faixa do tipo Guardado.",
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
        message: "Recorrentes fixos e guardado salvos.",
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

  const handleEnableBiometric = async () => {
    setSavingBiometric(true);
    try {
      await enableBiometric();
      showAlert({
        title: "Sucesso",
        message: "Biometria habilitada neste dispositivo.",
        type: "success",
      });
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao habilitar biometria",
        type: "error",
      });
    } finally {
      setSavingBiometric(false);
    }
  };

  const handleDisableBiometric = async () => {
    setSavingBiometric(true);
    try {
      await disableBiometric();
      showAlert({
        title: "Sucesso",
        message: "Biometria desabilitada neste dispositivo.",
        type: "success",
      });
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao desabilitar biometria",
        type: "error",
      });
    } finally {
      setSavingBiometric(false);
    }
  };

  const handleCancelRecurringIncome = async (incomeId: string) => {
    setCancelingIncomeId(incomeId);
    try {
      await cancelRecurringIncome(incomeId);
      if (selectedUserId) {
        setRecurringIncomes(await getRecurringIncomes(selectedUserId));
      }
      showAlert({
        title: "Sucesso",
        message: "Renda passiva recorrente cancelada.",
        type: "success",
      });
    } catch (err: any) {
      showAlert({
        title: "Erro",
        message: err.message || "Falha ao cancelar renda recorrente",
        type: "error",
      });
    } finally {
      setCancelingIncomeId(null);
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
      <KeyboardScrollView
        className="flex-1 px-6 pt-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="bg-surface rounded-[34px] p-6 mb-8 border border-surfaceHighlight">
            <Text className="text-xl font-sansBold text-white tracking-wide mb-4">
              BIOMETRIA
            </Text>
            <Text className="text-muted font-sans mb-6">
              {isBiometricAvailable
                ? isBiometricEnabled
                  ? "Sua sessão pode ser renovada com digital ou reconhecimento facial."
                  : "Habilite biometria para renovar a sessão sem redigitar a senha."
                : "Este dispositivo não oferece biometria disponível para o app."}
            </Text>

            {isBiometricEnabled ? (
              <Button
                onPress={handleDisableBiometric}
                disabled={savingBiometric}
                className="w-full rounded-[24px] py-4 bg-red-500"
              >
                <Text className="text-white font-sansBold text-center">
                  {savingBiometric ? "Salvando..." : "Desabilitar biometria"}
                </Text>
              </Button>
            ) : (
              <Button
                onPress={handleEnableBiometric}
                disabled={savingBiometric || !isBiometricAvailable}
                className="w-full rounded-[24px] py-4 bg-accentGreen"
              >
                <Text className="text-[#080808] font-sansBold text-center">
                  {savingBiometric ? "Salvando..." : "Habilitar biometria"}
                </Text>
              </Button>
            )}
        </View>

        <View className="mb-8">
            <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-4 ml-2">
              Pessoa
            </Text>
            <View className="flex-row flex-wrap gap-3">
              {users.map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  onPress={() => handleSelectUser(entry.id)}
                  className={`px-6 py-3 rounded-full border-2 ${
                    selectedUserId === entry.id
                      ? "border-accentGreen bg-accentGreen/20"
                      : "border-surfaceHighlight bg-surface"
                  }`}
                >
                  <Text
                    className={`font-sansBold ${selectedUserId === entry.id ? "text-accentGreen" : "text-muted"}`}
                  >
                    {entry.name}
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
              GASTOS RECORRENTES E GUARDADO
            </Text>
            <Text className="text-muted font-sans mb-3">
              Configure valores fixos mensais. O percentual é derivado do
              salário configurado e o saldo livre é calculado automaticamente.
            </Text>
            <Text className="text-sm font-mono text-primary mb-2">
              Percentual derivado atual: {sumPercent.toFixed(2)}%
            </Text>
            <Text className="text-sm font-mono text-white/80 mb-6">
              Total fixo do mês: {formatCurrency(sumFixedAmount)}
            </Text>

            {projectedFreeBalance !== null && (
              <View className="mb-6 rounded-[24px] border border-surfaceHighlight bg-background p-4">
                <Text className="text-muted font-sans text-xs uppercase tracking-wider mb-1">
                  Saldo livre estimado
                </Text>
                <Text
                  className={`font-sansBold text-xl ${projectedFreeBalance >= 0 ? "text-accentGreen" : "text-expense"}`}
                >
                  {formatCurrency(projectedFreeBalance)}
                </Text>
              </View>
            )}

            {rules.map((rule, index) => (
              <View
                key={rule.key}
                className="mb-6 rounded-[24px] border border-surfaceHighlight bg-background p-4"
              >
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className="text-muted font-sansBold text-xs uppercase tracking-wider">
                    Faixa #{index + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      setRules((prev) =>
                        prev.filter((entry) => entry.key !== rule.key),
                      )
                    }
                    className="rounded-full bg-expense/10 p-2"
                  >
                    <Trash2 size={18} color="#ff4d4d" />
                  </TouchableOpacity>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                    Nome
                  </Text>
                  <TextInput
                    className="border-b-2 border-surfaceHighlight py-2 text-white text-lg font-mono focus:border-accentGreen"
                    value={rule.label}
                    onChangeText={(text) =>
                      setRules((prev) =>
                        prev.map((entry) =>
                          entry.key === rule.key
                            ? { ...entry, label: text }
                            : entry,
                        ),
                      )
                    }
                    placeholder={
                      rule.kind === "SAVINGS" ? "Ex: Guardado" : "Ex: Contas"
                    }
                    placeholderTextColor="#525252"
                    selectionColor="#57BF9C"
                  />
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                    Tipo
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() =>
                        setRules((prev) =>
                          prev.map((entry) =>
                            entry.key === rule.key
                              ? { ...entry, kind: "EXPENSE" }
                              : entry,
                          ),
                        )
                      }
                      className={`flex-1 rounded-full border-2 px-4 py-3 ${
                        rule.kind === "EXPENSE"
                          ? "border-primary bg-primary/15"
                          : "border-surfaceHighlight bg-surface"
                      }`}
                    >
                      <Text
                        className={`text-center font-sansBold ${rule.kind === "EXPENSE" ? "text-primary" : "text-muted"}`}
                      >
                        Recorrente
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        setRules((prev) =>
                          prev.map((entry) =>
                            entry.key === rule.key
                              ? {
                                  ...entry,
                                  kind: "SAVINGS",
                                  label: entry.label || "guardado",
                                }
                              : entry,
                          ),
                        )
                      }
                      className={`flex-1 rounded-full border-2 px-4 py-3 ${
                        rule.kind === "SAVINGS"
                          ? "border-accentPurple bg-accentPurple/15"
                          : "border-surfaceHighlight bg-surface"
                      }`}
                    >
                      <Text
                        className={`text-center font-sansBold ${rule.kind === "SAVINGS" ? "text-accentPurple" : "text-muted"}`}
                      >
                        Guardado
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="mb-4">
                  <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                    Valor fixo (R$)
                  </Text>
                  <TextInput
                    className="border-b-2 border-surfaceHighlight py-2 text-white text-lg font-mono focus:border-accentGreen"
                    keyboardType="numeric"
                    value={rule.fixedAmount}
                    onChangeText={(text) =>
                      setRules((prev) =>
                        prev.map((entry) =>
                          entry.key === rule.key
                            ? { ...entry, fixedAmount: text }
                            : entry,
                        ),
                      )
                    }
                    placeholder="Ex: 300"
                    placeholderTextColor="#525252"
                    selectionColor="#57BF9C"
                  />
                </View>

                <View>
                  <Text className="text-sm font-sansBold text-muted uppercase tracking-wider mb-2 ml-2">
                    Percentual derivado
                  </Text>
                  <Text className="py-2 text-white text-lg font-mono">
                    {derivePercent(rule.fixedAmount, salary)}%
                  </Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              className="mb-6 flex-row items-center justify-center rounded-[24px] border-2 border-dashed border-surfaceHighlight p-4"
              onPress={() =>
                setRules((prev) => [
                  ...prev,
                  {
                    key: `new-${Date.now()}-${prev.length}`,
                    label: "",
                    kind: "EXPENSE",
                    fixedAmount: "0",
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

        <View className="bg-surface rounded-[34px] p-6 mb-8 border border-surfaceHighlight">
            <Text className="text-xl font-sansBold text-white tracking-wide mb-2">
              RENDAS PASSIVAS RECORRENTES
            </Text>
            <Text className="text-muted font-sans mb-6">
              Estas rendas entram todos os meses até você cancelar.
            </Text>

            {recurringIncomes.length === 0 ? (
              <Text className="text-muted font-sans">
                Nenhuma renda passiva recorrente cadastrada.
              </Text>
            ) : (
              recurringIncomes.map((income) => (
                <View
                  key={income.id}
                  className="mb-4 rounded-[24px] border border-surfaceHighlight bg-background p-4"
                >
                  <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white font-sansBold text-lg">
                      {income.title}
                    </Text>
                    <Text
                      className={`font-sansBold ${income.isActive ? "text-accentGreen" : "text-expense"}`}
                    >
                      {income.isActive ? "Ativa" : "Cancelada"}
                    </Text>
                  </View>

                  <Text className="text-muted font-mono mb-1">
                    {formatCurrency(income.amount)} / mês
                  </Text>
                  <Text className="text-muted font-sans text-sm mb-4">
                    Início em {income.yearMonth}
                  </Text>

                  <Button
                    onPress={() => handleCancelRecurringIncome(income.id)}
                    disabled={
                      !income.isActive || cancelingIncomeId === income.id
                    }
                    className="w-full rounded-[24px] py-4 bg-expense"
                  >
                    <Text className="text-white font-sansBold text-center">
                      {cancelingIncomeId === income.id
                        ? "Cancelando..."
                        : income.isActive
                          ? "Cancelar recorrência"
                          : "Recorrência encerrada"}
                    </Text>
                  </Button>
                </View>
              ))
            )}
        </View>
      </KeyboardScrollView>
    </SafeAreaView>
  );
}
