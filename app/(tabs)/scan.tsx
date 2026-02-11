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
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useRef, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

export default function ScanScreen() {
	const { user } = useUser();
	const [facing, setFacing] = useState<CameraType>("back");
	const [permission, requestPermission] = useCameraPermissions();
	const [photo, setPhoto] = useState<string | null>(null);
	const [isCameraOpen, setIsCameraOpen] = useState(false);
	const [isCapturing, setIsCapturing] = useState(false);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [analysisResult, setAnalysisResult] = useState<PlantIdResponse | null>(
		null
	);
	const [analysisError, setAnalysisError] = useState<string | null>(null);
	const cameraRef = useRef<CameraView>(null);

	if (!permission) {
		// Camera permissions are still loading
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator size="large" />
				<ThemedText style={styles.message}>Loading...</ThemedText>
			</ThemedView>
		);
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet
		return (
			<ThemedView style={styles.container}>
				<ThemedText type="title" style={styles.title}>
					📷 Camera Access
				</ThemedText>
				<ThemedText style={styles.message}>
					We need your permission to use the camera to scan plants
				</ThemedText>
				<TouchableOpacity style={styles.button} onPress={requestPermission}>
					<Text style={styles.buttonText}>Grant Camera Permission</Text>
				</TouchableOpacity>
			</ThemedView>
		);
	}

	function toggleCameraFacing() {
		setFacing((current) => (current === "back" ? "front" : "back"));
	}

	async function takePicture() {
		if (cameraRef.current && !isCapturing) {
			setIsCapturing(true);
			try {
				const photo = await cameraRef.current.takePictureAsync({
					quality: 0.7, // Reduced from 1.0 to avoid large file sizes
				});

				if (photo && photo.uri) {
					console.log("Photo captured successfully!");
					console.log("URI:", photo.uri);
					console.log("Width:", photo.width);
					console.log("Height:", photo.height);

					// Use the URI directly as returned by the camera
					setPhoto(photo.uri);
					setIsCameraOpen(false);
				}
			} catch (error) {
				Alert.alert("Error", "Failed to take picture. Please try again.");
				console.error("Camera error:", error);
			} finally {
				setIsCapturing(false);
			}
		}
	}

	function openCamera() {
		setPhoto(null);
		setIsCameraOpen(true);
	}

	function retakePicture() {
		setPhoto(null);
		setIsCameraOpen(true);
	}

	function closeCamera() {
		setIsCameraOpen(false);
		setIsCapturing(false);
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
			console.log("Starting plant analysis...");
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

	if (isCameraOpen) {
		return (
			<View style={styles.cameraContainer}>
				<CameraView style={styles.camera} facing={facing} ref={cameraRef}>
					<View style={styles.cameraButtonContainer}>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={closeCamera}
							disabled={isCapturing}
						>
							<Text style={styles.buttonText}>✕ Close</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.flipButton}
							onPress={toggleCameraFacing}
							disabled={isCapturing}
						>
							<Text style={styles.buttonText}>🔄 Flip</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.captureButtonContainer}>
						<TouchableOpacity
							style={[
								styles.captureButton,
								isCapturing && styles.captureButtonDisabled,
							]}
							onPress={takePicture}
							disabled={isCapturing}
						>
							{isCapturing ? (
								<ActivityIndicator size="large" color="white" />
							) : (
								<View style={styles.captureButtonInner} />
							)}
						</TouchableOpacity>
					</View>
				</CameraView>
			</View>
		);
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

	// Check if quiz is pending and block scanning
	const quizPending = isQuizPending(user);
	const batchProgress = getQuizBatchProgress(user);

	if (quizPending) {
		return (
			<ThemedView style={styles.container}>
				<ThemedText type="title" style={styles.title}>
					🌿 Plant Scanner
				</ThemedText>

				<View style={styles.blockedContainer}>
					<Text style={styles.blockedIcon}>🔒</Text>
					<ThemedText style={styles.blockedTitle}>
						Scanning Temporarily Locked
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
				🌿 Plant Scanner
			</ThemedText>
			<ThemedText style={styles.subtitle}>
				Take a picture of a plant to identify it
			</ThemedText>

			{photo ? (
				<View style={styles.previewContainer}>
					<ThemedText style={styles.previewTitle}>📸 Photo Preview</ThemedText>
					<View style={styles.imageContainer}>
						{photo && (
							<Image
								source={{ uri: photo }}
								style={styles.preview}
								resizeMode="cover"
								onError={(error) => {
									console.error("Image load error:", error.nativeEvent);
									Alert.alert(
										"Error",
										`Failed to load image: ${JSON.stringify(error.nativeEvent)}`
									);
								}}
								onLoad={() => console.log("✅ Image loaded successfully")}
								onLoadStart={() => console.log("⏳ Image loading started...")}
								onLoadEnd={() => console.log("🏁 Image loading ended")}
							/>
						)}
					</View>
					<ThemedText style={styles.uriDebug}>URI: {photo}</ThemedText>
					<View style={styles.photoActions}>
						<TouchableOpacity style={styles.button} onPress={retakePicture}>
							<Text style={styles.buttonText}>📸 Retake</Text>
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
				<TouchableOpacity style={styles.openCameraButton} onPress={openCamera}>
					<Text style={styles.openCameraText}>📷</Text>
					<Text style={styles.buttonText}>Open Camera</Text>
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
	cameraContainer: {
		flex: 1,
		justifyContent: "center",
	},
	message: {
		textAlign: "center",
		paddingBottom: 10,
		fontSize: 16,
	},
	camera: {
		flex: 1,
	},
	cameraButtonContainer: {
		flexDirection: "row",
		backgroundColor: "transparent",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingTop: 50,
	},
	closeButton: {
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		padding: 15,
		borderRadius: 10,
	},
	flipButton: {
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		padding: 15,
		borderRadius: 10,
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
	captureButtonContainer: {
		position: "absolute",
		bottom: 40,
		alignSelf: "center",
	},
	captureButton: {
		width: 80,
		height: 80,
		borderRadius: 40,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		justifyContent: "center",
		alignItems: "center",
		borderWidth: 4,
		borderColor: "white",
	},
	captureButtonDisabled: {
		opacity: 0.6,
	},
	captureButtonInner: {
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: "white",
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
	openCameraButton: {
		backgroundColor: "#34C759",
		padding: 30,
		borderRadius: 20,
		alignItems: "center",
		minWidth: 200,
	},
	openCameraText: {
		fontSize: 50,
		marginBottom: 10,
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
		borderColor: "#34C759",
	},
	preview: {
		width: "100%",
		height: "100%",
	},
	photoActions: {
		flexDirection: "row",
		gap: 15,
	},
	analyzeButton: {
		backgroundColor: "#5856D6",
	},
	uriDebug: {
		fontSize: 10,
		marginBottom: 10,
		opacity: 0.5,
		textAlign: "center",
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
