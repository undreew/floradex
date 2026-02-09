import { useOAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

type OAuthProvider = "oauth_google" | "oauth_facebook";

interface OAuthButtonProps {
	provider: OAuthProvider;
	label: string;
	icon?: string;
	backgroundColor?: string;
}

export function OAuthButton({
	provider,
	label,
	icon,
	backgroundColor = "#0a7ea4",
}: OAuthButtonProps) {
	const router = useRouter();
	const { startOAuthFlow } = useOAuth({ strategy: provider });

	const onPress = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive } = await startOAuthFlow();

			if (createdSessionId) {
				await setActive!({ session: createdSessionId });
				router.replace("/(tabs)");
			}
		} catch (err: any) {
			console.error("OAuth error", err);
			// Handle errors - you might want to show a toast/alert here
		}
	}, [startOAuthFlow, router]);

	return (
		<Pressable
			style={({ pressed }) => [
				styles.button,
				{ backgroundColor },
				pressed && styles.buttonPressed,
			]}
			onPress={onPress}
		>
			<View style={styles.buttonContent}>
				{icon && <Text style={styles.icon}>{icon}</Text>}
				<Text style={styles.buttonText}>{label}</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	icon: {
		fontSize: 20,
		color: "#fff",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
});
