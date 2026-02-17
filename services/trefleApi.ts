const TREFLE_API_BASE_URL = "https://trefle.io/api/v1";
const TREFLE_TOKEN = process.env.EXPO_PUBLIC_TREFLE_TOKEN;

export interface TreflePlant {
	id: number;
	common_name: string | null;
	slug: string;
	scientific_name: string;
	year: number | null;
	bibliography: string | null;
	author: string | null;
	status: string;
	rank: string;
	family_common_name: string | null;
	genus_id: number;
	image_url: string | null;
	synonyms: string[];
	genus: string;
	family: string;
	links: {
		self: string;
		plant: string;
		genus: string;
	};
}

export interface TreflePlantDetails {
	id: number;
	common_name: string | null;
	slug: string;
	scientific_name: string;
	year: number | null;
	bibliography: string | null;
	author: string | null;
	status: string;
	rank: string;
	family_common_name: string | null;
	genus: string;
	family: string;
	image_url: string | null;
	synonyms: string[];
	main_species?: {
		id: number;
		common_name: string | null;
		slug: string;
		scientific_name: string;
		year: number | null;
		bibliography: string | null;
		author: string | null;
		status: string;
		rank: string;
		family_common_name: string | null;
		genus_id: number;
		image_url: string | null;
		vegetable: boolean;
		observations: string | null;
		duration: string[] | null;
		edible_part: string[] | null;
		edible: boolean;
		flower: {
			color: string[] | null;
			conspicuous: boolean;
		} | null;
		foliage: {
			texture: string | null;
			color: string[] | null;
			leaf_retention: boolean;
		} | null;
		fruit_or_seed: {
			conspicuous: boolean;
			color: string[] | null;
			shape: string | null;
			seed_persistence: boolean;
		} | null;
		specifications: {
			ligneous_type: string | null;
			growth_form: string | null;
			growth_habit: string | null;
			growth_rate: string | null;
			average_height: {
				cm: number | null;
			} | null;
			maximum_height: {
				cm: number | null;
			} | null;
			nitrogen_fixation: string | null;
			shape_and_orientation: string | null;
			toxicity: string | null;
		} | null;
		growth: {
			description: string | null;
			sowing: string | null;
			days_to_harvest: number | null;
			row_spacing: {
				cm: number | null;
			} | null;
			spread: {
				cm: number | null;
			} | null;
			ph_maximum: number | null;
			ph_minimum: number | null;
			light: number | null;
			atmospheric_humidity: number | null;
			minimum_precipitation: {
				mm: number | null;
			} | null;
			maximum_precipitation: {
				mm: number | null;
			} | null;
			minimum_root_depth: {
				cm: number | null;
			} | null;
			minimum_temperature: {
				deg_c: number | null;
			} | null;
			maximum_temperature: {
				deg_c: number | null;
			} | null;
			soil_nutriments: number | null;
			soil_salinity: number | null;
			soil_texture: number | null;
			soil_humidity: number | null;
		} | null;
	};
}

export interface TrefleSearchResponse {
	data: TreflePlant[];
	links: {
		self: string;
		first: string;
		last: string;
		next?: string;
	};
	meta: {
		total: number;
	};
}

export interface TrefleError {
	error: string;
	message?: string;
}

/**
 * Search for plants by name using the Trefle API
 * @param query - The plant name to search for (scientific or common name)
 * @returns Search results with plant data
 */
export async function searchPlants(
	query: string
): Promise<TreflePlant[] | null> {
	if (!TREFLE_TOKEN) {
		console.error("Trefle API token not configured");
		return null;
	}

	if (!query || query.trim().length === 0) {
		console.error("Search query cannot be empty");
		return null;
	}

	try {
		const encodedQuery = encodeURIComponent(query.trim());
		const url = `${TREFLE_API_BASE_URL}/plants/search?token=${TREFLE_TOKEN}&q=${encodedQuery}`;

		console.log(`[Trefle] Searching for: ${query}`);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			const errorData = (await response.json()) as TrefleError;
			console.error(
				`[Trefle] Search failed: ${response.status} - ${errorData.error || errorData.message}`
			);
			return null;
		}

		const data = (await response.json()) as TrefleSearchResponse;

		console.log(
			`[Trefle] Found ${data.data.length} results (total: ${data.meta.total})`
		);

		return data.data;
	} catch (error) {
		console.error("[Trefle] Search error:", error);
		return null;
	}
}

/**
 * Get detailed information about a specific plant by ID
 * @param plantId - The Trefle plant ID
 * @returns Detailed plant information
 */
export async function getPlantDetails(
	plantId: number
): Promise<TreflePlantDetails | null> {
	if (!TREFLE_TOKEN) {
		console.error("Trefle API token not configured");
		return null;
	}

	try {
		const url = `${TREFLE_API_BASE_URL}/plants/${plantId}?token=${TREFLE_TOKEN}`;

		console.log(`[Trefle] Fetching details for plant ID: ${plantId}`);

		const response = await fetch(url, {
			method: "GET",
			headers: {
				Accept: "application/json",
			},
		});

		if (!response.ok) {
			const errorData = (await response.json()) as TrefleError;
			console.error(
				`[Trefle] Details fetch failed: ${response.status} - ${errorData.error || errorData.message}`
			);
			return null;
		}

		const result = await response.json();
		console.log(`[Trefle] Details fetched for: ${result.data.scientific_name}`);

		return result.data as TreflePlantDetails;
	} catch (error) {
		console.error("[Trefle] Details fetch error:", error);
		return null;
	}
}

/**
 * Search for a plant and return the best match with details
 * @param scientificName - The scientific name of the plant
 * @returns The best matching plant with details, or null if not found
 */
export async function searchPlantByScientificName(
	scientificName: string
): Promise<TreflePlantDetails | null> {
	// First, search for the plant
	const searchResults = await searchPlants(scientificName);

	if (!searchResults || searchResults.length === 0) {
		console.log(`[Trefle] No results found for: ${scientificName}`);
		return null;
	}

	// Find the best match (exact match or first result)
	const bestMatch =
		searchResults.find(
			(plant) =>
				plant.scientific_name.toLowerCase() === scientificName.toLowerCase()
		) || searchResults[0];

	console.log(
		`[Trefle] Best match: ${bestMatch.scientific_name} (ID: ${bestMatch.id})`
	);

	// Get detailed information for the best match
	return await getPlantDetails(bestMatch.id);
}
