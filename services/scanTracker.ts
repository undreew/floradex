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
