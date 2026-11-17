import type { AthleteProfileData } from "../components/profile/AthleteProfileModal";

/**
 * Profile card for a post's author, built only from what the post carries.
 * Counts and photos stay empty until profiles are loaded from the server.
 */
export function athleteProfileFromPost(userId: string, name: string, avatar?: string | null): AthleteProfileData {
  return {
    userId: userId || `u_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name,
    username: name.toLowerCase().replace(/\s+/g, "."),
    avatar: avatar ?? "",
    bio: "",
    specialty: "",
    isVerified: false,
    followersCount: "—",
    workoutsCount: "—",
    photos: [],
  };
}
