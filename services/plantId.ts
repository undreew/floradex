import * as FileSystem from "expo-file-system/legacy";

const PLANT_ID_API_URL = "https://plant.id/api/v3/identification";
const API_KEY = process.env.EXPO_PUBLIC_PLANT_ID_KEY;

export interface PlantSuggestion {
	id: string;
	name: string;
	probability: number;
	similar_images?: SimilarImage[];
	details?: PlantDetails;
}

export interface SimilarImage {
	id: string;
	url: string;
	license_name?: string;
	license_url?: string;
	citation?: string;
}

export interface PlantDetails {
	common_names?: string[];
	taxonomy?: {
		class?: string;
		genus?: string;
		order?: string;
		family?: string;
		phylum?: string;
		kingdom?: string;
	};
	url?: string;
	description?: {
		value: string;
		citation?: string;
		license_name?: string;
		license_url?: string;
	};
	synonyms?: string[];
	image?: {
		value: string;
		citation?: string;
		license_name?: string;
		license_url?: string;
	};
	edible_parts?: string[];
	watering?: {
		min: number;
		max: number;
	};
	propagation_methods?: string[];
}

export interface HealthSuggestion {
	id: string;
	name: string;
	probability: number;
	similar_images?: SimilarImage[];
	details?: {
		local_name?: string;
		description?: string;
		url?: string;
		treatment?: {
			biological?: string[];
			chemical?: string[];
			prevention?: string[];
		};
		classification?: string[];
		common_names?: string[];
	};
}

export interface PlantIdResponse {
	access_token: string;
	model_version: string;
	custom_id?: number;
	input: {
		latitude?: number;
		longitude?: number;
		similar_images: boolean;
		datetime?: string;
		health?: string;
	};
	result: {
		is_plant: {
			binary: boolean;
			probability: number;
		};
		classification: {
			suggestions: PlantSuggestion[];
		};
		is_healthy?: {
			binary: boolean;
			probability: number;
		};
		disease?: {
			suggestions: HealthSuggestion[];
		};
	};
	status: string;
	sla_compliant_client: boolean;
	sla_compliant_system: boolean;
	created: number;
	completed: number;
}

interface IdentifyPlantOptions {
	imageUri: string;
	latitude?: number;
	longitude?: number;
	similarImages?: boolean;
	includeHealth?: boolean;
	language?: string;
	details?: string[];
}

/**
 * Convert image URI to base64 string
 */
async function imageToBase64(uri: string): Promise<string> {
	try {
		const base64 = await FileSystem.readAsStringAsync(uri, {
			encoding: FileSystem.EncodingType.Base64,
		});
		return base64;
	} catch (error) {
		console.error("Error converting image to base64:", error);
		throw new Error("Failed to convert image to base64");
	}
}

/**
 * Identify a plant from an image
 */
export async function identifyPlant(
	options: IdentifyPlantOptions
): Promise<PlantIdResponse> {
	if (!API_KEY) {
		throw new Error(
			"Plant.id API key is not configured. Please add EXPO_PUBLIC_PLANT_ID_API_KEY to your .env file"
		);
	}

	try {
		// Convert image to base64
		const base64Image = await imageToBase64(options.imageUri);

		// Prepare request body
		const requestBody: any = {
			images: [`data:image/jpeg;base64,${base64Image}`],
			similar_images: options.similarImages ?? false,
		};

		// Add optional parameters
		if (options.latitude !== undefined && options.longitude !== undefined) {
			requestBody.latitude = options.latitude;
			requestBody.longitude = options.longitude;
		}

		if (options.includeHealth) {
			requestBody.health = "all";
		}

		// Build URL with query parameters for details and language
		let url = PLANT_ID_API_URL;
		const params = new URLSearchParams();

		if (options.details && options.details.length > 0) {
			options.details.forEach((detail) => params.append("details", detail));
		}

		if (options.language) {
			params.append("language", options.language);
		}

		if (params.toString()) {
			url += `?${params.toString()}`;
		}

		console.log("Sending identification request to Plant.id...");

		const response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Api-Key": API_KEY,
			},
			body: JSON.stringify(requestBody),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error("Plant.id API error:", errorText);
			throw new Error(`Plant.id API error: ${response.status} - ${errorText}`);
		}

		const data: PlantIdResponse = await response.json();
		console.log("Plant identification successful!");
		return data;
	} catch (error) {
		console.error("Error identifying plant:", error);
		throw error;
	}
}

/**
 * Simple plant identification with common details
 */
export async function identifyPlantSimple(
	imageUri: string,
	includeLocation?: { latitude: number; longitude: number }
): Promise<PlantIdResponse> {
	return identifyPlant({
		imageUri,
		latitude: includeLocation?.latitude,
		longitude: includeLocation?.longitude,
		similarImages: true,
		details: ["common_names", "taxonomy", "url", "description", "image"],
		language: "en",
	});
}

/**
 * Plant identification with health assessment
 */
export async function identifyPlantWithHealth(
	imageUri: string,
	includeLocation?: { latitude: number; longitude: number }
): Promise<PlantIdResponse> {
	return identifyPlant({
		imageUri,
		latitude: includeLocation?.latitude,
		longitude: includeLocation?.longitude,
		similarImages: true,
		includeHealth: true,
		details: [
			"common_names",
			"taxonomy",
			"url",
			"description",
			"image",
			"treatment",
		],
		language: "en",
	});
}

/**
 * Get identification result by access token
 */
export async function getIdentificationResult(
	accessToken: string
): Promise<PlantIdResponse> {
	if (!API_KEY) {
		throw new Error("Plant.id API key is not configured");
	}

	try {
		const response = await fetch(
			`https://plant.id/api/v3/identification/${accessToken}?details=common_names,taxonomy,url,description,image`,
			{
				method: "GET",
				headers: {
					"Api-Key": API_KEY,
				},
			}
		);

		if (!response.ok) {
			throw new Error(
				`Failed to get identification result: ${response.status}`
			);
		}

		return await response.json();
	} catch (error) {
		console.error("Error getting identification result:", error);
		throw error;
	}
}
