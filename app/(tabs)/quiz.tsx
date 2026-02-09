import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { getSuccessfulScanCount } from "@/services/scanTracker";
import { useUser } from "@clerk/clerk-expo";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const Quiz = () => {
	const { user, isLoaded } = useUser();
	const scanCount = getSuccessfulScanCount(user);

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

			<ThemedText style={styles.comingSoon}>
				🎯 Quiz feature coming soon!
			</ThemedText>
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
});

export default Quiz;
