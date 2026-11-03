import type { AthleteProfileData } from "../components/profile/AthleteProfileModal";

export const ATHLETE_ROSTER: Record<string, AthleteProfileData> = {
  "Coach Miguel Ramos": {
    userId: "u_miguel",
    name: "Coach Miguel Ramos",
    username: "coach.miguel",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    bio: "Head Strength & Conditioning Coach @ Metro Core Arena. CSCS Certified.",
    specialty: "Strength & Powerlifting Coach",
    isVerified: true,
    followersCount: "8.4k",
    workoutsCount: "520",
    prStamp: { title: "Deadlift 1RM", metric: "275 KG", venue: "Metro Core Arena" },
    photos: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=400&q=80",
    ],
  },
  "Sarah Jenkins": {
    userId: "u_sarah",
    name: "Sarah Jenkins",
    username: "sarah.fit",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    bio: "Hyrox athlete & functional endurance runner. BGC Track Regular.",
    specialty: "Hyrox Pro Athlete",
    isVerified: true,
    followersCount: "4.2k",
    workoutsCount: "310",
    prStamp: { title: "5K Trail Run", metric: "19:42", venue: "BGC Greenway" },
    photos: [
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80",
    ],
  },
  "Sofia Valdes": {
    userId: "u_sofia",
    name: "Sofia Valdes",
    username: "sofia.pilates",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    bio: "Reformer Pilates Master Instructor & Athletic Posture Specialist.",
    specialty: "Reformer & Classical Pilates",
    isVerified: true,
    followersCount: "6.1k",
    workoutsCount: "440",
    prStamp: { title: "Core Hold", metric: "5:00", venue: "Solstice Studio" },
    photos: [
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
    ],
  },
};

export function getAthleteProfile(name: string, avatar?: string | null): AthleteProfileData {
  const match = ATHLETE_ROSTER[name];
  if (match) return match;
  return {
    userId: `u_${Date.now()}`,
    name,
    username: name.toLowerCase().replace(/\s+/g, "."),
    avatar: avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    bio: "Active athlete in the Metro community. Training consistently on GetPhysical.",
    specialty: "Functional Athlete",
    isVerified: false,
    followersCount: "1.2k",
    workoutsCount: "180",
    photos: [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80",
    ],
  };
}
