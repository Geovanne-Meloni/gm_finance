import { Drawer } from "expo-router/drawer";
import {
  Home,
  Target,
  ListPlus,
  Settings,
  Menu,
  LogOut,
} from "lucide-react-native";
import React from "react";
import { Text } from "@/components/ui/Text";
import { TouchableOpacity } from "react-native";
import { useAuth } from "@/src/context/AuthContext";

export default function DrawerLayout() {
  const { logout } = useAuth();

  return (
    <Drawer
      screenOptions={({ navigation }: any) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: "#080808",
          shadowColor: "transparent",
          elevation: 0,
        },
        headerTitleAlign: "center",
        headerTitle: ({ children }) => (
          <Text className="text-xl font-sansBold text-white tracking-widest uppercase">
            {children}
          </Text>
        ),
        headerLeft: () => (
          <TouchableOpacity
            className="pl-6"
            onPress={() => navigation.toggleDrawer()}
          >
            <Menu size={28} color="#F9D16B" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity className="pr-6" onPress={logout}>
            <LogOut size={24} color="#838383" />
          </TouchableOpacity>
        ),
        drawerStyle: {
          backgroundColor: "#1A1A1A",
          width: 280,
        },
        drawerActiveBackgroundColor: "#262626",
        drawerActiveTintColor: "#F9D16B",
        drawerInactiveTintColor: "#838383",
        drawerLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: 16,
        },
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: "Início",
          title: "DASHBOARD",
          drawerIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="transactions"
        options={{
          drawerLabel: "Lançamentos",
          title: "TRANSAÇÕES",
          drawerIcon: ({ color, size }) => (
            <ListPlus size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="goals"
        options={{
          drawerLabel: "Metas",
          title: "METAS",
          drawerIcon: ({ color, size }) => <Target size={size} color={color} />,
        }}
      />
      <Drawer.Screen
        name="settings"
        options={{
          drawerLabel: "Configurações",
          title: "AJUSTES",
          drawerIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
