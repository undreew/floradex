import type { TreflePlantDetails } from "@/services/trefleApi";
import React from "react";
import {
	ActivityIndicator,
	Image,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface PlantDetailsModalProps {
	visible: boolean;
	onClose: () => void;
	plantData: TreflePlantDetails | null;
	loading?: boolean;
	error?: string | null;
}

export const PlantDetailsModal: React.FC<PlantDetailsModalProps> = ({
	visible,
	onClose,
	plantData,
	loading = false,
	error = null,
}) => {
	if (!visible) return null;

	const renderContent = () => {
		if (loading) {
			return (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color="#f59e0b" />
					<Text style={styles.loadingText}>Loading plant details...</Text>
				</View>
			);
		}

		if (error) {
			return (
				<View style={styles.centerContainer}>
					<Text style={styles.errorIcon}>⚠️</Text>
					<Text style={styles.errorText}>{error}</Text>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Text style={styles.closeButtonText}>Close</Text>
					</TouchableOpacity>
				</View>
			);
		}

		if (!plantData) {
			return (
				<View style={styles.centerContainer}>
					<Text style={styles.errorIcon}>🔍</Text>
					<Text style={styles.errorText}>No plant data available</Text>
					<TouchableOpacity style={styles.closeButton} onPress={onClose}>
						<Text style={styles.closeButtonText}>Close</Text>
					</TouchableOpacity>
				</View>
			);
		}

		const mainSpecies = plantData.main_species;

		return (
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}
			>
				{/* Header with image */}
				{plantData.image_url && (
					<Image
						source={{ uri: plantData.image_url }}
						style={styles.headerImage}
						resizeMode="cover"
					/>
				)}

				{/* Basic Information */}
				<View style={styles.section}>
					<Text style={styles.scientificName}>{plantData.scientific_name}</Text>
					{plantData.common_name && (
						<Text style={styles.commonName}>{plantData.common_name}</Text>
					)}
					{plantData.author && (
						<Text style={styles.author}>Author: {plantData.author}</Text>
					)}
					{plantData.year && (
						<Text style={styles.year}>Year: {plantData.year}</Text>
					)}
				</View>

				{/* Taxonomy */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>🌿 Taxonomy</Text>
					<View style={styles.infoGrid}>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Family:</Text>
							<Text style={styles.infoValue}>
								{plantData.family || "Unknown"}
							</Text>
						</View>
						{plantData.family_common_name && (
							<View style={styles.infoItem}>
								<Text style={styles.infoLabel}>Family Common:</Text>
								<Text style={styles.infoValue}>
									{plantData.family_common_name}
								</Text>
							</View>
						)}
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Genus:</Text>
							<Text style={styles.infoValue}>
								{plantData.genus || "Unknown"}
							</Text>
						</View>
						<View style={styles.infoItem}>
							<Text style={styles.infoLabel}>Rank:</Text>
							<Text style={styles.infoValue}>
								{plantData.rank || "Unknown"}
							</Text>
						</View>
					</View>
				</View>

				{/* Synonyms */}
				{plantData.synonyms && plantData.synonyms.length > 0 && (
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>📝 Synonyms</Text>
						<Text style={styles.listText}>{plantData.synonyms.join(", ")}</Text>
					</View>
				)}

				{/* Main Species Info - if available */}
				{mainSpecies && (
					<>
						{/* Edibility */}
						<View style={styles.section}>
							<Text style={styles.sectionTitle}>🍴 Edibility</Text>
							<View style={styles.infoGrid}>
								<View style={styles.infoItem}>
									<Text style={styles.infoLabel}>Edible:</Text>
									<Text style={styles.infoValue}>
										{mainSpecies.edible ? "Yes ✓" : "No ✗"}
									</Text>
								</View>
								{mainSpecies.edible_part &&
									mainSpecies.edible_part.length > 0 && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Edible Parts:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.edible_part.join(", ")}
											</Text>
										</View>
									)}
								{mainSpecies.vegetable && (
									<View style={styles.infoItem}>
										<Text style={styles.infoLabel}>Type:</Text>
										<Text style={styles.infoValue}>Vegetable</Text>
									</View>
								)}
							</View>
						</View>

						{/* Physical Characteristics */}
						{mainSpecies.specifications && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>📏 Specifications</Text>
								<View style={styles.infoGrid}>
									{mainSpecies.specifications.growth_habit && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Growth Habit:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.specifications.growth_habit}
											</Text>
										</View>
									)}
									{mainSpecies.specifications.growth_rate && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Growth Rate:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.specifications.growth_rate}
											</Text>
										</View>
									)}
									{mainSpecies.specifications.average_height?.cm && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Average Height:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.specifications.average_height.cm} cm
											</Text>
										</View>
									)}
									{mainSpecies.specifications.maximum_height?.cm && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Max Height:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.specifications.maximum_height.cm} cm
											</Text>
										</View>
									)}
									{mainSpecies.specifications.toxicity && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Toxicity:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.specifications.toxicity}
											</Text>
										</View>
									)}
								</View>
							</View>
						)}

						{/* Flower Information */}
						{mainSpecies.flower && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>🌸 Flower</Text>
								<View style={styles.infoGrid}>
									{mainSpecies.flower.color &&
										mainSpecies.flower.color.length > 0 && (
											<View style={styles.infoItem}>
												<Text style={styles.infoLabel}>Color:</Text>
												<Text style={styles.infoValue}>
													{mainSpecies.flower.color.join(", ")}
												</Text>
											</View>
										)}
									<View style={styles.infoItem}>
										<Text style={styles.infoLabel}>Conspicuous:</Text>
										<Text style={styles.infoValue}>
											{mainSpecies.flower.conspicuous ? "Yes" : "No"}
										</Text>
									</View>
								</View>
							</View>
						)}

						{/* Foliage Information */}
						{mainSpecies.foliage && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>🍃 Foliage</Text>
								<View style={styles.infoGrid}>
									{mainSpecies.foliage.color &&
										mainSpecies.foliage.color.length > 0 && (
											<View style={styles.infoItem}>
												<Text style={styles.infoLabel}>Color:</Text>
												<Text style={styles.infoValue}>
													{mainSpecies.foliage.color.join(", ")}
												</Text>
											</View>
										)}
									{mainSpecies.foliage.texture && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Texture:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.foliage.texture}
											</Text>
										</View>
									)}
								</View>
							</View>
						)}

						{/* Growth Conditions */}
						{mainSpecies.growth && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>🌱 Growth Conditions</Text>
								<View style={styles.infoGrid}>
									{mainSpecies.growth.ph_minimum !== null &&
										mainSpecies.growth.ph_maximum !== null && (
											<View style={styles.infoItem}>
												<Text style={styles.infoLabel}>pH Range:</Text>
												<Text style={styles.infoValue}>
													{mainSpecies.growth.ph_minimum} -{" "}
													{mainSpecies.growth.ph_maximum}
												</Text>
											</View>
										)}
									{mainSpecies.growth.light !== null && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Light:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.growth.light}/10
											</Text>
										</View>
									)}
									{mainSpecies.growth.atmospheric_humidity !== null && (
										<View style={styles.infoItem}>
											<Text style={styles.infoLabel}>Humidity:</Text>
											<Text style={styles.infoValue}>
												{mainSpecies.growth.atmospheric_humidity}/10
											</Text>
										</View>
									)}
									{mainSpecies.growth.minimum_temperature?.deg_c !== null &&
										mainSpecies.growth.minimum_temperature?.deg_c !==
											undefined && (
											<View style={styles.infoItem}>
												<Text style={styles.infoLabel}>Min Temperature:</Text>
												<Text style={styles.infoValue}>
													{mainSpecies.growth.minimum_temperature?.deg_c}°C
												</Text>
											</View>
										)}
									{mainSpecies.growth.maximum_temperature?.deg_c !== null &&
										mainSpecies.growth.maximum_temperature?.deg_c !==
											undefined && (
											<View style={styles.infoItem}>
												<Text style={styles.infoLabel}>Max Temperature:</Text>
												<Text style={styles.infoValue}>
													{mainSpecies.growth.maximum_temperature?.deg_c}°C
												</Text>
											</View>
										)}
								</View>
							</View>
						)}

						{/* Duration */}
						{mainSpecies.duration && mainSpecies.duration.length > 0 && (
							<View style={styles.section}>
								<Text style={styles.sectionTitle}>⏱️ Duration</Text>
								<Text style={styles.listText}>
									{mainSpecies.duration.join(", ")}
								</Text>
							</View>
						)}
					</>
				)}

				{/* Close Button */}
				<TouchableOpacity style={styles.closeButton} onPress={onClose}>
					<Text style={styles.closeButtonText}>Close</Text>
				</TouchableOpacity>
			</ScrollView>
		);
	};

	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent={false}
			onRequestClose={onClose}
		>
			<View style={styles.modalContainer}>
				<View style={styles.header}>
					<Text style={styles.headerTitle}>Plant Details</Text>
					<TouchableOpacity style={styles.headerCloseButton} onPress={onClose}>
						<Text style={styles.headerCloseButtonText}>✕</Text>
					</TouchableOpacity>
				</View>
				{renderContent()}
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: "#fff",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: "#f59e0b",
		borderBottomWidth: 1,
		borderBottomColor: "#d97706",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
		color: "#fff",
	},
	headerCloseButton: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		justifyContent: "center",
		alignItems: "center",
	},
	headerCloseButtonText: {
		fontSize: 20,
		color: "#fff",
		fontWeight: "bold",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 40,
	},
	centerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	loadingText: {
		marginTop: 16,
		fontSize: 16,
		color: "#6b7280",
	},
	errorIcon: {
		fontSize: 64,
		marginBottom: 16,
	},
	errorText: {
		fontSize: 16,
		color: "#6b7280",
		textAlign: "center",
		marginBottom: 24,
	},
	headerImage: {
		width: "100%",
		height: 250,
		backgroundColor: "#f3f4f6",
	},
	section: {
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
	},
	scientificName: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#1f2937",
		fontStyle: "italic",
		marginBottom: 8,
	},
	commonName: {
		fontSize: 18,
		color: "#4b5563",
		marginBottom: 8,
	},
	author: {
		fontSize: 14,
		color: "#6b7280",
		marginBottom: 4,
	},
	year: {
		fontSize: 14,
		color: "#6b7280",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#1f2937",
		marginBottom: 12,
	},
	infoGrid: {
		gap: 12,
	},
	infoItem: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	infoLabel: {
		fontSize: 14,
		fontWeight: "600",
		color: "#6b7280",
		width: 140,
	},
	infoValue: {
		fontSize: 14,
		color: "#1f2937",
		flex: 1,
	},
	listText: {
		fontSize: 14,
		color: "#1f2937",
		lineHeight: 20,
	},
	closeButton: {
		backgroundColor: "#f59e0b",
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		marginHorizontal: 20,
		marginTop: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	closeButtonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
	},
});
