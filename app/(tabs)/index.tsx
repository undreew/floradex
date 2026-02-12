import { SignOutButton } from "@/components/sign-out-button";
import { userProfileService } from "@/services/userProfile";
import { useAuth } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
	const { isLoaded, userId } = useAuth();
	const [username, setUsername] = useState<string | null>(null);

	// Load username when component mounts or comes back into focus
	useFocusEffect(
		useCallback(() => {
			loadUsername();
		}, [])
	);

	const loadUsername = async () => {
		const saved = await userProfileService.getUsername();
		setUsername(saved);
	};

	if (!isLoaded) {
		return null;
	}

	return (
		<View style={styles.container}>
			{/* Header with Gradient */}
			<LinearGradient
				colors={["#667eea", "#764ba2"]}
				style={styles.header}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<View style={styles.headerContent}>
					<View>
						<Text style={styles.greeting}>
							Welcome Back{username ? `, ${username}` : ""}! 👋
						</Text>
						<Text style={styles.subtitle}>Your Plant Collection</Text>
					</View>
					<View style={styles.logoCircle}>
						<Text style={styles.logoEmoji}>🌿</Text>
					</View>
				</View>
			</LinearGradient>

			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				{/* Quick Actions */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Quick Actions</Text>
					<View style={styles.actionsGrid}>
						<Pressable
							style={({ pressed }) => [
								styles.actionCard,
								styles.scanCard,
								pressed && styles.actionCardPressed,
							]}
							onPress={() => router.push("/(tabs)/scan")}
						>
							<View style={styles.actionIconContainer}>
								<Text style={styles.actionIcon}>📷</Text>
							</View>
							<Text style={styles.actionTitle}>Scan Plant</Text>
							<Text style={styles.actionDescription}>
								Take a photo to identify
							</Text>
						</Pressable>

						<Pressable
							style={({ pressed }) => [
								styles.actionCard,
								styles.uploadCard,
								pressed && styles.actionCardPressed,
							]}
							onPress={() => router.push("/(tabs)/upload")}
						>
							<View style={styles.actionIconContainer}>
								<Text style={styles.actionIcon}>🖼️</Text>
							</View>
							<Text style={styles.actionTitle}>Upload Photo</Text>
							<Text style={styles.actionDescription}>From your gallery</Text>
						</Pressable>

						<Pressable
							style={({ pressed }) => [
								styles.actionCard,
								styles.quizCard,
								pressed && styles.actionCardPressed,
							]}
							onPress={() => router.push("/(tabs)/quiz")}
						>
							<View style={styles.actionIconContainer}>
								<Text style={styles.actionIcon}>🎯</Text>
							</View>
							<Text style={styles.actionTitle}>Take Quiz</Text>
							<Text style={styles.actionDescription}>Test your knowledge</Text>
						</Pressable>
					</View>
				</View>

				{/* Sign Out Button */}
				<View style={styles.section}>
					<SignOutButton />
				</View>

				<View style={{ height: 40 }} />
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f5f5",
	},
	header: {
		paddingTop: 60,
		paddingBottom: 30,
		paddingHorizontal: 20,
	},
	headerContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	greeting: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#ffffff",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 16,
		color: "rgba(255, 255, 255, 0.9)",
	},
	logoCircle: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "rgba(255, 255, 255, 0.95)",
		justifyContent: "center",
		alignItems: "center",
	},
	logoEmoji: {
		fontSize: 30,
	},
	scrollView: {
		flex: 1,
	},
	section: {
		paddingHorizontal: 20,
		marginTop: 24,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 16,
	},
	actionsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
	},
	actionCard: {
		flex: 1,
		minWidth: "30%",
		backgroundColor: "#ffffff",
		borderRadius: 16,
		padding: 16,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	actionCardPressed: {
		opacity: 0.8,
		transform: [{ scale: 0.98 }],
	},
	scanCard: {
		borderLeftWidth: 3,
		borderLeftColor: "#10b981",
	},
	uploadCard: {
		borderLeftWidth: 3,
		borderLeftColor: "#3b82f6",
	},
	quizCard: {
		borderLeftWidth: 3,
		borderLeftColor: "#f59e0b",
	},
	actionIconContainer: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "#f3f4f6",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 12,
	},
	actionIcon: {
		fontSize: 24,
	},
	actionTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 4,
		textAlign: "center",
	},
	actionDescription: {
		fontSize: 11,
		color: "#6b7280",
		textAlign: "center",
	},
});
