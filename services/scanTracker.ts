export interface ScannedPlant {
	id: string;
	name: string;
	commonNames?: string[];
	scientificName: string;
	probability: number;
	imageUrl?: string;
	userPhotoUri?: string; // The actual photo URI the user took
	scannedAt: string;
	taxonomy?: {
		genus?: string;
		family?: string;
		order?: string;
		kingdom?: string;
		class?: string;
		phylum?: string;
	};
}

/**
 * Track a successful plant scan by incrementing the user's scan count in Clerk metadata
 * and storing plant details for the quiz
 */
export async function trackSuccessfulScan(
	user: any,
	plantData?: {
		name: string;
		commonNames?: string[];
		probability: number;
		imageUrl?: string;
		userPhotoUri?: string; // The actual photo URI the user took
		taxonomy?: {
			genus?: string;
			family?: string;
			order?: string;
			kingdom?: string;
			class?: string;
			phylum?: string;
		};
	}
): Promise<void> {
	if (!user) {
		console.warn("No user found, cannot track scan");
		return;
	}

	try {
		const currentCount = (user.unsafeMetadata?.successfulScans as number) || 0;
		const newCount = currentCount + 1;

		// Get existing quiz batch or initialize
		const currentBatch =
			(user.unsafeMetadata?.currentQuizBatch as ScannedPlant[]) || [];
		const quizPending = (user.unsafeMetadata?.quizPending as boolean) || false;

		// Create plant record
		const plantRecord: ScannedPlant = {
			id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			name: plantData?.name || "Unknown Plant",
			commonNames: plantData?.commonNames,
			scientificName: plantData?.name || "Unknown",
			probability: plantData?.probability || 0,
			imageUrl: plantData?.imageUrl,
			userPhotoUri: plantData?.userPhotoUri,
			scannedAt: new Date().toISOString(),
			taxonomy: plantData?.taxonomy,
		};

		// Add to current batch
		const updatedBatch = [...currentBatch, plantRecord];

		// Check if we've reached the minimum scans for the batch
		const batchSize = updatedBatch.length;
		const minScans = getMinScansRequired();
		const shouldTriggerQuiz = batchSize >= minScans && !quizPending;

		await user.update({
			unsafeMetadata: {
				...user.unsafeMetadata,
				successfulScans: newCount,
				currentQuizBatch: updatedBatch,
				quizPending: shouldTriggerQuiz,
			},
		});

		console.log(
			`✅ Scan tracked! Total scans: ${newCount}, Batch: ${batchSize}/${minScans}`
		);

		if (shouldTriggerQuiz) {
			console.log("🎯 Quiz unlocked! Complete the quiz to continue scanning.");
		}
	} catch (error) {
		console.error("Failed to track scan:", error);
	}
}

/**
 * Get the current scan count for a user
 */
export function getSuccessfulScanCount(user: any): number {
	if (!user) {
		return 0;
	}

	return (user.unsafeMetadata?.successfulScans as number) || 0;
}

/**
 * Check if the user has access to the quiz feature
 * Access is granted if:
 * - The user has enough successful scans (based on EXPO_PUBLIC_QUIZ_MIN_SCANS)
 * - Or if EXPO_PUBLIC_QUIZ_MIN_SCANS is set to 0 or below (bypass mode)
 */
export function hasQuizAccess(user: any): boolean {
	const scanCount = getSuccessfulScanCount(user);
	const minScansRequired = parseInt(
		process.env.EXPO_PUBLIC_QUIZ_MIN_SCANS || "1",
		10
	);

	// If min scans is 0 or negative, grant access regardless of scan count
	if (minScansRequired <= 0) {
		return true;
	}

	// Otherwise, check if user has enough scans
	return scanCount >= minScansRequired;
}

/**
 * Get the minimum scans required for quiz access
 */
export function getMinScansRequired(): number {
	return parseInt(process.env.EXPO_PUBLIC_QUIZ_MIN_SCANS || "1", 10);
}

/**
 * Check if the user has a quiz pending that blocks scanning
 */
export function isQuizPending(user: any): boolean {
	if (!user) {
		return false;
	}

	return (user.unsafeMetadata?.quizPending as boolean) || false;
}

/**
 * Get the current quiz batch of plants
 */
export function getCurrentQuizBatch(user: any): ScannedPlant[] {
	if (!user) {
		return [];
	}

	return (user.unsafeMetadata?.currentQuizBatch as ScannedPlant[]) || [];
}

/**
 * Get the progress of the current quiz batch (e.g., "1/1")
 */
export function getQuizBatchProgress(user: any): {
	current: number;
	total: number;
} {
	const batch = getCurrentQuizBatch(user);
	return {
		current: batch.length,
		total: getMinScansRequired(),
	};
}

/**
 * Mark the quiz as completed and reset the batch
 */
export async function completeQuiz(user: any): Promise<void> {
	if (!user) {
		console.warn("No user found, cannot complete quiz");
		return;
	}

	try {
		await user.update({
			unsafeMetadata: {
				...user.unsafeMetadata,
				quizPending: false,
				currentQuizBatch: [], // Reset batch after quiz completion
				lastQuizCompletedAt: new Date().toISOString(),
			},
		});

		console.log("✅ Quiz completed! You can now scan more plants.");
	} catch (error) {
		console.error("Failed to complete quiz:", error);
	}
}

export type QuestionType = "common_name" | "genus" | "family" | "kingdom";

export interface QuizQuestion {
	plant: ScannedPlant;
	options: string[];
	correctAnswer: string;
	questionNumber: number;
	scientificName: string;
	questionType: QuestionType;
	questionText: string;
	displayName: string; // What to show in the question (common name or scientific name)
}

/**
 * Generate quiz questions from the current batch of scanned plants
 * Randomly asks about: common name, genus, family, or kingdom
 * Each question type shows different information and requires different answers
 */
export function generateQuizQuestions(plants: ScannedPlant[]): QuizQuestion[] {
	console.log(
		`[generateQuizQuestions] Generating questions for ${plants.length} plants`
	);

	if (plants.length === 0) {
		console.warn("[generateQuizQuestions] No plants provided");
		return [];
	}

	// Shuffle plants for random question order
	const shuffledPlants = [...plants].sort(() => Math.random() - 0.5);

	const questions: QuizQuestion[] = [];

	for (let index = 0; index < shuffledPlants.length; index++) {
		const plant = shuffledPlants[index];
		console.log(`[generateQuizQuestions] Processing plant: ${plant.name}`, {
			hasCommonNames: !!(plant.commonNames && plant.commonNames.length > 0),
			hasGenus: !!plant.taxonomy?.genus,
			hasFamily: !!plant.taxonomy?.family,
			hasKingdom: !!plant.taxonomy?.kingdom,
		});

		// Determine available question types based on plant data
		const availableTypes: QuestionType[] = [];

		if (plant.commonNames && plant.commonNames.length > 0) {
			availableTypes.push("common_name");
		}
		if (plant.taxonomy?.genus) {
			availableTypes.push("genus");
		}
		if (plant.taxonomy?.family) {
			availableTypes.push("family");
		}
		if (plant.taxonomy?.kingdom) {
			availableTypes.push("kingdom");
		}

		// Fallback: if no taxonomy data, create a basic question asking for scientific name
		if (availableTypes.length === 0) {
			console.warn(
				`[generateQuizQuestions] Plant ${plant.name} has no taxonomy data - using fallback question`
			);

			// Create a simple question asking "What is this plant?"
			const fallbackCorrectAnswer = plant.scientificName || plant.name;

			// Get wrong options from other plants
			const fallbackWrongOptions = shuffledPlants
				.filter((p) => p.id !== plant.id)
				.slice(0, 3)
				.map((p) => p.scientificName || p.name)
				.filter((name) => name !== fallbackCorrectAnswer);

			// Add generic options if needed
			const genericPlantNames = [
				"Epipremnum aureum",
				"Monstera deliciosa",
				"Sansevieria trifasciata",
				"Ficus elastica",
				"Chlorophytum comosum",
				"Dracaena fragrans",
			];

			while (fallbackWrongOptions.length < 3) {
				const random =
					genericPlantNames[
						Math.floor(Math.random() * genericPlantNames.length)
					];
				if (
					!fallbackWrongOptions.includes(random) &&
					random !== fallbackCorrectAnswer
				) {
					fallbackWrongOptions.push(random);
				}
			}

			// Create fallback question
			const fallbackOptions = [
				fallbackCorrectAnswer,
				...fallbackWrongOptions.slice(0, 3),
			].sort(() => Math.random() - 0.5);

			questions.push({
				plant,
				options: fallbackOptions,
				correctAnswer: fallbackCorrectAnswer,
				scientificName: plant.scientificName || plant.name,
				questionNumber: questions.length + 1,
				questionType: "common_name",
				questionText: "What is the scientific name of this plant?",
				displayName:
					plant.commonNames && plant.commonNames.length > 0
						? plant.commonNames[0]
						: "Unknown Plant",
			});

			console.log(
				`[generateQuizQuestions] Created fallback question for ${plant.name}`
			);
			continue;
		}

		// Randomly select a question type
		const questionType =
			availableTypes[Math.floor(Math.random() * availableTypes.length)];

		let correctAnswer: string;
		let questionText: string;
		let displayName: string; // What to show in the question
		let wrongOptions: string[] = [];

		switch (questionType) {
			case "common_name":
				// Ask for common name, show scientific name
				correctAnswer = plant.commonNames![0];
				questionText = "What is the common name of this plant?";
				displayName = plant.scientificName || plant.name;

				// Get wrong options from other plants' common names
				wrongOptions = shuffledPlants
					.filter((p) => p.id !== plant.id && p.commonNames?.length)
					.slice(0, 3)
					.map((p) => p.commonNames![0])
					.filter((name) => name !== correctAnswer);

				// Add generic options if needed
				const genericCommonNames = [
					"Peace Lily",
					"Snake Plant",
					"Spider Plant",
					"Pothos",
					"Monstera",
					"Fiddle Leaf Fig",
					"Rubber Plant",
					"Bird of Paradise",
					"Aloe Vera",
					"English Ivy",
				];

				while (wrongOptions.length < 3) {
					const random =
						genericCommonNames[
							Math.floor(Math.random() * genericCommonNames.length)
						];
					if (!wrongOptions.includes(random) && random !== correctAnswer) {
						wrongOptions.push(random);
					}
				}
				break;

			case "genus":
				// Ask for genus, show common name or scientific name
				correctAnswer = plant.taxonomy!.genus!;
				questionText = "What is the genus of this plant?";
				displayName =
					plant.commonNames && plant.commonNames.length > 0
						? plant.commonNames[0]
						: plant.scientificName || plant.name;

				// Get wrong options from other plants' genus
				wrongOptions = shuffledPlants
					.filter((p) => p.id !== plant.id && p.taxonomy?.genus)
					.slice(0, 3)
					.map((p) => p.taxonomy!.genus!)
					.filter((genus) => genus !== correctAnswer);

				// Add generic genus names if needed
				const genericGenus = [
					"Rosa",
					"Quercus",
					"Acer",
					"Ficus",
					"Pinus",
					"Aloe",
					"Iris",
					"Lilium",
				];

				while (wrongOptions.length < 3) {
					const random =
						genericGenus[Math.floor(Math.random() * genericGenus.length)];
					if (!wrongOptions.includes(random) && random !== correctAnswer) {
						wrongOptions.push(random);
					}
				}
				break;

			case "family":
				// Ask for family, show common name or scientific name
				correctAnswer = plant.taxonomy!.family!;
				questionText = "What family does this plant belong to?";
				displayName =
					plant.commonNames && plant.commonNames.length > 0
						? plant.commonNames[0]
						: plant.scientificName || plant.name;

				// Get wrong options from other plants' family
				wrongOptions = shuffledPlants
					.filter((p) => p.id !== plant.id && p.taxonomy?.family)
					.slice(0, 3)
					.map((p) => p.taxonomy!.family!)
					.filter((family) => family !== correctAnswer);

				// Add generic family names if needed
				const genericFamily = [
					"Rosaceae",
					"Asteraceae",
					"Fabaceae",
					"Lamiaceae",
					"Solanaceae",
					"Orchidaceae",
					"Liliaceae",
					"Cactaceae",
				];

				while (wrongOptions.length < 3) {
					const random =
						genericFamily[Math.floor(Math.random() * genericFamily.length)];
					if (!wrongOptions.includes(random) && random !== correctAnswer) {
						wrongOptions.push(random);
					}
				}
				break;

			case "kingdom":
				// Ask for kingdom, show common name or scientific name
				correctAnswer = plant.taxonomy!.kingdom!;
				questionText = "What kingdom does this plant belong to?";
				displayName =
					plant.commonNames && plant.commonNames.length > 0
						? plant.commonNames[0]
						: plant.scientificName || plant.name;

				// For kingdom, use standard kingdoms as wrong options
				const kingdoms = ["Plantae", "Animalia", "Fungi", "Protista"];
				wrongOptions = kingdoms.filter((k) => k !== correctAnswer).slice(0, 3);
				break;
		}

		// Combine and shuffle options
		const allOptions = [correctAnswer, ...wrongOptions.slice(0, 3)];
		const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

		questions.push({
			plant,
			options: shuffledOptions,
			correctAnswer,
			scientificName: plant.scientificName || plant.name,
			questionNumber: questions.length + 1,
			questionType,
			questionText,
			displayName,
		});
	}

	console.log(
		`[generateQuizQuestions] Generated ${questions.length} questions`
	);
	return questions;
}
