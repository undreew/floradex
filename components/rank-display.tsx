import { type UserRank } from "@/services/userProfile";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface RankDisplayProps {
	rank: UserRank;
	quizzesPassed: number;
}

const RANK_CONFIG = {
	novice: {
		title: "Novice",
		icon: "leaf-outline" as const,
		colors: ["#10b981", "#059669"] as const,
		nextRank: "Intermediate",
		quizzesNeeded: 2,
		emoji: "🌱",
	},
	intermediate: {
		title: "Intermediate",
		icon: "flower-outline" as const,
		colors: ["#3b82f6", "#2563eb"] as const,
		nextRank: "Expert",
		quizzesNeeded: 3,
		emoji: "🌿",
	},
	expert: {
		title: "Expert",
		icon: "trophy-outline" as const,
		colors: ["#f59e0b", "#d97706"] as const,
		nextRank: null,
		quizzesNeeded: 0,
		emoji: "🏆",
	},
};

export function RankDisplay({ rank, quizzesPassed }: RankDisplayProps) {
	const config = RANK_CONFIG[rank];

	// Calculate progress for current rank
	let progress = 0;
	let quizzesForNextRank = 0;
	let quizzesInCurrentRank = 0;

	if (rank === "novice") {
		quizzesInCurrentRank = quizzesPassed;
		quizzesForNextRank = 2;
		progress = (quizzesInCurrentRank / quizzesForNextRank) * 100;
	} else if (rank === "intermediate") {
		// User has already passed 2 quizzes as novice, count additional quizzes
		quizzesInCurrentRank = Math.max(0, quizzesPassed - 2);
		quizzesForNextRank = 3;
		progress = (quizzesInCurrentRank / quizzesForNextRank) * 100;
	} else if (rank === "expert") {
		// Max rank reached
		progress = 100;
		quizzesInCurrentRank = quizzesPassed;
	}

	return (
		<View style={styles.container}>
			<LinearGradient
				colors={config.colors}
				style={styles.rankCard}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<View style={styles.rankHeader}>
					<View style={styles.iconContainer}>
						<Text style={styles.emoji}>{config.emoji}</Text>
					</View>
					<View style={styles.rankInfo}>
						<Text style={styles.rankLabel}>Your Rank</Text>
						<Text style={styles.rankTitle}>{config.title}</Text>
					</View>
				</View>

				<View style={styles.statsRow}>
					<View style={styles.statItem}>
						<Ionicons
							name="checkmark-circle"
							size={20}
							color="rgba(255,255,255,0.8)"
						/>
						<Text style={styles.statValue}>{quizzesPassed}</Text>
						<Text style={styles.statLabel}>Quizzes Passed</Text>
					</View>
					<View style={styles.divider} />
					<View style={styles.statItem}>
						<Ionicons name="star" size={20} color="rgba(255,255,255,0.8)" />
						<Text style={styles.statValue}>{config.title}</Text>
						<Text style={styles.statLabel}>Current Level</Text>
					</View>
				</View>

				{config.nextRank && (
					<View style={styles.progressSection}>
						<View style={styles.progressHeader}>
							<Text style={styles.progressText}>
								Progress to {config.nextRank}
							</Text>
							<Text style={styles.progressCount}>
								{quizzesInCurrentRank} / {quizzesForNextRank} quizzes
							</Text>
						</View>
						<View style={styles.progressBarContainer}>
							<View
								style={[
									styles.progressBar,
									{ width: `${Math.min(progress, 100)}%` },
								]}
							/>
						</View>
						<Text style={styles.progressHint}>
							{quizzesForNextRank - quizzesInCurrentRank > 0
								? `${quizzesForNextRank - quizzesInCurrentRank} more quiz${
										quizzesForNextRank - quizzesInCurrentRank === 1 ? "" : "zes"
									} to rank up!`
								: "Ready to rank up!"}
						</Text>
					</View>
				)}

				{rank === "expert" && (
					<View style={styles.maxRankSection}>
						<Ionicons name="trophy" size={32} color="rgba(255,255,255,0.9)" />
						<Text style={styles.maxRankText}>Maximum Rank Achieved!</Text>
						<Text style={styles.maxRankSubtext}>
							You're a true plant expert! Keep taking quizzes to expand your
							knowledge.
						</Text>
					</View>
				)}
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 16,
	},
	rankCard: {
		borderRadius: 16,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 5,
	},
	rankHeader: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
	},
	iconContainer: {
		width: 64,
		height: 64,
		borderRadius: 32,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 16,
	},
	emoji: {
		fontSize: 36,
	},
	rankInfo: {
		flex: 1,
	},
	rankLabel: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.8)",
		marginBottom: 4,
	},
	rankTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: "#fff",
	},
	statsRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		paddingVertical: 16,
		backgroundColor: "rgba(255, 255, 255, 0.1)",
		borderRadius: 12,
	},
	statItem: {
		flex: 1,
		alignItems: "center",
	},
	statValue: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
		marginTop: 4,
		marginBottom: 2,
	},
	statLabel: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.8)",
	},
	divider: {
		width: 1,
		height: 40,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
	},
	progressSection: {
		marginTop: 8,
	},
	progressHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	progressText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#fff",
	},
	progressCount: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.8)",
	},
	progressBarContainer: {
		height: 8,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		borderRadius: 4,
		overflow: "hidden",
		marginBottom: 8,
	},
	progressBar: {
		height: "100%",
		backgroundColor: "#fff",
		borderRadius: 4,
	},
	progressHint: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.9)",
		fontWeight: "500",
	},
	maxRankSection: {
		alignItems: "center",
		marginTop: 8,
		paddingVertical: 16,
	},
	maxRankText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#fff",
		marginTop: 8,
		marginBottom: 4,
	},
	maxRankSubtext: {
		fontSize: 13,
		color: "rgba(255, 255, 255, 0.8)",
		textAlign: "center",
		lineHeight: 18,
	},
});
