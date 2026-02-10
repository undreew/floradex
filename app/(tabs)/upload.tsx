import { PlantResult } from "@/components/plant-result";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { identifyPlantSimple, type PlantIdResponse } from "@/services/plantId";
import {
	getQuizBatchProgress,
	isQuizPending,
	trackSuccessfulScan,
} from "@/services/scanTracker";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
	Alert,
	Image,
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
			quality: 1,
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
			console.log("Starting plant analysis from gallery image...");
			const result = await identifyPlantSimple(photo);
			console.log("Analysis complete:", result);
			setAnalysisResult(result);

			// Track successful scan if a plant was identified
			if (result?.result?.is_plant?.binary) {
				const topSuggestion = result.result.classification.suggestions[0];
				await trackSuccessfulScan(user, {
					name: topSuggestion?.name || "Unknown Plant",
					commonNames: topSuggestion?.details?.common_names,
					probability: topSuggestion?.probability || 0,
					imageUrl: topSuggestion?.similar_images?.[0]?.url,
				});
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
			<ThemedView style={styles.container}>
				<ThemedText type="title" style={styles.title}>
					📤 Upload Photo
				</ThemedText>

				<View style={styles.blockedContainer}>
					<Text style={styles.blockedIcon}>🔒</Text>
					<ThemedText style={styles.blockedTitle}>
						Upload Temporarily Locked
					</ThemedText>
					<ThemedText style={styles.blockedMessage}>
						You've scanned {batchProgress.current} plants!
						{"\n\n"}
						Complete the quiz to unlock more scanning.
					</ThemedText>
					<View style={styles.blockedHint}>
						<ThemedText style={styles.blockedHintText}>
							💡 Head to the Quiz tab to continue
						</ThemedText>
					</View>
				</View>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title" style={styles.title}>
				📤 Upload Photo
			</ThemedText>
			<ThemedText style={styles.subtitle}>
				Select a plant photo from your gallery to identify it
			</ThemedText>

			{photo ? (
				<View style={styles.previewContainer}>
					<ThemedText style={styles.previewTitle}>📸 Selected Photo</ThemedText>
					<View style={styles.imageContainer}>
						<Image
							source={{ uri: photo }}
							style={styles.preview}
							resizeMode="cover"
						/>
					</View>
					<View style={styles.photoActions}>
						<TouchableOpacity style={styles.button} onPress={selectNewImage}>
							<Text style={styles.buttonText}>🖼️ Choose Another</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.button, styles.analyzeButton]}
							onPress={analyzePlant}
						>
							<Text style={styles.buttonText}>🔍 Analyze</Text>
						</TouchableOpacity>
					</View>
				</View>
			) : (
				<TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
					<Text style={styles.uploadIcon}>🖼️</Text>
					<Text style={styles.buttonText}>Choose from Gallery</Text>
					<ThemedText style={styles.uploadHint}>
						Select a clear photo of a plant
					</ThemedText>
				</TouchableOpacity>
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		justifyContent: "center",
		alignItems: "center",
	},
	title: {
		marginBottom: 10,
	},
	subtitle: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 30,
		opacity: 0.7,
	},
	uploadButton: {
		backgroundColor: "#5856D6",
		padding: 30,
		borderRadius: 20,
		alignItems: "center",
		minWidth: 250,
	},
	uploadIcon: {
		fontSize: 50,
		marginBottom: 10,
	},
	uploadHint: {
		fontSize: 12,
		marginTop: 10,
		opacity: 0.7,
	},
	previewContainer: {
		alignItems: "center",
		width: "100%",
		flex: 1,
		justifyContent: "center",
	},
	previewTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 15,
	},
	imageContainer: {
		width: "100%",
		height: 450,
		backgroundColor: "#f0f0f0",
		borderRadius: 20,
		overflow: "hidden",
		marginBottom: 20,
		borderWidth: 2,
		borderColor: "#5856D6",
	},
	preview: {
		width: "100%",
		height: "100%",
	},
	photoActions: {
		flexDirection: "row",
		gap: 15,
	},
	button: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		minWidth: 140,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	analyzeButton: {
		backgroundColor: "#5856D6",
	},
	blockedContainer: {
		alignItems: "center",
		padding: 30,
		borderRadius: 20,
		backgroundColor: "rgba(255, 149, 0, 0.1)",
		borderWidth: 2,
		borderColor: "#FF9500",
		width: "100%",
		maxWidth: 400,
		marginTop: 20,
	},
	blockedIcon: {
		fontSize: 60,
		marginBottom: 20,
	},
	blockedTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 15,
		textAlign: "center",
	},
	blockedMessage: {
		fontSize: 16,
		textAlign: "center",
		opacity: 0.8,
		lineHeight: 24,
	},
	blockedHint: {
		marginTop: 20,
		padding: 15,
		backgroundColor: "rgba(52, 199, 89, 0.1)",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#34C759",
	},
	blockedHintText: {
		fontSize: 14,
		color: "#34C759",
		fontWeight: "600",
		textAlign: "center",
	},
});
