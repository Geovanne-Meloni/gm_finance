import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/src/context/AuthContext";
import { Text } from "@/components/ui/Text";

export default function WelcomeScreen() {
  const { userId, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (userId) {
        router.replace("/(drawer)");
      } else {
        router.replace("/login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [isLoading, userId, router]);

  return (
    <SafeAreaView className="flex-1 bg-background justify-center items-center">
      <Animated.View
        entering={FadeInDown.duration(1000).springify()}
        exiting={FadeOutUp.duration(500)}
        className="items-center"
      >
        <Text className="text-primary font-bold text-5xl tracking-widest uppercase mb-4 text-center">
          GM
        </Text>
        <Text className="text-white font-medium text-2xl tracking-[4px] text-center uppercase">
          Finance
        </Text>
        <View className="w-24 h-1 bg-accentGreen rounded-full mt-8" />
      </Animated.View>
    </SafeAreaView>
  );
}
