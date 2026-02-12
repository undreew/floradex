import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function OAuthNativeCallback() {
	useEffect(() => {
		// WebBrowser.maybeCompleteAuthSession in oauth-button.tsx handles the callback
		// This component just needs to exist to prevent the "Unmatched Route" error
	}, []);

	return (
		<View style={styles.container}>
			<ActivityIndicator size="large" color="#0a7ea4" />
			<Text style={styles.text}>Completing sign in...</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	text: {
		marginTop: 16,
		fontSize: 16,
		color: "#333",
	},
});
