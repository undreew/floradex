import { RankDisplay } from "@/components/rank-display";
import { SignOutButton } from "@/components/sign-out-button";
import { type UserRank, userProfileService } from "@/services/userProfile";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from "react-native";

export default function ProfileScreen() {
	const { user } = useUser();
	const { userId } = useAuth();
	const [username, setUsername] = useState("");
	const [savedUsername, setSavedUsername] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [rank, setRank] = useState<UserRank>("novice");
	const [quizzesPassed, setQuizzesPassed] = useState(0);

	// Load saved username and rank data on mount
	useEffect(() => {
		loadUsername();
		loadRankData();
	}, []);

	// Initialize profile and sync with Clerk on mount
	useEffect(() => {
		if (user) {
			initializeProfile();
		}
	}, [user]);

	// Reload rank data when screen is focused (to reflect quiz completions)
	useEffect(() => {
		const interval = setInterval(() => {
			loadRankData();
		}, 2000); // Poll every 2 seconds for updates

		return () => clearInterval(interval);
	}, []);

	const initializeProfile = async () => {
		try {
			// Ensure profile exists
			await userProfileService.ensureProfileExists(userId || undefined);
			// Sync with Clerk to get latest data
			await userProfileService.syncFromClerk(user);
			// Reload data
			await loadRankData();
		} catch (error) {
			console.error("Error initializing profile:", error);
		}
	};

	const loadUsername = async () => {
		const saved = await userProfileService.getUsername();
		setSavedUsername(saved);
		if (saved) {
			setUsername(saved);
		}
	};

	const loadRankData = async () => {
		try {
			const userRank = await userProfileService.getRank();
			const quizzes = await userProfileService.getQuizzesPassed();
			setRank(userRank);
			setQuizzesPassed(quizzes);
		} catch (error) {
			console.error("Error loading rank data:", error);
		}
	};

	const handleSaveUsername = async () => {
		if (!username.trim()) {
			Alert.alert("Error", "Please enter a username");
			return;
		}

		if (username.trim().length < 3) {
			Alert.alert("Error", "Username must be at least 3 characters");
			return;
		}

		setIsSaving(true);
		try {
			await userProfileService.saveProfile(username);
			setSavedUsername(username);
			setIsEditing(false);
			Alert.alert("Success", "Username saved successfully!");
		} catch (error) {
			Alert.alert("Error", "Failed to save username. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleCancel = () => {
		setUsername(savedUsername || "");
		setIsEditing(false);
	};

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
					<View style={styles.avatarCircle}>
						<Ionicons name="person" size={48} color="#fff" />
					</View>
					<Text style={styles.headerTitle}>My Profile</Text>
					{savedUsername && (
						<Text style={styles.headerSubtitle}>@{savedUsername}</Text>
					)}
				</View>
			</LinearGradient>

			<ScrollView
				style={styles.scrollView}
				showsVerticalScrollIndicator={false}
			>
				{/* Rank Display Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Ranking System</Text>
					<RankDisplay rank={rank} quizzesPassed={quizzesPassed} />
				</View>

				{/* Username Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Username</Text>
					<View style={styles.card}>
						<View style={styles.inputContainer}>
							<Ionicons
								name="at"
								size={20}
								color="#667eea"
								style={styles.inputIcon}
							/>
							<TextInput
								style={[styles.input, !isEditing && styles.inputDisabled]}
								value={username}
								onChangeText={setUsername}
								placeholder="Enter your username"
								placeholderTextColor="#999"
								editable={isEditing}
								autoCapitalize="none"
								autoCorrect={false}
							/>
						</View>

						{isEditing ? (
							<View style={styles.buttonRow}>
								<Pressable
									style={({ pressed }) => [
										styles.button,
										styles.cancelButton,
										pressed && styles.buttonPressed,
									]}
									onPress={handleCancel}
								>
									<Text style={styles.cancelButtonText}>Cancel</Text>
								</Pressable>
								<Pressable
									style={({ pressed }) => [
										styles.button,
										styles.saveButton,
										pressed && styles.buttonPressed,
										isSaving && styles.buttonDisabled,
									]}
									onPress={handleSaveUsername}
									disabled={isSaving}
								>
									<Text style={styles.saveButtonText}>
										{isSaving ? "Saving..." : "Save"}
									</Text>
								</Pressable>
							</View>
						) : (
							<Pressable
								style={({ pressed }) => [
									styles.button,
									styles.editButton,
									pressed && styles.buttonPressed,
								]}
								onPress={handleEdit}
							>
								<Ionicons name="pencil" size={16} color="#667eea" />
								<Text style={styles.editButtonText}>Edit Username</Text>
							</Pressable>
						)}
					</View>
				</View>

				{/* Account Info Section */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Account Information</Text>
					<View style={styles.card}>
						<View style={styles.infoRow}>
							<Ionicons name="mail-outline" size={20} color="#667eea" />
							<View style={styles.infoTextContainer}>
								<Text style={styles.infoLabel}>Email</Text>
								<Text style={styles.infoValue}>
									{user?.primaryEmailAddress?.emailAddress || "Not set"}
								</Text>
							</View>
						</View>
						<View style={styles.divider} />
						<View style={styles.infoRow}>
							<Ionicons name="key-outline" size={20} color="#667eea" />
							<View style={styles.infoTextContainer}>
								<Text style={styles.infoLabel}>User ID</Text>
								<Text style={styles.infoValue} numberOfLines={1}>
									{userId || "Not available"}
								</Text>
							</View>
						</View>
					</View>
				</View>

				{/* Debug Section - Only in Development */}
				{__DEV__ && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>🔧 Debug Info</Text>
						<View style={styles.card}>
							<View style={styles.infoRow}>
								<Ionicons name="information-circle" size={20} color="#f59e0b" />
								<View style={styles.infoTextContainer}>
									<Text style={styles.infoLabel}>Current Rank</Text>
									<Text style={styles.infoValue}>{rank}</Text>
								</View>
							</View>
							<View style={styles.divider} />
							<View style={styles.infoRow}>
								<Ionicons name="trophy" size={20} color="#f59e0b" />
								<View style={styles.infoTextContainer}>
									<Text style={styles.infoLabel}>Total Quizzes Passed</Text>
									<Text style={styles.infoValue}>{quizzesPassed}</Text>
								</View>
							</View>
							<View style={styles.divider} />
							<View style={styles.infoRow}>
								<Ionicons name="stats-chart" size={20} color="#f59e0b" />
								<View style={styles.infoTextContainer}>
									<Text style={styles.infoLabel}>Rank Progress</Text>
									<Text style={styles.infoValue}>
										{rank === "novice"
											? `${quizzesPassed}/2 to Intermediate`
											: rank === "intermediate"
												? `${Math.max(0, quizzesPassed - 2)}/3 to Expert`
												: "Max Rank"}
									</Text>
								</View>
							</View>
						</View>
					</View>
				)}

				{/* Sign Out Section */}
				<View style={styles.section}>
					<SignOutButton />
				</View>

				<View style={styles.footer}>
					<Text style={styles.footerText}>Floradex v1.0.0</Text>
				</View>
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
		alignItems: "center",
	},
	avatarCircle: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 16,
		borderWidth: 3,
		borderColor: "rgba(255, 255, 255, 0.3)",
	},
	headerTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 4,
	},
	headerSubtitle: {
		fontSize: 16,
		color: "rgba(255, 255, 255, 0.9)",
		fontWeight: "500",
	},
	scrollView: {
		flex: 1,
	},
	section: {
		paddingHorizontal: 20,
		marginTop: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#333",
		marginBottom: 12,
	},
	card: {
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f8f8f8",
		borderRadius: 8,
		paddingHorizontal: 12,
		marginBottom: 16,
	},
	inputIcon: {
		marginRight: 8,
	},
	input: {
		flex: 1,
		height: 48,
		fontSize: 16,
		color: "#333",
	},
	inputDisabled: {
		color: "#666",
	},
	buttonRow: {
		flexDirection: "row",
		gap: 12,
	},
	button: {
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	editButton: {
		backgroundColor: "#f0f0f0",
		flexDirection: "row",
		gap: 8,
	},
	editButtonText: {
		color: "#667eea",
		fontWeight: "600",
		fontSize: 16,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#f0f0f0",
	},
	cancelButtonText: {
		color: "#666",
		fontWeight: "600",
		fontSize: 16,
	},
	saveButton: {
		flex: 1,
		backgroundColor: "#667eea",
	},
	saveButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	buttonDisabled: {
		opacity: 0.5,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
	},
	infoTextContainer: {
		marginLeft: 12,
		flex: 1,
	},
	infoLabel: {
		fontSize: 12,
		color: "#999",
		marginBottom: 4,
	},
	infoValue: {
		fontSize: 16,
		color: "#333",
		fontWeight: "500",
	},
	divider: {
		height: 1,
		backgroundColor: "#f0f0f0",
	},
	footer: {
		alignItems: "center",
		paddingVertical: 32,
	},
	footerText: {
		fontSize: 14,
		color: "#999",
	},
});
