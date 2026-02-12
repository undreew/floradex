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
	textColor?: string;
}

export function OAuthButton({
	provider,
	label,
	icon,
	backgroundColor = "#0a7ea4",
	textColor = "#fff",
}: OAuthButtonProps) {
	const router = useRouter();
	const { startOAuthFlow } = useOAuth({ strategy: provider });

	const onPress = React.useCallback(async () => {
		try {
			const { createdSessionId, setActive } = await startOAuthFlow({
				redirectUrl: "floradex://oauth-native-callback",
			});

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
				{icon && (
					<Text style={[styles.icon, { color: textColor }]}>{icon}</Text>
				)}
				<Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	button: {
		paddingVertical: 15,
		paddingHorizontal: 24,
		borderRadius: 12,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 4,
		elevation: 3,
	},
	buttonPressed: {
		opacity: 0.85,
		transform: [{ scale: 0.98 }],
	},
	buttonContent: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	icon: {
		fontSize: 18,
		color: "#fff",
		fontWeight: "bold",
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 15,
	},
});
