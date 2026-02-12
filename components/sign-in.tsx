import { OAuthButton } from "@/components/oauth-button";
import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function SignIn() {
	return (
		<View style={styles.container}>
			<OAuthButton
				provider="oauth_google"
				label="Continue with Google"
				icon="G"
				backgroundColor="#DB4437"
				textColor="#ffffff"
			/>

			{/* Divider */}
			<View style={styles.dividerContainer}>
				<View style={styles.divider} />
				<Text style={styles.dividerText}>or</Text>
				<View style={styles.divider} />
			</View>

			<OAuthButton
				provider="oauth_facebook"
				label="Continue with Facebook"
				icon="f"
				backgroundColor="#1877F2"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 12,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 8,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#e5e7eb",
	},
	dividerText: {
		marginHorizontal: 12,
		opacity: 0.5,
		fontSize: 13,
		color: "#9ca3af",
	},
});
