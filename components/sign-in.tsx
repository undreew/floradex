import { OAuthButton } from "@/components/oauth-button";
import * as React from "react";
import { StyleSheet, View } from "react-native";

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
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 12,
	},
});
