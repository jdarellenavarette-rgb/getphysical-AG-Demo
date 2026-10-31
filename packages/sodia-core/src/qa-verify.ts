import { createGetPhysicalClient } from "./client";
import { EXPLICIT_COLUMNS } from "./database.types";
import {
  calculateHybridServiceFee,
  HYBRID_FEE_MODEL,
  SODIA_FIELD_LIMITS,
} from "./constants";
import {
  createSuccessState,
  createLoadingState,
  type TenStateEnvelope,
} from "./states";

const SUPABASE_URL = "https://brctciqhsyjqxfoqyuoz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyY3RjaXFoc3lqcXhmb3F5dW96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM0MTEzNDIsImV4cCI6MjEwODk4NzM0Mn0.g7EktrouurQq03E2OgZyL_PArxbE3DRfv2ams3qBOaw";

export async function runFullEcosystemQA(): Promise<{
  allPassed: boolean;
  results: Record<string, any>;
}> {
  const results: Record<string, any> = {};

  // 1. Client initialization
  const client = createGetPhysicalClient({
    supabaseUrl: SUPABASE_URL,
    supabaseAnonKey: SUPABASE_ANON_KEY,
  });
  results.clientInitialized = !!client;

  // 2. Query facilities using explicit columns (No select('*'))
  const startFac = Date.now();
  const { data: facilities, error: facError } = await client
    .from("facilities")
    .select(EXPLICIT_COLUMNS.FACILITIES);
  results.facilitiesQuery = {
    durationMs: Date.now() - startFac,
    success: !facError && Array.isArray(facilities) && facilities.length > 0,
    count: facilities?.length ?? 0,
    error: facError?.message ?? null,
  };

  // 3. Query PR challenges using explicit columns
  const startChall = Date.now();
  const { data: challenges, error: challError } = await client
    .from("pr_challenges")
    .select(EXPLICIT_COLUMNS.PR_CHALLENGES);
  results.challengesQuery = {
    durationMs: Date.now() - startChall,
    success: !challError && Array.isArray(challenges) && challenges.length > 0,
    count: challenges?.length ?? 0,
    error: challError?.message ?? null,
  };

  // 4. Test 10-State Envelopes
  const testData = { athlete: "Adam Arête", ready: true };
  const successEnv: TenStateEnvelope<typeof testData> =
    createSuccessState(testData);
  const loadingEnv = createLoadingState<typeof testData>(3, null);
  results.tenStateEnvelopes = {
    successStatus: successEnv.status,
    loadingStatus: loadingEnv.status,
    allStatesValid: successEnv.status === "success" && loadingEnv.status === "loading",
  };

  // 5. Test Fee Calculator
  const oneTimePassFee = calculateHybridServiceFee(250, "one_time_pass");
  const recurringSubFee = calculateHybridServiceFee(1500, "recurring_subscription");
  results.feeCalculator = {
    oneTimePass: {
      expected: 265, // 250 + 15
      actual: oneTimePassFee.totalChargePhp,
      valid: oneTimePassFee.totalChargePhp === 265,
    },
    recurringSub: {
      expected: 1575, // 1500 + 75 (5%)
      actual: recurringSubFee.totalChargePhp,
      valid: recurringSubFee.totalChargePhp === 1575,
    },
  };

  // 6. Test Hard Limits & Constants
  results.constantsCheck = {
    otpLength: SODIA_FIELD_LIMITS.OTP_CODE_LENGTH === 6,
    qrTtl: SODIA_FIELD_LIMITS.QR_DYNAMIC_HASH_TTL_SECONDS === 60,
    postCaptionLimit: SODIA_FIELD_LIMITS.POST_CAPTION_MAX_CHARS === 280,
    defaultStreakGoal: HYBRID_FEE_MODEL.DEFAULT_STREAK_GOAL_PER_WEEK === 3,
  };

  const allPassed =
    results.clientInitialized &&
    results.facilitiesQuery.success &&
    results.challengesQuery.success &&
    results.tenStateEnvelopes.allStatesValid &&
    results.feeCalculator.oneTimePass.valid &&
    results.feeCalculator.recurringSub.valid;

  return { allPassed, results };
}

// Direct execution when invoked via tsx/node
runFullEcosystemQA()
  .then((report) => {
    console.log(JSON.stringify(report, null, 2));
    if (!report.allPassed) {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error("QA execution failed:", err);
    process.exit(1);
  });
