import { z } from "zod";
import { SODIA_FIELD_LIMITS } from "./constants";

/**
 * Zod validation schemas enforcing business logic across Mobile and Web
 */

export const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(?:\+63|0)?9\d{9}$/,
    "Please enter a valid Philippine mobile number (e.g. +63 917 123 4567)"
  );

export const otpSchema = z
  .string()
  .trim()
  .length(
    SODIA_FIELD_LIMITS.OTP_CODE_LENGTH,
    `OTP code must be exactly ${SODIA_FIELD_LIMITS.OTP_CODE_LENGTH} digits`
  )
  .regex(/^\d+$/, "OTP code must contain only numbers");

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(24, "Username cannot exceed 24 characters")
  .regex(
    /^[a-zA-Z0-9_.]+$/,
    "Username can only contain letters, numbers, underscores, and periods"
  );

export const ageGateSchema = z
  .string()
  .refine(
    (dobString) => {
      const birthDate = new Date(dobString);
      if (isNaN(birthDate.getTime())) return false;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age >= 13;
    },
    { message: "You must be 13 or older to create a GetPhysical account" }
  );

export function isMinorUser(dobString: string): boolean {
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age < 18;
}

export const postCaptionSchema = z
  .string()
  .max(
    SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS,
    `Caption cannot exceed ${SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS} characters`
  );

export const challengeEntryCaptionSchema = z
  .string()
  .max(
    SODIA_FIELD_LIMITS.CHALLENGE_ENTRY_CAPTION_MAX_CHARS,
    `Challenge caption cannot exceed ${SODIA_FIELD_LIMITS.CHALLENGE_ENTRY_CAPTION_MAX_CHARS} characters`
  );

export const bioSchema = z
  .string()
  .max(
    SODIA_FIELD_LIMITS.BIO_MAX_CHARS,
    `Bio cannot exceed ${SODIA_FIELD_LIMITS.BIO_MAX_CHARS} characters`
  );

export const fitnessGoalsSchema = z
  .array(z.string())
  .min(
    SODIA_FIELD_LIMITS.FITNESS_GOALS_MIN,
    `Select at least ${SODIA_FIELD_LIMITS.FITNESS_GOALS_MIN} goal`
  )
  .max(
    SODIA_FIELD_LIMITS.FITNESS_GOALS_MAX,
    `Select at most ${SODIA_FIELD_LIMITS.FITNESS_GOALS_MAX} goals`
  );

export const workoutSetSchema = z.object({
  setNumber: z.number().int().positive(),
  type: z.enum(["warmup", "working", "drop", "failure"]),
  weightKg: z.number().min(0),
  reps: z.number().int().min(1),
  isCompleted: z.boolean(),
});

export const foodItemSchema = z.object({
  name: z.string().min(1, "Food name required"),
  calories: z.number().min(0),
  proteinGrams: z.number().min(0),
  carbsGrams: z.number().min(0),
  fatsGrams: z.number().min(0),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
});
