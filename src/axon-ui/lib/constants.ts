export const NEURON_MIN_STAKE = 1; // ICP

export const ONE_MINUTES_MS = 60 * 1000;
export const FIVE_MINUTES_MS = 5 * 60 * 1000;
export const ONE_HOUR_MS = 60 * 60 * 1000;
export const FOUR_HOUR_SEC = 4 * 60 * 60;
export const ONE_DAY_SECONDS = 24 * 60 * 60;
export const ONE_WEEK_SECONDS = 7 * ONE_DAY_SECONDS;
export const ONE_YEAR_SECONDS = ((4 * 365 + 1) * ONE_DAY_SECONDS) / 4;
export const ONE_MONTH_SECONDS = ONE_YEAR_SECONDS / 12;
export const MIN_DISSOLVE_DELAY_FOR_VOTE_ELIGIBILITY_SECONDS =
  6 * ONE_MONTH_SECONDS;
export const MAX_DISSOLVE_DELAY_SECONDS = 8 * ONE_YEAR_SECONDS;
export const ONE_WEEK_NS = BigInt(ONE_WEEK_SECONDS * 1e9);
