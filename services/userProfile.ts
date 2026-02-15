import * as SecureStore from "expo-secure-store";

export type UserRank = "novice" | "intermediate" | "expert";

interface UserProfile {
	username: string;
	createdAt: string;
	updatedAt: string;
	rank: UserRank;
	quizzesPassed: number;
}

const USER_PROFILE_KEY = "floradex_user_profile";

export const userProfileService = {
	/**
	 * Save user profile (username) to secure storage
	 */
	async saveProfile(username: string): Promise<void> {
		try {
			const profile: UserProfile = {
				username: username.trim(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				rank: "novice",
				quizzesPassed: 0,
			};

			// Check if profile exists to preserve createdAt, rank, and quizzesPassed
			const existingProfile = await this.getProfile();
			if (existingProfile) {
				profile.createdAt = existingProfile.createdAt;
				profile.rank = existingProfile.rank;
				profile.quizzesPassed = existingProfile.quizzesPassed;
			}

			await SecureStore.setItemAsync(USER_PROFILE_KEY, JSON.stringify(profile));
		} catch (error) {
			console.error("Error saving user profile:", error);
			throw error;
		}
	},

	/**
	 * Get user profile from secure storage
	 */
	async getProfile(): Promise<UserProfile | null> {
		try {
			const profileData = await SecureStore.getItemAsync(USER_PROFILE_KEY);
			if (!profileData) {
				return null;
			}
			return JSON.parse(profileData) as UserProfile;
		} catch (error) {
			console.error("Error getting user profile:", error);
			return null;
		}
	},

	/**
	 * Get just the username
	 */
	async getUsername(): Promise<string | null> {
		const profile = await this.getProfile();
		return profile?.username || null;
	},

	/**
	 * Clear user profile (useful on sign out)
	 */
	async clearProfile(): Promise<void> {
		try {
			await SecureStore.deleteItemAsync(USER_PROFILE_KEY);
		} catch (error) {
			console.error("Error clearing user profile:", error);
			throw error;
		}
	},

	/**
	 * Check if profile exists
	 */
	async hasProfile(): Promise<boolean> {
		const profile = await this.getProfile();
		return profile !== null && profile.username.length > 0;
	},

	/**
	 * Initialize profile with default values if it doesn't exist
	 * This ensures new users have rank tracking set up
	 */
	async ensureProfileExists(userId?: string): Promise<UserProfile> {
		try {
			let profile = await this.getProfile();

			if (!profile) {
				// Create a new profile with defaults
				const username = userId ? `user_${userId.slice(0, 8)}` : "new_user";
				profile = {
					username,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString(),
					rank: "novice",
					quizzesPassed: 0,
				};

				await SecureStore.setItemAsync(
					USER_PROFILE_KEY,
					JSON.stringify(profile)
				);

				console.log("✅ Profile initialized with default rank: novice");
			}

			return profile;
		} catch (error) {
			console.error("Error ensuring profile exists:", error);
			throw error;
		}
	},

	/**
	 * Record a successful quiz completion and update rank if needed
	 * Also syncs with Clerk user metadata
	 */
	async recordQuizPassed(user?: any): Promise<{
		newRank?: UserRank;
		quizzesPassed: number;
		currentRank: UserRank;
	}> {
		try {
			// Ensure profile exists first
			let profile = await this.getProfile();
			if (!profile) {
				console.warn("No profile found, initializing with defaults");
				profile = await this.ensureProfileExists(user?.id);
			}

			const newQuizzesPassed = profile.quizzesPassed + 1;
			let newRank = profile.rank;
			let rankChanged = false;

			// Check for rank progression
			if (profile.rank === "novice" && newQuizzesPassed >= 2) {
				newRank = "intermediate";
				rankChanged = true;
				console.log("🎖️ RANK UP: Novice → Intermediate");
			} else if (profile.rank === "intermediate" && newQuizzesPassed >= 5) {
				// 2 quizzes as novice + 3 quizzes as intermediate = 5 total
				newRank = "expert";
				rankChanged = true;
				console.log("🎖️ RANK UP: Intermediate → Expert");
			}

			// Update profile
			const updatedProfile: UserProfile = {
				...profile,
				quizzesPassed: newQuizzesPassed,
				rank: newRank,
				updatedAt: new Date().toISOString(),
			};

			await SecureStore.setItemAsync(
				USER_PROFILE_KEY,
				JSON.stringify(updatedProfile)
			);

			// Sync with Clerk metadata for persistence
			if (user) {
				try {
					await user.update({
						unsafeMetadata: {
							...user.unsafeMetadata,
							userRank: newRank,
							quizzesPassed: newQuizzesPassed,
							lastRankUpdate: new Date().toISOString(),
						},
					});
					console.log("✅ Synced rank data with Clerk");
				} catch (error) {
					console.warn("Failed to sync with Clerk (continuing anyway):", error);
				}
			}

			console.log(
				`✅ Quiz recorded! Total passed: ${newQuizzesPassed}, Rank: ${newRank}`
			);

			return {
				newRank: rankChanged ? newRank : undefined,
				quizzesPassed: newQuizzesPassed,
				currentRank: newRank,
			};
		} catch (error) {
			console.error("Error recording quiz:", error);
			throw error;
		}
	},

	/**
	 * Get current user rank
	 */
	async getRank(): Promise<UserRank> {
		const profile = await this.getProfile();
		return profile?.rank || "novice";
	},

	/**
	 * Get number of quizzes passed
	 */
	async getQuizzesPassed(): Promise<number> {
		const profile = await this.getProfile();
		return profile?.quizzesPassed || 0;
	},

	/**
	 * Sync rank data from Clerk metadata to local storage
	 * This restores data if the user reinstalls the app or uses a new device
	 */
	async syncFromClerk(user: any): Promise<void> {
		try {
			if (!user) {
				console.warn("No user provided for sync");
				return;
			}

			const clerkRank = user.unsafeMetadata?.userRank as UserRank | undefined;
			const clerkQuizzes = user.unsafeMetadata?.quizzesPassed as
				| number
				| undefined;

			if (clerkRank && clerkQuizzes !== undefined) {
				// Get local profile
				let profile = await this.getProfile();

				// If local profile doesn't exist or Clerk has newer data, update from Clerk
				if (!profile || clerkQuizzes > profile.quizzesPassed) {
					const updatedProfile: UserProfile = {
						username: profile?.username || `user_${user.id.slice(0, 8)}`,
						createdAt: profile?.createdAt || new Date().toISOString(),
						updatedAt: new Date().toISOString(),
						rank: clerkRank,
						quizzesPassed: clerkQuizzes,
					};

					await SecureStore.setItemAsync(
						USER_PROFILE_KEY,
						JSON.stringify(updatedProfile)
					);

					console.log(
						`✅ Synced rank data from Clerk: ${clerkRank}, ${clerkQuizzes} quizzes`
					);
				}
			}
		} catch (error) {
			console.error("Error syncing from Clerk:", error);
		}
	},

	/**
	 * Get rank progress information for display
	 */
	async getRankProgress(): Promise<{
		rank: UserRank;
		quizzesPassed: number;
		quizzesForNextRank: number;
		quizzesInCurrentRank: number;
		canRankUp: boolean;
	}> {
		const profile = await this.getProfile();
		const rank = profile?.rank || "novice";
		const quizzesPassed = profile?.quizzesPassed || 0;

		let quizzesForNextRank = 0;
		let quizzesInCurrentRank = 0;
		let canRankUp = false;

		if (rank === "novice") {
			quizzesInCurrentRank = quizzesPassed;
			quizzesForNextRank = 2;
			canRankUp = quizzesInCurrentRank >= quizzesForNextRank;
		} else if (rank === "intermediate") {
			quizzesInCurrentRank = Math.max(0, quizzesPassed - 2);
			quizzesForNextRank = 3;
			canRankUp = quizzesInCurrentRank >= quizzesForNextRank;
		} else {
			// Expert - max rank
			quizzesInCurrentRank = quizzesPassed;
			quizzesForNextRank = 0;
			canRankUp = false;
		}

		return {
			rank,
			quizzesPassed,
			quizzesForNextRank,
			quizzesInCurrentRank,
			canRankUp,
		};
	},
};
