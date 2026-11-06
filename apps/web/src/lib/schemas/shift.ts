import { z } from 'zod';

/** Max cash a single drawer may declare (₱). Above this the count must be split across tills. */
export const MAX_DRAWER_CASH_PHP = 200_000;

const pesoAmount = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required.`)
    .regex(/^\d+(\.\d{1,2})?$/, `${label} must be a peso amount like 2500 or 2500.50.`)
    .transform((v) => Number(v))
    .refine((n) => n <= MAX_DRAWER_CASH_PHP, `${label} cannot exceed ₱${MAX_DRAWER_CASH_PHP.toLocaleString()}.`);

export const openShiftSchema = z.object({
  pin: z
    .string()
    .min(1, 'Enter your staff PIN.')
    .regex(/^\d+$/, 'PIN must contain digits only.')
    .min(4, 'PIN must be 4–6 digits.')
    .max(6, 'PIN must be 4–6 digits.'),
  openingFloat: pesoAmount('Opening float').refine((n) => n > 0, 'Opening float must be greater than ₱0.'),
});

export const blindCountSchema = z.object({
  countedCash: pesoAmount('Counted cash'),
});

export type OpenShiftInput = z.input<typeof openShiftSchema>;
export type BlindCountInput = z.input<typeof blindCountSchema>;

export { firstFieldErrors, type FieldErrors } from './field-errors';
