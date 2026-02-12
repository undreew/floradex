import * as SecureStore from "expo-secure-store";

interface UserProfile {
	username: string;
	createdAt: string;
	updatedAt: string;
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
			};

			// Check if profile exists to preserve createdAt
			const existingProfile = await this.getProfile();
			if (existingProfile) {
				profile.createdAt = existingProfile.createdAt;
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
};
