import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EXPLICIT_COLUMNS, FacilityRow, LedgerTransactionRow, ProfileRow, PassRow } from './database.types';

export const SUPABASE_CONFIG = {
  url: 'https://brctciqhsyjqxfoqyuoz.supabase.co',
  publishableKey: 'sb_publishable_F4Tv4zpNFmQYFPxXMrkbxA_WNkBUleg',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyY3RjaXFoc3lqcXhmb3F5dW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTEzNDIsImV4cCI6MjEwODk4NzM0Mn0.g7EktrouurQq03E2OgZyL_PArxbE3DRfv2ams3qBOaw',
  supavisorPoolerPort: 6543,
  projectId: 'brctciqhsyjqxfoqyuoz',
  region: 'eu-north-1',
} as const;

export function getSodiaSupabaseClient(
  customUrl?: string,
  customKey?: string
): SupabaseClient {
  const url = customUrl || SUPABASE_CONFIG.url;
  const key = customKey || SUPABASE_CONFIG.anonKey;
  return createClient(url, key);
}

/**
 * Enterprise Query Wrappers strictly enforcing AGENTS.md Laws:
 * 1. Zero `select('*')`
 * 2. Zero `any` types
 * 3. Immutable Append-Only Ledger transactions
 */
export const SodiaQueries = {
  async getFacilities(client: SupabaseClient): Promise<readonly FacilityRow[]> {
    const { data, error } = await client
      .from('facilities')
      .select(EXPLICIT_COLUMNS.FACILITIES)
      .order('rating', { ascending: false });

    if (error) {
      throw new Error(`[SodiaQueries.getFacilities] ${error.message}`);
    }
    return (data as unknown as readonly FacilityRow[]) || [];
  },

  async getProfile(client: SupabaseClient, userId: string): Promise<ProfileRow | null> {
    const { data, error } = await client
      .from('profiles')
      .select(EXPLICIT_COLUMNS.PROFILES)
      .eq('id', userId)
      .single();

    if (error) {
      console.warn(`[SodiaQueries.getProfile] ${error.message}`);
      return null;
    }
    return data as unknown as ProfileRow;
  },

  async getPasses(client: SupabaseClient, ownerId: string): Promise<readonly PassRow[]> {
    const { data, error } = await client
      .from('passes')
      .select(EXPLICIT_COLUMNS.PASSES)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`[SodiaQueries.getPasses] ${error.message}`);
    }
    return (data as unknown as readonly PassRow[]) || [];
  },

  async getLedger(client: SupabaseClient): Promise<readonly LedgerTransactionRow[]> {
    const { data, error } = await client
      .from('ledger_transactions')
      .select(EXPLICIT_COLUMNS.LEDGER_TRANSACTIONS)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`[SodiaQueries.getLedger] ${error.message}`);
    }
    return (data as unknown as readonly LedgerTransactionRow[]) || [];
  },

  /**
   * Append-Only Law: Writes new immutable row. Never UPDATE or DELETE.
   */
  async appendLedgerTransaction(
    client: SupabaseClient,
    tx: Omit<LedgerTransactionRow, 'id' | 'created_at'>
  ): Promise<LedgerTransactionRow> {
    const { data, error } = await client
      .from('ledger_transactions')
      .insert([tx])
      .select(EXPLICIT_COLUMNS.LEDGER_TRANSACTIONS)
      .single();

    if (error) {
      throw new Error(`[SodiaQueries.appendLedgerTransaction] ${error.message}`);
    }
    return data as unknown as LedgerTransactionRow;
  },
} as const;
