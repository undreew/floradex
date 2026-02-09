import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { PlantIdResponse } from "@/services/plantId";
import {
	ActivityIndicator,
	Image,
	Linking,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

interface PlantResultProps {
	result: PlantIdResponse | null;
	isLoading: boolean;
	error: string | null;
	onClose: () => void;
}

export function PlantResult({
	result,
	isLoading,
	error,
	onClose,
}: PlantResultProps) {
	if (isLoading) {
		return (
			<ThemedView style={styles.container}>
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#34C759" />
					<ThemedText style={styles.loadingText}>
						🔍 Analyzing plant...
					</ThemedText>
					<ThemedText style={styles.loadingSubtext}>
						This may take a few seconds
					</ThemedText>
				</View>
			</ThemedView>
		);
	}

	if (error) {
		return (
			<ThemedView style={styles.container}>
				<View style={styles.errorContainer}>
					<ThemedText style={styles.errorIcon}>⚠️</ThemedText>
					<ThemedText style={styles.errorTitle}>Analysis Failed</ThemedText>
					<ThemedText style={styles.errorText}>{error}</ThemedText>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<ThemedText style={styles.buttonText}>Close</ThemedText>
					</TouchableOpacity>
				</View>
			</ThemedView>
		);
	}

	if (!result) {
		return null;
	}

	const topSuggestion = result.result.classification.suggestions[0];
	const isPlant = result.result.is_plant.binary;
	const plantProbability = result.result.is_plant.probability;

	if (!isPlant) {
		return (
			<ThemedView style={styles.container}>
				<ScrollView style={styles.scrollView}>
					<View style={styles.notPlantContainer}>
						<ThemedText style={styles.notPlantIcon}>🤔</ThemedText>
						<ThemedText style={styles.notPlantTitle}>
							Not a Plant Detected
						</ThemedText>
						<ThemedText style={styles.notPlantText}>
							The image doesn't appear to contain a plant.
						</ThemedText>
						<ThemedText style={styles.confidenceText}>
							Confidence: {(plantProbability * 100).toFixed(1)}%
						</ThemedText>
						<TouchableOpacity style={styles.retryButton} onPress={onClose}>
							<ThemedText style={styles.buttonText}>Try Again</ThemedText>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ScrollView style={styles.scrollView}>
				<View style={styles.resultContainer}>
					<ThemedText style={styles.resultTitle}>
						✨ Plant Identified!
					</ThemedText>

					{/* Top Suggestion */}
					<View style={styles.topSuggestionCard}>
						<ThemedText style={styles.plantName}>
							{topSuggestion.name}
						</ThemedText>
						<View style={styles.confidenceBar}>
							<View
								style={[
									styles.confidenceFill,
									{ width: `${topSuggestion.probability * 100}%` },
								]}
							/>
						</View>
						<ThemedText style={styles.confidenceText}>
							{(topSuggestion.probability * 100).toFixed(1)}% match
						</ThemedText>

						{/* Common Names */}
						{topSuggestion.details?.common_names &&
							topSuggestion.details.common_names.length > 0 && (
								<View style={styles.section}>
									<ThemedText style={styles.sectionTitle}>
										Common Names
									</ThemedText>
									<ThemedText style={styles.commonNames}>
										{topSuggestion.details.common_names.slice(0, 3).join(", ")}
									</ThemedText>
								</View>
							)}

						{/* Description */}
						{topSuggestion.details?.description && (
							<View style={styles.section}>
								<ThemedText style={styles.sectionTitle}>Description</ThemedText>
								<ThemedText style={styles.description}>
									{topSuggestion.details.description.value}
								</ThemedText>
							</View>
						)}

						{/* Taxonomy */}
						{topSuggestion.details?.taxonomy && (
							<View style={styles.section}>
								<ThemedText style={styles.sectionTitle}>Taxonomy</ThemedText>
								<View style={styles.taxonomyGrid}>
									{topSuggestion.details.taxonomy.family && (
										<View style={styles.taxonomyItem}>
											<ThemedText style={styles.taxonomyLabel}>
												Family:
											</ThemedText>
											<ThemedText style={styles.taxonomyValue}>
												{topSuggestion.details.taxonomy.family}
											</ThemedText>
										</View>
									)}
									{topSuggestion.details.taxonomy.genus && (
										<View style={styles.taxonomyItem}>
											<ThemedText style={styles.taxonomyLabel}>
												Genus:
											</ThemedText>
											<ThemedText style={styles.taxonomyValue}>
												{topSuggestion.details.taxonomy.genus}
											</ThemedText>
										</View>
									)}
								</View>
							</View>
						)}

						{/* Similar Images */}
						{topSuggestion.similar_images &&
							topSuggestion.similar_images.length > 0 && (
								<View style={styles.section}>
									<ThemedText style={styles.sectionTitle}>
										Similar Images
									</ThemedText>
									<ScrollView
										horizontal
										showsHorizontalScrollIndicator={false}
										style={styles.similarImagesScroll}
									>
										{topSuggestion.similar_images.slice(0, 5).map((img) => (
											<Image
												key={img.id}
												source={{ uri: img.url }}
												style={styles.similarImage}
											/>
										))}
									</ScrollView>
								</View>
							)}

						{/* Learn More Link */}
						{topSuggestion.details?.url && (
							<TouchableOpacity
								style={styles.learnMoreButton}
								onPress={() => Linking.openURL(topSuggestion.details!.url!)}
							>
								<ThemedText style={styles.learnMoreText}>
									📖 Learn More
								</ThemedText>
							</TouchableOpacity>
						)}
					</View>

					{/* Other Suggestions */}
					{result.result.classification.suggestions.length > 1 && (
						<View style={styles.otherSuggestionsContainer}>
							<ThemedText style={styles.otherSuggestionsTitle}>
								Other Possibilities
							</ThemedText>
							{result.result.classification.suggestions
								.slice(1, 4)
								.map((suggestion) => (
									<View key={suggestion.id} style={styles.suggestionItem}>
										<ThemedText style={styles.suggestionName}>
											{suggestion.name}
										</ThemedText>
										<ThemedText style={styles.suggestionProbability}>
											{(suggestion.probability * 100).toFixed(1)}%
										</ThemedText>
									</View>
								))}
						</View>
					)}

					{/* Health Information */}
					{result.result.is_healthy && (
						<View style={styles.healthContainer}>
							<ThemedText style={styles.healthTitle}>
								{result.result.is_healthy.binary
									? "🌿 Healthy"
									: "⚠️ Health Issue Detected"}
							</ThemedText>
							{!result.result.is_healthy.binary &&
								result.result.disease?.suggestions[0] && (
									<View style={styles.diseaseInfo}>
										<ThemedText style={styles.diseaseName}>
											{result.result.disease.suggestions[0].name}
										</ThemedText>
										<ThemedText style={styles.diseaseProb}>
											{(
												result.result.disease.suggestions[0].probability * 100
											).toFixed(1)}
											% probability
										</ThemedText>
									</View>
								)}
						</View>
					)}

					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<ThemedText style={styles.buttonText}>Close</ThemedText>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
	},
	loadingText: {
		fontSize: 20,
		fontWeight: "600",
		marginTop: 20,
	},
	loadingSubtext: {
		fontSize: 14,
		marginTop: 10,
		opacity: 0.6,
	},
	errorContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
	},
	errorIcon: {
		fontSize: 60,
		marginBottom: 20,
	},
	errorTitle: {
		fontSize: 22,
		fontWeight: "bold",
		marginBottom: 10,
	},
	errorText: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 30,
		opacity: 0.7,
	},
	notPlantContainer: {
		alignItems: "center",
		padding: 40,
	},
	notPlantIcon: {
		fontSize: 80,
		marginBottom: 20,
	},
	notPlantTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
	},
	notPlantText: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 20,
		opacity: 0.7,
	},
	resultContainer: {
		padding: 20,
	},
	resultTitle: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 20,
	},
	topSuggestionCard: {
		backgroundColor: "rgba(52, 199, 89, 0.1)",
		borderRadius: 15,
		padding: 20,
		marginBottom: 20,
	},
	plantName: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 10,
		fontStyle: "italic",
	},
	confidenceBar: {
		height: 8,
		backgroundColor: "rgba(0, 0, 0, 0.1)",
		borderRadius: 4,
		overflow: "hidden",
		marginBottom: 5,
	},
	confidenceFill: {
		height: "100%",
		backgroundColor: "#34C759",
	},
	confidenceText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#34C759",
		marginBottom: 15,
	},
	section: {
		marginTop: 15,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 8,
	},
	commonNames: {
		fontSize: 15,
		lineHeight: 22,
	},
	description: {
		fontSize: 14,
		lineHeight: 20,
		opacity: 0.8,
	},
	taxonomyGrid: {
		gap: 10,
	},
	taxonomyItem: {
		flexDirection: "row",
		gap: 8,
	},
	taxonomyLabel: {
		fontSize: 14,
		fontWeight: "600",
	},
	taxonomyValue: {
		fontSize: 14,
		opacity: 0.8,
	},
	similarImagesScroll: {
		marginTop: 10,
	},
	similarImage: {
		width: 100,
		height: 100,
		borderRadius: 10,
		marginRight: 10,
	},
	learnMoreButton: {
		backgroundColor: "#007AFF",
		padding: 12,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 15,
	},
	learnMoreText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	otherSuggestionsContainer: {
		marginBottom: 20,
	},
	otherSuggestionsTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	suggestionItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 12,
		backgroundColor: "rgba(0, 0, 0, 0.05)",
		borderRadius: 10,
		marginBottom: 8,
	},
	suggestionName: {
		fontSize: 15,
		fontWeight: "500",
		flex: 1,
	},
	suggestionProbability: {
		fontSize: 14,
		fontWeight: "600",
		color: "#34C759",
	},
	healthContainer: {
		backgroundColor: "rgba(52, 199, 89, 0.1)",
		borderRadius: 15,
		padding: 20,
		marginBottom: 20,
	},
	healthTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
	diseaseInfo: {
		marginTop: 10,
	},
	diseaseName: {
		fontSize: 16,
		fontWeight: "600",
	},
	diseaseProb: {
		fontSize: 14,
		opacity: 0.7,
		marginTop: 5,
	},
	closeButton: {
		backgroundColor: "#007AFF",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 20,
	},
	retryButton: {
		backgroundColor: "#34C759",
		padding: 15,
		borderRadius: 10,
		alignItems: "center",
		marginTop: 20,
		minWidth: 150,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
});
