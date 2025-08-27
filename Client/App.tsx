// App.tsx
import React from "react";
import { StatusBar } from "react-native";
import { registerRootComponent } from "expo";
import { Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import CartScreen from "./screens/CartScreen";
import InfoScreen from "./screens/InfoScreen";
import MenuScreen from "./screens/MenuScreen";
import ProductDetailsScreen from "./screens/ProductDetailsScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import OrdersScreen from "./screens/OrderScreen";
import OtpVerifyScreen from "./screens/OtpVerifyScreen";

import { ThemeProvider, useAppTheme } from "./theme/ThemeProvider";

export type RootStackParamList = {
  Register: undefined;
  Login: undefined;
  MainTabs: undefined;
  Cart: undefined;
  ProductDetails: undefined;
  OtpVerify: { mode: "register" | "login"; phone: string; username?: string; password?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { colors } = useAppTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Info"
        component={InfoScreen}
        options={{
          title: "Info",
          tabBarIcon: ({ color, size }) => <Ionicons name="information-circle" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigation() {
  const { navTheme, isDark, colors } = useAppTheme();
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={colors.background} />
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: "Verify phone" }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Cart" component={CartScreen} options={{ title: "Cart" }} />
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: "Product Details" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigation />
    </ThemeProvider>
  );
}

registerRootComponent(App);
