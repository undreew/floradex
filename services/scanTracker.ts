export interface ScannedPlant {
	id: string;
	name: string;
	commonNames?: string[];
	scientificName: string;
	probability: number;
	imageUrl?: string;
	scannedAt: string;
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
			scannedAt: new Date().toISOString(),
		};

		// Add to current batch
		const updatedBatch = [...currentBatch, plantRecord];

		// Check if we've reached 5 scans for the batch
		const batchSize = updatedBatch.length;
		const shouldTriggerQuiz = batchSize >= 5 && !quizPending;

		await user.update({
			unsafeMetadata: {
				...user.unsafeMetadata,
				successfulScans: newCount,
				currentQuizBatch: updatedBatch,
				quizPending: shouldTriggerQuiz,
			},
		});

		console.log(
			`✅ Scan tracked! Total scans: ${newCount}, Batch: ${batchSize}/5`
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
		process.env.EXPO_PUBLIC_QUIZ_MIN_SCANS || "5",
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
	return parseInt(process.env.EXPO_PUBLIC_QUIZ_MIN_SCANS || "5", 10);
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
 * Get the progress of the current quiz batch (e.g., "3/5")
 */
export function getQuizBatchProgress(user: any): {
	current: number;
	total: number;
} {
	const batch = getCurrentQuizBatch(user);
	return {
		current: batch.length,
		total: 5,
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

export interface QuizQuestion {
	plant: ScannedPlant;
	options: string[];
	correctAnswer: string;
	questionNumber: number;
}

/**
 * Generate quiz questions from the current batch of scanned plants
 * Each question shows a plant and asks user to identify it from 4 options
 */
export function generateQuizQuestions(plants: ScannedPlant[]): QuizQuestion[] {
	if (plants.length < 2) {
		return [];
	}

	// Shuffle plants for random question order
	const shuffledPlants = [...plants].sort(() => Math.random() - 0.5);

	return shuffledPlants.map((plant, index) => {
		// Get the correct answer (use common name if available, otherwise scientific name)
		const correctAnswer =
			plant.commonNames && plant.commonNames.length > 0
				? plant.commonNames[0]
				: plant.name;

		// Get other plants for wrong options
		const otherPlants = plants.filter((p) => p.id !== plant.id);

		// Create wrong options from other plants
		const wrongOptions = otherPlants.slice(0, 3).map((p) => {
			return p.commonNames && p.commonNames.length > 0
				? p.commonNames[0]
				: p.name;
		});

		// If we don't have enough wrong options, add generic ones
		const genericOptions = [
			"Rose",
			"Sunflower",
			"Daisy",
			"Tulip",
			"Orchid",
			"Cactus",
			"Fern",
			"Bamboo",
		];

		while (
			wrongOptions.length < 3 &&
			wrongOptions.length < otherPlants.length + genericOptions.length
		) {
			const randomGeneric =
				genericOptions[Math.floor(Math.random() * genericOptions.length)];
			if (
				!wrongOptions.includes(randomGeneric) &&
				randomGeneric !== correctAnswer
			) {
				wrongOptions.push(randomGeneric);
			}
		}

		// Combine and shuffle options
		const allOptions = [correctAnswer, ...wrongOptions.slice(0, 3)];
		const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

		return {
			plant,
			options: shuffledOptions,
			correctAnswer,
			questionNumber: index + 1,
		};
	});
}
