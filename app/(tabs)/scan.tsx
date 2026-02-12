import { PlantResult } from "@/components/plant-result";
import { identifyPlantSimple, type PlantIdResponse } from "@/services/plantId";
import {
	getQuizBatchProgress,
	isQuizPending,
	trackSuccessfulScan,
} from "@/services/scanTracker";
import { useUser } from "@clerk/clerk-expo";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
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
			<LinearGradient
				colors={["#10b981", "#059669"]}
				style={styles.container}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<ActivityIndicator size="large" color="#fff" />
				<Text style={styles.loadingText}>Loading...</Text>
			</LinearGradient>
		);
	}

	if (!permission.granted) {
		// Camera permissions are not granted yet
		return (
			<LinearGradient
				colors={["#10b981", "#059669"]}
				style={styles.container}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<View style={styles.permissionCard}>
					<Text style={styles.permissionIcon}>📷</Text>
					<Text style={styles.permissionTitle}>Camera Access Required</Text>
					<Text style={styles.permissionMessage}>
						We need your permission to use the camera to scan and identify
						plants
					</Text>
					<TouchableOpacity
						style={styles.permissionButton}
						onPress={requestPermission}
					>
						<Text style={styles.permissionButtonText}>Grant Permission</Text>
					</TouchableOpacity>
				</View>
			</LinearGradient>
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
			console.log("[Scan] Starting plant analysis...");
			const result = await identifyPlantSimple(photo);

			console.log("[Scan] ========== FULL API RESPONSE ==========");
			console.log(JSON.stringify(result, null, 2));
			console.log("[Scan] ========================================");

			setAnalysisResult(result);

			// Track successful scan if a plant was identified
			if (result?.result?.is_plant?.binary) {
				const topSuggestion = result.result.classification.suggestions[0];

				console.log("[Scan] Top suggestion:", topSuggestion?.name);
				console.log(
					"[Scan] Common names:",
					topSuggestion?.details?.common_names
				);
				console.log("[Scan] Taxonomy:", topSuggestion?.details?.taxonomy);
				console.log("[Scan] Has details?", !!topSuggestion?.details);
				console.log(
					"[Scan] Details keys:",
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

				console.log("[Scan] Data being saved:", plantData);
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
			<LinearGradient
				colors={["#10b981", "#059669"]}
				style={styles.container}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
			>
				<Text style={styles.headerTitle}>🌿 Plant Scanner</Text>

				<View style={styles.blockedContainer}>
					<Text style={styles.blockedIcon}>🔒</Text>
					<Text style={styles.blockedTitle}>Scanning Temporarily Locked</Text>
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
			</LinearGradient>
		);
	}

	return (
		<LinearGradient
			colors={["#10b981", "#059669"]}
			style={styles.container}
			start={{ x: 0, y: 0 }}
			end={{ x: 1, y: 1 }}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				<Text style={styles.headerTitle}>🌿 Plant Scanner</Text>
				<Text style={styles.headerSubtitle}>
					Take a picture of a plant to identify it
				</Text>

				{photo ? (
					<View style={styles.previewCard}>
						<Text style={styles.previewTitle}>📸 Photo Preview</Text>
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
						<View style={styles.photoActions}>
							<TouchableOpacity
								style={styles.actionButton}
								onPress={retakePicture}
							>
								<Text style={styles.actionButtonIcon}>📸</Text>
								<Text style={styles.actionButtonText}>Retake</Text>
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
						<View style={styles.cameraIconContainer}>
							<Text style={styles.cameraIcon}>📷</Text>
						</View>
						<Text style={styles.actionCardTitle}>Ready to Scan</Text>
						<Text style={styles.actionCardSubtitle}>
							Capture a clear photo of the plant
						</Text>
						<TouchableOpacity
							style={styles.openCameraButton}
							onPress={openCamera}
						>
							<Text style={styles.openCameraButtonText}>Open Camera</Text>
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
	scrollContent: {
		padding: 20,
		paddingTop: 60,
		alignItems: "center",
	},
	loadingText: {
		color: "#fff",
		fontSize: 16,
		marginTop: 12,
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
	cameraContainer: {
		flex: 1,
		justifyContent: "center",
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
	cameraIconContainer: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#f0fdf4",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 24,
	},
	cameraIcon: {
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
	openCameraButton: {
		backgroundColor: "#10b981",
		paddingVertical: 16,
		paddingHorizontal: 48,
		borderRadius: 14,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	openCameraButtonText: {
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
		backgroundColor: "#10b981",
	},
	permissionCard: {
		backgroundColor: "#ffffff",
		borderRadius: 24,
		padding: 40,
		alignItems: "center",
		marginHorizontal: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 8 },
		shadowOpacity: 0.3,
		shadowRadius: 20,
		elevation: 15,
	},
	permissionIcon: {
		fontSize: 60,
		marginBottom: 20,
	},
	permissionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 12,
		textAlign: "center",
	},
	permissionMessage: {
		fontSize: 15,
		color: "#6b7280",
		textAlign: "center",
		marginBottom: 30,
		lineHeight: 22,
	},
	permissionButton: {
		backgroundColor: "#10b981",
		paddingVertical: 16,
		paddingHorizontal: 32,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 5,
	},
	permissionButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "600",
	},
	blockedContainer: {
		alignItems: "center",
		padding: 32,
		borderRadius: 24,
		backgroundColor: "#ffffff",
		width: "100%",
		marginHorizontal: 20,
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
		backgroundColor: "#f0fdf4",
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#10b981",
	},
	blockedHintText: {
		fontSize: 15,
		color: "#059669",
		fontWeight: "600",
		textAlign: "center",
	},
});
