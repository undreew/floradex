import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
	completeQuiz,
	generateQuizQuestions,
	getCurrentQuizBatch,
	getMinScansRequired,
	getQuizBatchProgress,
	getSuccessfulScanCount,
	hasQuizAccess,
	isQuizPending,
	type QuizQuestion,
} from "@/services/scanTracker";
import { useUser } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
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
	const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [score, setScore] = useState(0);
	const [showResult, setShowResult] = useState(false);
	const [quizStarted, setQuizStarted] = useState(false);

	const scanCount = getSuccessfulScanCount(user);
	const quizAccess = hasQuizAccess(user);
	const minScansRequired = getMinScansRequired();
	const quizPending = isQuizPending(user);
	const currentBatch = getCurrentQuizBatch(user);
	const batchProgress = getQuizBatchProgress(user);

	// Generate quiz questions when batch is ready
	useEffect(() => {
		if (quizPending && currentBatch.length > 0 && quizQuestions.length === 0) {
			const questions = generateQuizQuestions(currentBatch);
			setQuizQuestions(questions);
		}
	}, [quizPending, currentBatch]);

	const handleStartQuiz = () => {
		setQuizStarted(true);
		setCurrentQuestionIndex(0);
		setScore(0);
		setShowResult(false);
		setSelectedAnswer(null);
	};

	const handleAnswerSelect = (answer: string) => {
		if (selectedAnswer) return; // Already answered

		setSelectedAnswer(answer);
		const currentQuestion = quizQuestions[currentQuestionIndex];

		if (answer === currentQuestion.correctAnswer) {
			setScore(score + 1);
		}
	};

	const handleNextQuestion = () => {
		if (currentQuestionIndex < quizQuestions.length - 1) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
			setSelectedAnswer(null);
		} else {
			setShowResult(true);
		}
	};

	const handleFinishQuiz = async () => {
		const percentage = (score / quizQuestions.length) * 100;
		const passed = percentage >= 60; // 60% passing grade

		Alert.alert(
			passed ? "Congratulations! 🎉" : "Quiz Complete",
			passed
				? `You scored ${score}/${quizQuestions.length} (${percentage.toFixed(0)}%)!\n\nYou can now scan more plants.`
				: `You scored ${score}/${quizQuestions.length} (${percentage.toFixed(0)}%).\n\nYou can retake the quiz or continue scanning.`,
			[
				{
					text: passed ? "Continue" : "Retake Quiz",
					onPress: async () => {
						if (passed) {
							setIsCompletingQuiz(true);
							try {
								await completeQuiz(user);
								// Reset quiz state
								setQuizStarted(false);
								setQuizQuestions([]);
								setCurrentQuestionIndex(0);
								setScore(0);
								setShowResult(false);
								setSelectedAnswer(null);
							} catch (error) {
								Alert.alert(
									"Error",
									"Failed to complete quiz. Please try again."
								);
							} finally {
								setIsCompletingQuiz(false);
							}
						} else {
							// Retake quiz
							setQuizStarted(false);
							setCurrentQuestionIndex(0);
							setScore(0);
							setShowResult(false);
							setSelectedAnswer(null);
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
		// Show quiz results
		if (showResult) {
			const percentage = (score / quizQuestions.length) * 100;
			const passed = percentage >= 60;

			return (
				<ThemedView style={styles.container}>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
					>
						<ThemedText type="title" style={styles.title}>
							{passed ? "🎉 Great Job!" : "📊 Quiz Complete"}
						</ThemedText>

						<View
							style={[
								styles.resultContainer,
								passed ? styles.resultPassed : styles.resultFailed,
							]}
						>
							<Text style={styles.resultIcon}>{passed ? "✅" : "📝"}</Text>
							<ThemedText style={styles.resultScore}>
								{score} / {quizQuestions.length}
							</ThemedText>
							<ThemedText style={styles.resultPercentage}>
								{percentage.toFixed(0)}%
							</ThemedText>
							<ThemedText style={styles.resultMessage}>
								{passed
									? "Excellent work! You can now continue scanning plants."
									: "Keep learning! You can retake the quiz or continue anyway."}
							</ThemedText>
						</View>

						<TouchableOpacity
							style={[
								styles.finishButton,
								isCompletingQuiz && styles.finishButtonDisabled,
							]}
							onPress={handleFinishQuiz}
							disabled={isCompletingQuiz}
						>
							{isCompletingQuiz ? (
								<ActivityIndicator color="white" />
							) : (
								<Text style={styles.finishButtonText}>
									{passed ? "Continue" : "Finish"}
								</Text>
							)}
						</TouchableOpacity>
					</ScrollView>
				</ThemedView>
			);
		}

		// Show quiz interface
		if (quizStarted && quizQuestions.length > 0) {
			const currentQuestion = quizQuestions[currentQuestionIndex];

			return (
				<ThemedView style={styles.container}>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
					>
						<View style={styles.quizHeader}>
							<ThemedText style={styles.questionCounter}>
								Question {currentQuestion.questionNumber} of{" "}
								{quizQuestions.length}
							</ThemedText>
							<ThemedText style={styles.scoreCounter}>
								Score: {score}/{currentQuestionIndex}
							</ThemedText>
						</View>

						<View style={styles.questionContainer}>
							<ThemedText style={styles.questionText}>
								What is the name of this plant?
							</ThemedText>

							<View style={styles.plantInfoCard}>
								<ThemedText style={styles.plantScientificName}>
									{currentQuestion.plant.name}
								</ThemedText>
								{currentQuestion.plant.probability && (
									<ThemedText style={styles.plantConfidence}>
										Confidence:{" "}
										{(currentQuestion.plant.probability * 100).toFixed(1)}%
									</ThemedText>
								)}
								<ThemedText style={styles.plantScannedDate}>
									Scanned on{" "}
									{new Date(
										currentQuestion.plant.scannedAt
									).toLocaleDateString()}
								</ThemedText>
							</View>
						</View>

						<View style={styles.optionsContainer}>
							{currentQuestion.options.map((option, index) => {
								const isSelected = selectedAnswer === option;
								const isCorrect = option === currentQuestion.correctAnswer;
								const showFeedback = selectedAnswer !== null;

								let optionStyle = styles.optionButton;
								if (showFeedback) {
									if (isSelected && isCorrect) {
										optionStyle = styles.optionCorrect;
									} else if (isSelected && !isCorrect) {
										optionStyle = styles.optionWrong;
									} else if (isCorrect) {
										optionStyle = styles.optionCorrect;
									}
								}

								return (
									<TouchableOpacity
										key={index}
										style={optionStyle}
										onPress={() => handleAnswerSelect(option)}
										disabled={selectedAnswer !== null}
									>
										<Text style={styles.optionLetter}>
											{String.fromCharCode(65 + index)}
										</Text>
										<ThemedText style={styles.optionText}>{option}</ThemedText>
										{showFeedback && isCorrect && (
											<Text style={styles.optionIcon}>✓</Text>
										)}
										{showFeedback && isSelected && !isCorrect && (
											<Text style={styles.optionIcon}>✗</Text>
										)}
									</TouchableOpacity>
								);
							})}
						</View>

						{selectedAnswer && (
							<TouchableOpacity
								style={styles.nextButton}
								onPress={handleNextQuestion}
							>
								<Text style={styles.nextButtonText}>
									{currentQuestionIndex < quizQuestions.length - 1
										? "Next Question →"
										: "View Results"}
								</Text>
							</TouchableOpacity>
						)}
					</ScrollView>
				</ThemedView>
			);
		}

		// Show quiz start screen
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
							Test Your Plant Knowledge
						</ThemedText>
						<ThemedText style={styles.quizPendingSubtext}>
							You've scanned {batchProgress.current} plants. Take this quiz to
							unlock more scanning!
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
						style={styles.startQuizButton}
						onPress={handleStartQuiz}
					>
						<Text style={styles.startQuizButtonText}>🚀 Start Quiz</Text>
						<Text style={styles.startQuizButtonSubtext}>
							{quizQuestions.length} questions • Passing grade: 60%
						</Text>
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
	startQuizButton: {
		backgroundColor: "#5856D6",
		padding: 20,
		borderRadius: 15,
		alignItems: "center",
		width: "100%",
		maxWidth: 400,
		marginTop: 10,
	},
	startQuizButtonText: {
		color: "white",
		fontSize: 20,
		fontWeight: "bold",
	},
	startQuizButtonSubtext: {
		color: "white",
		fontSize: 13,
		marginTop: 5,
		opacity: 0.9,
	},
	quizHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		maxWidth: 400,
		marginBottom: 20,
		paddingHorizontal: 10,
	},
	questionCounter: {
		fontSize: 16,
		fontWeight: "600",
		color: "#5856D6",
	},
	scoreCounter: {
		fontSize: 16,
		fontWeight: "600",
		color: "#34C759",
	},
	questionContainer: {
		width: "100%",
		maxWidth: 400,
		marginBottom: 20,
	},
	questionText: {
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 20,
	},
	plantInfoCard: {
		backgroundColor: "rgba(88, 86, 214, 0.1)",
		padding: 20,
		borderRadius: 15,
		borderWidth: 2,
		borderColor: "#5856D6",
		alignItems: "center",
	},
	plantScientificName: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
		fontStyle: "italic",
	},
	plantConfidence: {
		fontSize: 14,
		opacity: 0.7,
		marginBottom: 4,
	},
	plantScannedDate: {
		fontSize: 12,
		opacity: 0.6,
	},
	optionsContainer: {
		width: "100%",
		maxWidth: 400,
		gap: 12,
	},
	optionButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(120, 120, 128, 0.1)",
		padding: 16,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "transparent",
	},
	optionCorrect: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(52, 199, 89, 0.15)",
		padding: 16,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#34C759",
	},
	optionWrong: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "rgba(255, 59, 48, 0.15)",
		padding: 16,
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#FF3B30",
	},
	optionLetter: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#5856D6",
		marginRight: 12,
		width: 30,
		textAlign: "center",
	},
	optionText: {
		fontSize: 16,
		flex: 1,
	},
	optionIcon: {
		fontSize: 20,
		marginLeft: 10,
	},
	nextButton: {
		backgroundColor: "#34C759",
		padding: 18,
		borderRadius: 12,
		alignItems: "center",
		width: "100%",
		maxWidth: 400,
		marginTop: 20,
	},
	nextButtonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	resultContainer: {
		alignItems: "center",
		padding: 40,
		borderRadius: 20,
		borderWidth: 3,
		width: "100%",
		maxWidth: 400,
		marginBottom: 30,
	},
	resultPassed: {
		backgroundColor: "rgba(52, 199, 89, 0.1)",
		borderColor: "#34C759",
	},
	resultFailed: {
		backgroundColor: "rgba(255, 149, 0, 0.1)",
		borderColor: "#FF9500",
	},
	resultIcon: {
		fontSize: 64,
		marginBottom: 20,
	},
	resultScore: {
		fontSize: 48,
		fontWeight: "bold",
		marginBottom: 10,
	},
	resultPercentage: {
		fontSize: 32,
		fontWeight: "600",
		opacity: 0.8,
		marginBottom: 20,
	},
	resultMessage: {
		fontSize: 16,
		textAlign: "center",
		lineHeight: 24,
		opacity: 0.8,
	},
	finishButton: {
		backgroundColor: "#5856D6",
		padding: 20,
		borderRadius: 15,
		alignItems: "center",
		width: "100%",
		maxWidth: 400,
	},
	finishButtonDisabled: {
		opacity: 0.6,
	},
	finishButtonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
});

export default Quiz;
