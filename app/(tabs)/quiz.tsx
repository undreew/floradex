import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
	getMinScansRequired,
	getSuccessfulScanCount,
	hasQuizAccess,
} from "@/services/scanTracker";
import { useUser } from "@clerk/clerk-expo";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const Quiz = () => {
	const { user, isLoaded } = useUser();
	const scanCount = getSuccessfulScanCount(user);
	const quizAccess = hasQuizAccess(user);
	const minScansRequired = getMinScansRequired();

	if (!isLoaded) {
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator size="large" />
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title" style={styles.title}>
				🌱 Quiz
			</ThemedText>

			<View style={styles.statsContainer}>
				<ThemedText style={styles.statsLabel}>Your Successful Scans</ThemedText>
				<View style={styles.countBadge}>
					<ThemedText style={styles.countNumber}>{scanCount}</ThemedText>
				</View>
				<ThemedText style={styles.statsSubtext}>
					{scanCount === 0
						? "Start scanning plants to track your progress!"
						: scanCount === 1
							? "Great start! Keep scanning to learn more plants."
							: `Amazing! You've identified ${scanCount} plants so far!`}
				</ThemedText>
			</View>

			{quizAccess ? (
				<View style={styles.accessGrantedContainer}>
					<ThemedText style={styles.accessGrantedText}>
						✅ Quiz Access Granted!
					</ThemedText>
					<ThemedText style={styles.comingSoon}>
						🎯 Quiz feature coming soon!
					</ThemedText>
				</View>
			) : (
				<View style={styles.accessDeniedContainer}>
					<ThemedText style={styles.accessDeniedText}>
						🔒 Quiz Locked
					</ThemedText>
					<ThemedText style={styles.requirementText}>
						Scan {minScansRequired - scanCount} more plant
						{minScansRequired - scanCount > 1 ? "s" : ""} to unlock the quiz!
					</ThemedText>
					<ThemedText style={styles.minScansText}>
						({scanCount}/{minScansRequired} scans completed)
					</ThemedText>
				</View>
			)}
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	title: {
		marginBottom: 40,
	},
	statsContainer: {
		alignItems: "center",
		backgroundColor: "rgba(52, 199, 89, 0.1)",
		padding: 30,
		borderRadius: 20,
		width: "100%",
		maxWidth: 400,
		marginBottom: 40,
	},
	statsLabel: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 20,
	},
	countBadge: {
		backgroundColor: "#34C759",
		width: 100,
		height: 100,
		borderRadius: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	countNumber: {
		fontSize: 48,
		fontWeight: "bold",
		color: "#fff",
	},
	statsSubtext: {
		fontSize: 14,
		textAlign: "center",
		opacity: 0.8,
		paddingHorizontal: 20,
	},
	comingSoon: {
		fontSize: 16,
		opacity: 0.6,
		fontStyle: "italic",
	},
	accessGrantedContainer: {
		alignItems: "center",
		padding: 20,
		borderRadius: 15,
		backgroundColor: "rgba(52, 199, 89, 0.15)",
		borderWidth: 2,
		borderColor: "#34C759",
		width: "100%",
		maxWidth: 400,
	},
	accessGrantedText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#34C759",
		marginBottom: 10,
	},
	accessDeniedContainer: {
		alignItems: "center",
		padding: 20,
		borderRadius: 15,
		backgroundColor: "rgba(255, 149, 0, 0.1)",
		borderWidth: 2,
		borderColor: "#FF9500",
		width: "100%",
		maxWidth: 400,
	},
	accessDeniedText: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#FF9500",
		marginBottom: 10,
	},
	requirementText: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 5,
	},
	minScansText: {
		fontSize: 14,
		opacity: 0.7,
	},
});

export default Quiz;
