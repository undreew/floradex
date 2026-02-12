import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function TabLayout() {
	const colorScheme = useColorScheme();
	const { isSignedIn, isLoaded } = useAuth();

	// Wait for auth to load
	if (!isLoaded) {
		return null;
	}

	// Redirect to login if not signed in
	if (!isSignedIn) {
		return <Redirect href="/" />;
	}

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				headerShown: false,
				tabBarButton: HapticTab,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="house.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="scan"
				options={{
					title: "Scan Plants",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="paperplane.fill" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="quiz"
				options={{
					title: "Plant Quiz",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="chevron.right" color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="upload"
				options={{
					title: "Upload Plant",
					tabBarIcon: ({ color }) => (
						<IconSymbol size={28} name="chevron.left" color={color} />
					),
				}}
			/>
		</Tabs>
	);
}
