import SignIn from "@/components/sign-in";
import { SignedOut, useAuth } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect } from "expo-router";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function Index() {
	const { isSignedIn, isLoaded } = useAuth();

	// Wait for auth to load
	if (!isLoaded) {
		return null;
	}

	// Redirect to tabs if signed in
	if (isSignedIn) {
		return <Redirect href="/(tabs)" />;
	}

	return (
		<LinearGradient
			colors={["#667eea", "#764ba2", "#f093fb"]}
			style={styles.gradient}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
		>
			<SafeAreaView style={styles.safeArea}>
				{/* Decorative circles */}
				<View style={styles.decorativeCircle1} />
				<View style={styles.decorativeCircle2} />
				<View style={styles.decorativeCircle3} />

				<View style={styles.container}>
					{/* Logo/Title Section */}
					<View style={styles.titleSection}>
						<View style={styles.logoContainer}>
							<Text style={styles.logoEmoji}>🌿</Text>
						</View>
						<Text style={styles.title}>FLORADEX</Text>
						<Text style={styles.subtitle}>Discover & Identify Plants</Text>
					</View>

					{/* Card Container for Sign In */}
					<View style={styles.card}>
						<Text style={styles.cardTitle}>Welcome Back!</Text>
						<Text style={styles.cardSubtitle}>
							Sign in to explore the world of plants
						</Text>

						<SignedOut>
							<SignIn />
						</SignedOut>
					</View>

					{/* Footer */}
					<Text style={styles.footer}>
						Your pocket guide to plant identification
					</Text>
				</View>
			</SafeAreaView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	gradient: {
		flex: 1,
	},
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 20,
	},
	decorativeCircle1: {
		position: "absolute",
		width: 200,
		height: 200,
		borderRadius: 100,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		top: -50,
		left: -50,
	},
	decorativeCircle2: {
		position: "absolute",
		width: 160,
		height: 160,
		borderRadius: 80,
		backgroundColor: "rgba(255, 255, 255, 0.05)",
		bottom: 100,
		right: -30,
	},
	decorativeCircle3: {
		position: "absolute",
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "rgba(255, 255, 255, 0.05)",
		top: "30%",
		right: 20,
	},
	titleSection: {
		alignItems: "center",
		marginBottom: 30,
	},
	logoContainer: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "#ffffff",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 8,
	},
	logoEmoji: {
		fontSize: 50,
	},
	title: {
		fontSize: 40,
		fontWeight: "bold",
		color: "#ffffff",
		letterSpacing: 3,
		textShadowColor: "rgba(0, 0, 0, 0.3)",
		textShadowOffset: { width: 0, height: 2 },
		textShadowRadius: 4,
		marginBottom: 8,
		textAlign: "center",
	},
	subtitle: {
		fontSize: 16,
		color: "rgba(255, 255, 255, 0.9)",
		fontWeight: "500",
		textAlign: "center",
	},
	card: {
		width: "100%",
		maxWidth: 400,
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 28,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 15,
	},
	cardTitle: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#1f2937",
		textAlign: "center",
		marginBottom: 8,
	},
	cardSubtitle: {
		fontSize: 14,
		color: "#6b7280",
		textAlign: "center",
		marginBottom: 24,
		lineHeight: 20,
	},
	footer: {
		marginTop: 24,
		fontSize: 13,
		color: "rgba(255, 255, 255, 0.8)",
		textAlign: "center",
	},
});
