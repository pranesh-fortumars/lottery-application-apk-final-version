/**
 * Referral System Configuration
 */

export const COMMON_REFERRAL_CODE = 'LOTTERY777';
export const REFERRAL_REWARD = 50;

export const getReferralLink = () => {
  const domain = window.location.origin;
  return `${domain}/signup?ref=${COMMON_REFERRAL_CODE}`;
};
