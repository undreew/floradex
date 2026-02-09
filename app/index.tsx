import SignIn from "@/components/sign-in";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SignedOut, useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { StyleSheet } from "react-native";

export default function Index() {
	const { isSignedIn } = useAuth();

	// Redirect to tabs if user is already signed in
	if (isSignedIn) {
		return <Redirect href="/(tabs)" />;
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Welcome to Floradex!</ThemedText>
			{/* Show the sign-in and sign-up buttons when the user is signed out */}
			<SignedOut>
				<SignIn />
			</SignedOut>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		gap: 16,
	},
});
