import {
	completeQuiz,
	generateQuizQuestions,
	getCurrentQuizBatch,
	getQuizBatchProgress,
	isQuizPending,
	type QuizQuestion,
} from "@/services/scanTracker";
import { userProfileService } from "@/services/userProfile";
import { useUser } from "@clerk/clerk-expo";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
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

	const quizPending = isQuizPending(user);
	const currentBatch = getCurrentQuizBatch(user);
	const batchProgress = getQuizBatchProgress(user);

	// Generate quiz questions when batch is ready
	useEffect(() => {
		console.log("[Quiz] useEffect triggered:", {
			quizPending,
			batchLength: currentBatch.length,
			currentQuestionsLength: quizQuestions.length,
		});

		if (quizPending && currentBatch.length > 0 && quizQuestions.length === 0) {
			console.log("[Quiz] Generating quiz questions...");
			const questions = generateQuizQuestions(currentBatch);
			console.log(`[Quiz] Generated ${questions.length} questions`);
			setQuizQuestions(questions);

			if (questions.length === 0) {
				console.warn("[Quiz] No questions generated! Check plant data.");
			}
		}
	}, [quizPending, currentBatch.length, quizQuestions.length]);

	const handleStartQuiz = () => {
		if (quizQuestions.length === 0) {
			Alert.alert(
				"No Questions Available",
				"Unable to generate quiz questions from your scanned plants. Please try scanning plants again with better lighting and focus."
			);
			return;
		}
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

								// Record quiz pass in user profile for rank tracking
								try {
									const result = await userProfileService.recordQuizPassed();
									if (result.newRank) {
										// Show rank up notification
										setTimeout(() => {
											Alert.alert(
												"🎖️ Rank Up!",
												`Congratulations! You've been promoted to ${result.newRank?.toUpperCase()}!`,
												[{ text: "Awesome!" }]
											);
										}, 500);
									}
								} catch (error) {
									console.error("Failed to record quiz in profile:", error);
								}

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
			<LinearGradient
				colors={["#f59e0b", "#d97706"]}
				style={styles.container}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<ActivityIndicator size="large" color="#fff" />
			</LinearGradient>
		);
	}

	// Show quiz if pending
	if (quizPending && currentBatch.length > 0) {
		// Show quiz results
		if (showResult) {
			const percentage = (score / quizQuestions.length) * 100;
			const passed = percentage >= 60;

			return (
				<LinearGradient
					colors={["#f59e0b", "#d97706"]}
					style={styles.container}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
				>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
					>
						<Text style={styles.headerTitle}>
							{passed ? "🎉 Great Job!" : "📊 Quiz Complete"}
						</Text>

						<View style={styles.resultContainer}>
							<Text style={styles.resultIcon}>{passed ? "✅" : "📝"}</Text>
							<Text style={styles.resultScore}>
								{score} / {quizQuestions.length}
							</Text>
							<Text style={styles.resultPercentage}>
								{percentage.toFixed(0)}%
							</Text>
							<Text style={styles.resultMessage}>
								{passed
									? "Excellent work! You can now continue scanning plants."
									: "Keep learning! You can retake the quiz or continue anyway."}
							</Text>
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
				</LinearGradient>
			);
		}

		// Show quiz interface
		if (quizStarted && quizQuestions.length > 0) {
			const currentQuestion = quizQuestions[currentQuestionIndex];

			return (
				<LinearGradient
					colors={["#f59e0b", "#d97706"]}
					style={styles.container}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
				>
					<ScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						showsVerticalScrollIndicator={false}
					>
						<View style={styles.quizHeader}>
							<Text style={styles.questionCounter}>
								Question {currentQuestion.questionNumber} of{" "}
								{quizQuestions.length}
							</Text>
							<Text style={styles.scoreCounter}>
								Score: {score}/{currentQuestionIndex}
							</Text>
						</View>

						<View style={styles.questionCard}>
							<Text style={styles.questionText}>
								{currentQuestion.questionText}
							</Text>

							<View style={styles.plantInfoCard}>
								{currentQuestion.plant.userPhotoUri && (
									<Image
										source={{ uri: currentQuestion.plant.userPhotoUri }}
										style={styles.plantImage}
										resizeMode="cover"
									/>
								)}
								<Text style={styles.plantScientificName}>
									{currentQuestion.displayName}
								</Text>
								{currentQuestion.plant.probability && (
									<Text style={styles.plantConfidence}>
										Confidence:{" "}
										{(currentQuestion.plant.probability * 100).toFixed(1)}%
									</Text>
								)}
								<Text style={styles.plantScannedDate}>
									Scanned on{" "}
									{new Date(
										currentQuestion.plant.scannedAt
									).toLocaleDateString()}
								</Text>
							</View>
						</View>

						<View style={styles.optionsContainer}>
							{currentQuestion.options.map((option: string, index: number) => {
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
										<Text style={styles.optionText}>{option}</Text>
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
				</LinearGradient>
			);
		}

		// Show quiz start screen
		return (
			<LinearGradient
				colors={["#f59e0b", "#d97706"]}
				style={styles.container}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<ScrollView
					style={styles.scrollView}
					contentContainerStyle={styles.scrollContent}
					showsVerticalScrollIndicator={false}
				>
					<Text style={styles.headerTitle}>🎯 Quiz Ready!</Text>

					<View style={styles.quizPendingContainer}>
						<Text style={styles.quizPendingTitle}>
							Test Your Plant Knowledge
						</Text>
						<Text style={styles.quizPendingSubtext}>
							You've scanned {batchProgress.current}{" "}
							{batchProgress.current === 1 ? "plant" : "plants"}. Take this quiz
							to unlock more scanning!
						</Text>
					</View>

					<View style={styles.plantsContainer}>
						<Text style={styles.plantsTitle}>📚 Plants You've Scanned</Text>
						{currentBatch.map((plant, index) => (
							<View key={plant.id} style={styles.plantCard}>
								{plant.userPhotoUri && (
									<Image
										source={{ uri: plant.userPhotoUri }}
										style={styles.plantThumbnail}
										resizeMode="cover"
									/>
								)}
								<View style={styles.plantCardContent}>
									<View style={styles.plantHeader}>
										<Text style={styles.plantNumber}>#{index + 1}</Text>
										<Text style={styles.plantProbability}>
											{(plant.probability * 100).toFixed(1)}%
										</Text>
									</View>
									<Text style={styles.plantName}>{plant.name}</Text>
									{plant.commonNames && plant.commonNames.length > 0 && (
										<Text style={styles.plantCommonName}>
											({plant.commonNames[0]})
										</Text>
									)}
									<Text style={styles.plantDate}>
										Scanned: {new Date(plant.scannedAt).toLocaleDateString()}
									</Text>
									{plant.taxonomy && (
										<View style={styles.taxonomyInfo}>
											{plant.taxonomy.genus && (
												<Text style={styles.taxonomyText}>
													Genus: {plant.taxonomy.genus}
												</Text>
											)}
											{plant.taxonomy.family && (
												<Text style={styles.taxonomyText}>
													Family: {plant.taxonomy.family}
												</Text>
											)}
										</View>
									)}
									<TouchableOpacity
										style={styles.debugButton}
										onPress={() => {
											Alert.alert(
												"Plant Data",
												`Name: ${plant.name}\n` +
													`Common Names: ${plant.commonNames?.join(", ") || "None"}\n` +
													`Genus: ${plant.taxonomy?.genus || "None"}\n` +
													`Family: ${plant.taxonomy?.family || "None"}\n` +
													`Kingdom: ${plant.taxonomy?.kingdom || "None"}\n` +
													`Probability: ${(plant.probability * 100).toFixed(1)}%`
											);
										}}
									>
										<Text style={styles.debugButtonText}>
											🔍 View Plant Data
										</Text>
									</TouchableOpacity>
								</View>
							</View>
						))}
					</View>

					<TouchableOpacity
						style={[
							styles.startQuizButton,
							quizQuestions.length === 0 && styles.startQuizButtonDisabled,
						]}
						onPress={handleStartQuiz}
						disabled={quizQuestions.length === 0}
					>
						<Text style={styles.startQuizButtonText}>
							{quizQuestions.length === 0
								? "⚠️ No Questions Available"
								: "🚀 Start Quiz"}
						</Text>
						<Text style={styles.startQuizButtonSubtext}>
							{quizQuestions.length > 0
								? `${quizQuestions.length} questions • Passing grade: 60%`
								: "Plants need more data for quiz generation"}
						</Text>
					</TouchableOpacity>
				</ScrollView>
			</LinearGradient>
		);
	}

	return (
		<LinearGradient
			colors={["#f59e0b", "#d97706"]}
			style={styles.container}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyIcon}>🌱</Text>
					<Text style={styles.headerTitle}>Quiz</Text>

					<View style={styles.cycleContainer}>
						<Text style={styles.cycleTitle}>Quiz Cycle Progress</Text>
						<View style={styles.cycleBadge}>
							<Text style={styles.cycleCount}>{batchProgress.current}</Text>
							<Text style={styles.cycleTotal}> / {batchProgress.total}</Text>
						</View>
						<Text style={styles.cycleSubtext}>
							{batchProgress.current === 0
								? `Scan ${process.env.EXPO_PUBLIC_QUIZ_MIN_SCANS} ${
										parseInt(process.env.EXPO_PUBLIC_QUIZ_MIN_SCANS || "1") ===
										1
											? "plant"
											: "plants"
									} to unlock a new quiz!`
								: `${batchProgress.total - batchProgress.current} more ${
										batchProgress.total - batchProgress.current === 1
											? "scan"
											: "scans"
									} until quiz unlocks!`}
						</Text>
					</View>
				</View>
			</ScrollView>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 40,
	},
	headerTitle: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 20,
		marginTop: 20,
		textAlign: "center",
	},
	emptyContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	emptyIcon: {
		fontSize: 80,
		marginBottom: 20,
	},
	cycleContainer: {
		backgroundColor: "#fff",
		borderRadius: 24,
		padding: 32,
		alignItems: "center",
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 8,
	},
	cycleTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#1f2937",
		marginBottom: 16,
		textAlign: "center",
	},
	cycleBadge: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f59e0b",
		paddingHorizontal: 24,
		paddingVertical: 12,
		borderRadius: 999,
		marginBottom: 16,
		shadowColor: "#f59e0b",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	cycleCount: {
		fontSize: 36,
		fontWeight: "bold",
		color: "#fff",
	},
	cycleTotal: {
		fontSize: 24,
		fontWeight: "600",
		color: "#fff",
		opacity: 0.9,
	},
	cycleSubtext: {
		fontSize: 15,
		color: "#6b7280",
		textAlign: "center",
		lineHeight: 22,
	},
	quizPendingContainer: {
		backgroundColor: "#fff",
		borderRadius: 20,
		padding: 24,
		marginBottom: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	quizPendingTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 10,
		textAlign: "center",
	},
	quizPendingSubtext: {
		fontSize: 15,
		color: "#6b7280",
		textAlign: "center",
		lineHeight: 22,
	},
	plantsContainer: {
		width: "100%",
		marginBottom: 20,
	},
	plantsTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#fff",
		marginBottom: 16,
		textAlign: "center",
	},
	plantCard: {
		backgroundColor: "#fff",
		borderRadius: 20,
		marginBottom: 16,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	plantThumbnail: {
		width: "100%",
		height: 180,
	},
	plantCardContent: {
		padding: 20,
	},
	plantHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	plantNumber: {
		fontSize: 14,
		fontWeight: "bold",
		color: "#f59e0b",
		backgroundColor: "#fef3c7",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	plantProbability: {
		fontSize: 14,
		fontWeight: "600",
		color: "#10b981",
		backgroundColor: "#d1fae5",
		paddingHorizontal: 12,
		paddingVertical: 4,
		borderRadius: 12,
	},
	plantName: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 4,
	},
	plantCommonName: {
		fontSize: 15,
		fontStyle: "italic",
		color: "#6b7280",
		marginBottom: 8,
	},
	plantDate: {
		fontSize: 13,
		color: "#9ca3af",
	},
	taxonomyInfo: {
		marginTop: 12,
		paddingTop: 12,
		borderTopWidth: 1,
		borderTopColor: "#e5e7eb",
	},
	taxonomyText: {
		fontSize: 13,
		color: "#6b7280",
		marginBottom: 4,
	},
	debugButton: {
		marginTop: 12,
		paddingVertical: 10,
		paddingHorizontal: 16,
		backgroundColor: "#f3f4f6",
		borderRadius: 12,
		alignItems: "center",
	},
	debugButtonText: {
		fontSize: 13,
		color: "#4b5563",
		fontWeight: "600",
	},
	startQuizButton: {
		backgroundColor: "#fff",
		padding: 24,
		borderRadius: 20,
		alignItems: "center",
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 8,
	},
	startQuizButtonDisabled: {
		opacity: 0.5,
	},
	startQuizButtonText: {
		color: "#1f2937",
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 4,
	},
	startQuizButtonSubtext: {
		color: "#6b7280",
		fontSize: 14,
		marginTop: 4,
	},
	quizHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		marginBottom: 20,
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	questionCounter: {
		fontSize: 15,
		fontWeight: "600",
		color: "#f59e0b",
	},
	scoreCounter: {
		fontSize: 15,
		fontWeight: "600",
		color: "#10b981",
	},
	questionCard: {
		backgroundColor: "#fff",
		borderRadius: 24,
		padding: 24,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 8,
	},
	questionText: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#1f2937",
		textAlign: "center",
		marginBottom: 20,
		lineHeight: 30,
	},
	plantInfoCard: {
		backgroundColor: "#fef3c7",
		padding: 20,
		borderRadius: 20,
		alignItems: "center",
		overflow: "hidden",
		borderWidth: 2,
		borderColor: "#fbbf24",
	},
	plantImage: {
		width: "100%",
		height: 200,
		borderRadius: 16,
		marginBottom: 16,
	},
	plantScientificName: {
		fontSize: 17,
		fontWeight: "600",
		color: "#1f2937",
		marginBottom: 8,
		fontStyle: "italic",
	},
	plantConfidence: {
		fontSize: 14,
		color: "#6b7280",
		marginBottom: 4,
	},
	plantScannedDate: {
		fontSize: 13,
		color: "#9ca3af",
	},
	optionsContainer: {
		width: "100%",
		gap: 12,
	},
	optionButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 18,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#e5e7eb",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	optionCorrect: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#d1fae5",
		padding: 18,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#10b981",
		shadowColor: "#10b981",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	optionWrong: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fee2e2",
		padding: 18,
		borderRadius: 16,
		borderWidth: 2,
		borderColor: "#ef4444",
		shadowColor: "#ef4444",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	optionLetter: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#f59e0b",
		marginRight: 12,
		width: 32,
		height: 32,
		textAlign: "center",
		lineHeight: 32,
		backgroundColor: "#fef3c7",
		borderRadius: 16,
	},
	optionText: {
		fontSize: 16,
		color: "#1f2937",
		flex: 1,
		fontWeight: "500",
	},
	optionIcon: {
		fontSize: 20,
		marginLeft: 10,
	},
	nextButton: {
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 16,
		alignItems: "center",
		width: "100%",
		marginTop: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 8,
	},
	nextButtonText: {
		color: "#1f2937",
		fontSize: 18,
		fontWeight: "bold",
	},
	resultContainer: {
		backgroundColor: "#fff",
		borderRadius: 24,
		padding: 40,
		alignItems: "center",
		width: "100%",
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 12,
		elevation: 8,
	},
	resultIcon: {
		fontSize: 72,
		marginBottom: 20,
	},
	resultScore: {
		fontSize: 48,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 10,
	},
	resultPercentage: {
		fontSize: 36,
		fontWeight: "600",
		color: "#f59e0b",
		marginBottom: 20,
	},
	resultMessage: {
		fontSize: 16,
		color: "#6b7280",
		textAlign: "center",
		lineHeight: 24,
	},
	finishButton: {
		backgroundColor: "#fff",
		padding: 20,
		borderRadius: 16,
		alignItems: "center",
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 12,
		elevation: 8,
	},
	finishButtonDisabled: {
		opacity: 0.6,
	},
	finishButtonText: {
		color: "#1f2937",
		fontSize: 18,
		fontWeight: "bold",
	},
});

export default Quiz;
