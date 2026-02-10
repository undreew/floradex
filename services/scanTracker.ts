/**
 * Track a successful plant scan by incrementing the user's scan count in Clerk metadata
 */
export async function trackSuccessfulScan(user: any): Promise<void> {
	if (!user) {
		console.warn("No user found, cannot track scan");
		return;
	}

	try {
		const currentCount = (user.unsafeMetadata?.successfulScans as number) || 0;
		const newCount = currentCount + 1;

		await user.update({
			unsafeMetadata: {
				...user.unsafeMetadata,
				successfulScans: newCount,
			},
		});

		console.log(`✅ Scan tracked! Total scans: ${newCount}`);
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
