import { OAuthButton } from "@/components/oauth-button";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import * as React from "react";
import { StyleSheet, View } from "react-native";

export default function SignIn() {
	return (
		<ThemedView style={styles.container}>
			<OAuthButton
				provider="oauth_google"
				label="Continue with Google"
				icon="G"
				backgroundColor="#4285F4"
			/>

			{/* Divider */}
			<View style={styles.dividerContainer}>
				<View style={styles.divider} />
				<ThemedText style={styles.dividerText}>or</ThemedText>
				<View style={styles.divider} />
			</View>

			<OAuthButton
				provider="oauth_facebook"
				label="Continue with Facebook"
				icon="f"
				backgroundColor="#182732"
			/>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 12,
	},
	title: {
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		marginBottom: 16,
		opacity: 0.8,
	},
	label: {
		fontWeight: "600",
		fontSize: 14,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
		backgroundColor: "#fff",
	},
	button: {
		backgroundColor: "#0a7ea4",
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
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
	linkContainer: {
		flexDirection: "row",
		gap: 4,
		marginTop: 12,
		alignItems: "center",
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#ccc",
	},
	dividerText: {
		marginHorizontal: 10,
		opacity: 0.6,
		fontSize: 14,
	},
});
