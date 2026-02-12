import { userProfileService } from "@/services/userProfile";
import { useClerk } from "@clerk/clerk-expo";
import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export const SignOutButton = () => {
	const { signOut } = useClerk();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		if (isSigningOut) return;

		try {
			setIsSigningOut(true);
			// Clear user profile data
			await userProfileService.clearProfile();
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
			<Text style={styles.buttonText}>
				{isSigningOut ? "Signing out..." : "Sign Out"}
			</Text>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	button: {
		backgroundColor: "#ef4444",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 12,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	buttonPressed: {
		opacity: 0.85,
		transform: [{ scale: 0.98 }],
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 15,
	},
});
