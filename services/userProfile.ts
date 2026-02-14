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
	 * Record a successful quiz completion and update rank if needed
	 */
	async recordQuizPassed(): Promise<{
		newRank?: UserRank;
		quizzesPassed: number;
		currentRank: UserRank;
	}> {
		try {
			const profile = await this.getProfile();
			if (!profile) {
				console.error("No profile found, cannot record quiz");
				throw new Error("Profile not found");
			}

			const newQuizzesPassed = profile.quizzesPassed + 1;
			let newRank = profile.rank;
			let rankChanged = false;

			// Check for rank progression
			if (profile.rank === "novice" && newQuizzesPassed >= 2) {
				newRank = "intermediate";
				rankChanged = true;
			} else if (profile.rank === "intermediate" && newQuizzesPassed >= 5) {
				// 2 quizzes as novice + 3 quizzes as intermediate = 5 total
				newRank = "expert";
				rankChanged = true;
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
};
