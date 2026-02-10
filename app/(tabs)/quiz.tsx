import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
	completeQuiz,
	getCurrentQuizBatch,
	getMinScansRequired,
	getQuizBatchProgress,
	getSuccessfulScanCount,
	hasQuizAccess,
	isQuizPending,
} from "@/services/scanTracker";
import { useUser } from "@clerk/clerk-expo";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const Quiz = () => {
	const { user, isLoaded } = useUser();
	const [isCompletingQuiz, setIsCompletingQuiz] = useState(false);

	const scanCount = getSuccessfulScanCount(user);
	const quizAccess = hasQuizAccess(user);
	const minScansRequired = getMinScansRequired();
	const quizPending = isQuizPending(user);
	const currentBatch = getCurrentQuizBatch(user);
	const batchProgress = getQuizBatchProgress(user);

	const handleCompleteQuiz = async () => {
		Alert.alert(
			"Complete Quiz",
			"This will unlock scanning again. In the future, you'll need to answer quiz questions about these plants.",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Complete",
					onPress: async () => {
						setIsCompletingQuiz(true);
						try {
							await completeQuiz(user);
							Alert.alert(
								"Success! 🎉",
								"Quiz completed! You can now scan more plants."
							);
						} catch (error) {
							Alert.alert(
								"Error",
								"Failed to complete quiz. Please try again."
							);
						} finally {
							setIsCompletingQuiz(false);
						}
					},
				},
			]
		);
	};

	if (!isLoaded) {
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator size="large" />
			</ThemedView>
		);
	}

	// Show quiz if pending
	if (quizPending && currentBatch.length > 0) {
		return (
			<ThemedView style={styles.container}>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
				>
					<ThemedText type="title" style={styles.title}>
						🎯 Quiz Ready!
					</ThemedText>

					<View style={styles.quizPendingContainer}>
						<ThemedText style={styles.quizPendingTitle}>
							Complete the Quiz to Continue
						</ThemedText>
						<ThemedText style={styles.quizPendingSubtext}>
							You've scanned {batchProgress.current} plants. Review them below
							and complete the quiz to unlock more scanning!
						</ThemedText>
					</View>

					<View style={styles.plantsContainer}>
						<ThemedText style={styles.plantsTitle}>
							📚 Plants You've Scanned
						</ThemedText>
						{currentBatch.map((plant, index) => (
							<View key={plant.id} style={styles.plantCard}>
								<View style={styles.plantHeader}>
									<Text style={styles.plantNumber}>#{index + 1}</Text>
									<Text style={styles.plantProbability}>
										{(plant.probability * 100).toFixed(1)}%
									</Text>
								</View>
								<ThemedText style={styles.plantName}>{plant.name}</ThemedText>
								{plant.commonNames && plant.commonNames.length > 0 && (
									<ThemedText style={styles.plantCommonName}>
										({plant.commonNames[0]})
									</ThemedText>
								)}
								<ThemedText style={styles.plantDate}>
									Scanned: {new Date(plant.scannedAt).toLocaleDateString()}
								</ThemedText>
							</View>
						))}
					</View>

					<TouchableOpacity
						style={[
							styles.completeQuizButton,
							isCompletingQuiz && styles.completeQuizButtonDisabled,
						]}
						onPress={handleCompleteQuiz}
						disabled={isCompletingQuiz}
					>
						{isCompletingQuiz ? (
							<ActivityIndicator color="white" />
						) : (
							<>
								<Text style={styles.completeQuizButtonText}>
									✅ Complete Quiz
								</Text>
								<Text style={styles.completeQuizButtonSubtext}>
									(Actual quiz coming soon)
								</Text>
							</>
						)}
					</TouchableOpacity>
				</ScrollView>
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

			{batchProgress.current > 0 && (
				<View style={styles.progressContainer}>
					<ThemedText style={styles.progressLabel}>Current Progress</ThemedText>
					<ThemedText style={styles.progressText}>
						{batchProgress.current}/{batchProgress.total} scans until next quiz
					</ThemedText>
				</View>
			)}

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
	scrollView: {
		flex: 1,
		width: "100%",
	},
	scrollContent: {
		alignItems: "center",
		paddingBottom: 40,
	},
	title: {
		marginBottom: 40,
		marginTop: 20,
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
	progressContainer: {
		alignItems: "center",
		padding: 15,
		borderRadius: 15,
		backgroundColor: "rgba(88, 86, 214, 0.1)",
		borderWidth: 1,
		borderColor: "#5856D6",
		width: "100%",
		maxWidth: 400,
		marginBottom: 20,
	},
	progressLabel: {
		fontSize: 14,
		fontWeight: "600",
		marginBottom: 5,
		opacity: 0.7,
	},
	progressText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#5856D6",
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
	quizPendingContainer: {
		alignItems: "center",
		padding: 20,
		borderRadius: 15,
		backgroundColor: "rgba(88, 86, 214, 0.15)",
		borderWidth: 2,
		borderColor: "#5856D6",
		width: "100%",
		maxWidth: 400,
		marginBottom: 30,
	},
	quizPendingTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#5856D6",
		marginBottom: 10,
		textAlign: "center",
	},
	quizPendingSubtext: {
		fontSize: 14,
		textAlign: "center",
		opacity: 0.8,
		lineHeight: 20,
	},
	plantsContainer: {
		width: "100%",
		maxWidth: 400,
		marginBottom: 20,
	},
	plantsTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 15,
		textAlign: "center",
	},
	plantCard: {
		backgroundColor: "rgba(52, 199, 89, 0.1)",
		padding: 15,
		borderRadius: 12,
		marginBottom: 10,
		borderWidth: 1,
		borderColor: "#34C759",
	},
	plantHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 8,
	},
	plantNumber: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#34C759",
	},
	plantProbability: {
		fontSize: 14,
		fontWeight: "600",
		color: "#34C759",
	},
	plantName: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 4,
	},
	plantCommonName: {
		fontSize: 14,
		fontStyle: "italic",
		opacity: 0.7,
		marginBottom: 4,
	},
	plantDate: {
		fontSize: 12,
		opacity: 0.6,
	},
	completeQuizButton: {
		backgroundColor: "#5856D6",
		padding: 20,
		borderRadius: 15,
		alignItems: "center",
		width: "100%",
		maxWidth: 400,
		marginTop: 10,
	},
	completeQuizButtonDisabled: {
		opacity: 0.6,
	},
	completeQuizButtonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	completeQuizButtonSubtext: {
		color: "white",
		fontSize: 12,
		marginTop: 5,
		opacity: 0.8,
	},
});

export default Quiz;
