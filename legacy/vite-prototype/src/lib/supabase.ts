import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://brctciqhsyjqxfoqyuoz.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyY3RjaXFoc3lqcXhmb3F5dW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTEzNDIsImV4cCI6MjEwODk4NzM0Mn0.g7EktrouurQq03E2OgZyL_PArxbE3DRfv2ams3qBOaw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Auth Service
export const authService = {
  async signUp(email: string, password: string, fullName?: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getSession() {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  async getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ?? null);
    });
  },
};

// Database Service for GetPhysical Ecosystem
export const dbService = {
  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) console.warn('Get profile error:', error.message);
    return data;
  },

  async updateProfile(userId: string, updates: Record<string, any>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Facilities
  async getFacilities() {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .order('rating', { ascending: false });
    if (error) console.warn('Get facilities error:', error.message);
    return data || [];
  },

  // VIP Passes & Wallets
  async getPasses(userId?: string) {
    let query = supabase.from('vip_card_passes').select('*');
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) console.warn('Get passes error:', error.message);
    return data || [];
  },

  async createPass(pass: Record<string, any>) {
    const { data, error } = await supabase
      .from('vip_card_passes')
      .insert([pass])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Financial Ledger
  async getLedger() {
    const { data, error } = await supabase
      .from('ledger_transactions')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) console.warn('Get ledger error:', error.message);
    return data || [];
  },

  async recordLedgerTransaction(tx: Record<string, any>) {
    const { data, error } = await supabase
      .from('ledger_transactions')
      .insert([tx])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Sodia Feed & Social
  async getPosts() {
    const { data, error } = await supabase
      .from('sodia_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.warn('Get posts error:', error.message);
    return data || [];
  },

  async createPost(post: Record<string, any>) {
    const { data, error } = await supabase
      .from('sodia_posts')
      .insert([post])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // PR Challenges
  async getChallenges() {
    const { data, error } = await supabase
      .from('pr_challenges')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.warn('Get challenges error:', error.message);
    return data || [];
  },

  // Tournaments
  async getTournamentMatches() {
    const { data, error } = await supabase
      .from('tournament_matches')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) console.warn('Get tournament matches error:', error.message);
    return data || [];
  },

  async updateMatchScore(matchId: string, scoreA: number, scoreB: number, status?: string) {
    const { data, error } = await supabase
      .from('tournament_matches')
      .update({
        score_a: scoreA,
        score_b: scoreB,
        status: status || 'live',
        updated_at: new Date().toISOString()
      })
      .eq('id', matchId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Access Scans (Turnstile)
  async getAccessScans() {
    const { data, error } = await supabase
      .from('access_scans')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) console.warn('Get access scans error:', error.message);
    return data || [];
  },

  async recordAccessScan(scan: Record<string, any>) {
    const { data, error } = await supabase
      .from('access_scans')
      .insert([scan])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};
