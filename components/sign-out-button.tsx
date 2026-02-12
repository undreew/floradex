import { ThemedText } from "@/components/themed-text";
import { useClerk } from "@clerk/clerk-expo";
import { useState } from "react";
import { Pressable, StyleSheet } from "react-native";

export const SignOutButton = () => {
	const { signOut } = useClerk();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		if (isSigningOut) return;

		try {
			setIsSigningOut(true);
			// Just call signOut - the auth state change will trigger the redirect in TabLayout
			await signOut();
		} catch (err) {
			console.error("Sign out error:", err);
			setIsSigningOut(false);
		}
	};

	return (
		<Pressable
			style={({ pressed }) => [
				styles.button,
				pressed && styles.buttonPressed,
				isSigningOut && styles.buttonDisabled,
			]}
			onPress={handleSignOut}
			disabled={isSigningOut}
		>
			<ThemedText style={styles.buttonText}>
				{isSigningOut ? "Signing out..." : "Sign out"}
			</ThemedText>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#0a7ea4",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
	},
});
