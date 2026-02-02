// config/adConfig.js
export const AdConfig = {
  // Replace these with your actual Ad Unit IDs from AdMob
  bannerId: 'ca-app-pub-3990448886293370/4801361884', // Banner Ad Unit ID
  interstitialTestResultId: 'cca-app-pub-3990448886293370/2491618037', // Test Result Interstitial
  interstitialExtraTestId: 'ca-app-pub-3990448886293370/1178536366', // Extra Test Interstitial
  interstitialExtraChapterId: 'ca-app-pub-3990448886293370/2396684031', // Extra Chapter Interstitial

  // Test IDs (use these for development/testing)
  testBannerId: 'ca-app-pub-3940256099942544/6300978111',
  testInterstitialId: 'ca-app-pub-3940256099942544/1033173712',
};

// Set to false when you want to use real ads
export const USE_TEST_ADS = false; // Change to false for production

export function getBannerId() {
  return USE_TEST_ADS ? AdConfig.testBannerId : AdConfig.bannerId;
}

export function getInterstitialTestResultId() {
  return USE_TEST_ADS ? AdConfig.testInterstitialId : AdConfig.interstitialTestResultId;
}

export function getInterstitialExtraTestId() {
  return USE_TEST_ADS ? AdConfig.testInterstitialId : AdConfig.interstitialExtraTestId;
}

export function getInterstitialExtraChapterId() {
  return USE_TEST_ADS ? AdConfig.testInterstitialId : AdConfig.interstitialExtraChapterId;
}
