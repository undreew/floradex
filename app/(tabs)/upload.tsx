import { PlantResult } from "@/components/plant-result";
import { identifyPlantSimple, type PlantIdResponse } from "@/services/plantId";
import {
	getQuizBatchProgress,
	isQuizPending,
	trackSuccessfulScan,
} from "@/services/scanTracker";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function UploadScreen() {
	const { user } = useUser();
	const [photo, setPhoto] = useState<string | null>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisResult, setAnalysisResult] = useState<PlantIdResponse | null>(
		null
	);
	const [analysisError, setAnalysisError] = useState<string | null>(null);

	async function pickImage() {
		// Request permission
		const permissionResult =
			await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (permissionResult.granted === false) {
			Alert.alert(
				"Permission Required",
				"You need to grant gallery access to upload plant images."
			);
			return;
		}

		// Pick image
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 0.7, // Reduced from 1 to avoid large file sizes
		});

		if (!result.canceled && result.assets[0]) {
			console.log("Image selected:", result.assets[0].uri);
			setPhoto(result.assets[0].uri);
			// Reset previous results
			setAnalysisResult(null);
			setAnalysisError(null);
		}
	}

	async function analyzePlant() {
		if (!photo) {
			Alert.alert("Error", "No photo to analyze");
			return;
		}

		setIsAnalyzing(true);
		setAnalysisError(null);
		setAnalysisResult(null);

		try {
			console.log("[Upload] Starting plant analysis...");
			const result = await identifyPlantSimple(photo);

			console.log("[Upload] ========== FULL API RESPONSE ==========");
			console.log(JSON.stringify(result, null, 2));
			console.log("[Upload] ========================================");

			setAnalysisResult(result);

			// Track successful scan if a plant was identified
			if (result?.result?.is_plant?.binary) {
				const topSuggestion = result.result.classification.suggestions[0];

				console.log("[Upload] Top suggestion:", topSuggestion?.name);
				console.log(
					"[Upload] Common names:",
					topSuggestion?.details?.common_names
				);
				console.log("[Upload] Taxonomy:", topSuggestion?.details?.taxonomy);
				console.log("[Upload] Has details?", !!topSuggestion?.details);
				console.log(
					"[Upload] Details keys:",
					topSuggestion?.details ? Object.keys(topSuggestion.details) : "none"
				);

				const plantData = {
					name: topSuggestion?.name || "Unknown Plant",
					commonNames: topSuggestion?.details?.common_names,
					probability: topSuggestion?.probability || 0,
					imageUrl: topSuggestion?.similar_images?.[0]?.url,
					userPhotoUri: photo, // Save the actual photo the user took
					taxonomy: topSuggestion?.details?.taxonomy,
				};

				console.log("[Upload] Data being saved:", plantData);
				await trackSuccessfulScan(user, plantData);
			}
		} catch (error) {
			console.error("Analysis error:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Failed to analyze plant. Please try again.";
			setAnalysisError(errorMessage);
		} finally {
			setIsAnalyzing(false);
		}
	}

	function closeResults() {
		setAnalysisResult(null);
		setAnalysisError(null);
		setPhoto(null);
	}

	function selectNewImage() {
		setPhoto(null);
		setAnalysisResult(null);
		setAnalysisError(null);
		pickImage();
	}

	// Show analysis results
	if (analysisResult || isAnalyzing || analysisError) {
		return (
			<PlantResult
				result={analysisResult}
				isLoading={isAnalyzing}
				error={analysisError}
				onClose={closeResults}
			/>
		);
	}

	// Check if quiz is pending and block uploading
	const quizPending = isQuizPending(user);
	const batchProgress = getQuizBatchProgress(user);

	if (quizPending) {
		return (
			<LinearGradient
				colors={["#3b82f6", "#2563eb"]}
				style={styles.container}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<View style={styles.centeredContent}>
					<Text style={styles.headerTitle}>📤 Upload Photo</Text>

					<View style={styles.blockedContainer}>
						<Text style={styles.blockedIcon}>🔒</Text>
						<Text style={styles.blockedTitle}>Upload Temporarily Locked</Text>
						<Text style={styles.blockedMessage}>
							You've scanned {batchProgress.current}{" "}
							{batchProgress.current === 1 ? "plant" : "plants"}!{"\n\n"}
							Complete the quiz to unlock more scanning.
						</Text>
						<View style={styles.blockedHint}>
							<Text style={styles.blockedHintText}>
								💡 Head to the Quiz tab to continue
							</Text>
						</View>
					</View>
				</View>
			</LinearGradient>
		);
	}

	return (
		<LinearGradient
			colors={["#3b82f6", "#2563eb"]}
			style={styles.container}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.headerTitle}>📤 Upload Photo</Text>
				<Text style={styles.headerSubtitle}>
					Select a plant photo from your gallery to identify it
				</Text>

				{photo ? (
					<View style={styles.previewCard}>
						<Text style={styles.previewTitle}>📸 Selected Photo</Text>
						<View style={styles.imageContainer}>
							<Image
								source={{ uri: photo }}
								style={styles.preview}
								resizeMode="cover"
							/>
						</View>
						<View style={styles.photoActions}>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={selectNewImage}
							>
								<Text style={styles.actionButtonIcon}>🖼️</Text>
								<Text style={styles.actionButtonText}>Choose Another</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.actionButton, styles.analyzeButton]}
								onPress={analyzePlant}
							>
								<Text style={styles.actionButtonIcon}>🔍</Text>
								<Text style={styles.actionButtonText}>Analyze</Text>
							</TouchableOpacity>
						</View>
					</View>
				) : (
					<View style={styles.actionCard}>
						<View style={styles.uploadIconContainer}>
							<Text style={styles.uploadIcon}>🖼️</Text>
						</View>
						<Text style={styles.actionCardTitle}>Upload from Gallery</Text>
						<Text style={styles.actionCardSubtitle}>
							Select a clear photo of a plant
						</Text>
						<TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
							<Text style={styles.uploadButtonText}>Choose from Gallery</Text>
						</TouchableOpacity>
					</View>
				)}
			</ScrollView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	centeredContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	scrollContent: {
		padding: 20,
		paddingTop: 60,
		alignItems: "center",
	},
	headerTitle: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#fff",
		marginBottom: 8,
		textAlign: "center",
	},
	headerSubtitle: {
		fontSize: 16,
		color: "rgba(255, 255, 255, 0.9)",
		marginBottom: 30,
		textAlign: "center",
	},
	actionCard: {
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 40,
		alignItems: "center",
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 15,
	},
	uploadIconContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#eff6ff",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 24,
	},
	uploadIcon: {
		fontSize: 60,
	},
	actionCardTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 8,
	},
	actionCardSubtitle: {
		fontSize: 15,
		color: "#6b7280",
		marginBottom: 30,
		textAlign: "center",
	},
	uploadButton: {
		backgroundColor: "#3b82f6",
		paddingVertical: 16,
		paddingHorizontal: 48,
		borderRadius: 14,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	uploadButtonText: {
		color: "#fff",
		fontSize: 17,
		fontWeight: "600",
	},
	previewCard: {
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 20,
		alignItems: "center",
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 15,
	},
	previewTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 16,
	},
	imageContainer: {
		width: "100%",
		height: 400,
		backgroundColor: "#f3f4f6",
		borderRadius: 16,
		overflow: "hidden",
		marginBottom: 20,
	},
	preview: {
		width: "100%",
		height: "100%",
	},
	photoActions: {
		flexDirection: "row",
		gap: 12,
		width: "100%",
	},
	actionButton: {
		flex: 1,
		backgroundColor: "#f3f4f6",
		paddingVertical: 16,
		borderRadius: 12,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		gap: 8,
	},
	actionButtonIcon: {
		fontSize: 20,
	},
	actionButtonText: {
		color: "#1f2937",
		fontSize: 16,
		fontWeight: "600",
	},
	analyzeButton: {
		backgroundColor: "#3b82f6",
	},
	blockedContainer: {
		alignItems: "center",
		padding: 32,
		borderRadius: 24,
		backgroundColor: "#ffffff",
		width: "100%",
		maxWidth: 400,
		marginTop: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 15,
	},
	blockedIcon: {
		fontSize: 64,
		marginBottom: 20,
	},
	blockedTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 16,
		textAlign: "center",
	},
	blockedMessage: {
		fontSize: 16,
		color: "#6b7280",
		textAlign: "center",
		lineHeight: 24,
	},
	blockedHint: {
		marginTop: 24,
		paddingVertical: 16,
		paddingHorizontal: 20,
		backgroundColor: "#eff6ff",
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#3b82f6",
	},
	blockedHintText: {
		fontSize: 15,
		color: "#2563eb",
		fontWeight: "600",
		textAlign: "center",
	},
});
