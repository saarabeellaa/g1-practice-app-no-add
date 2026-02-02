// hooks/useInterstitialAd.js
import { useEffect, useState } from 'react';
import { InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

export function useInterstitialAd(adUnitId) {
  const [interstitial, setInterstitial] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    // Event listeners
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('Interstitial ad loaded');
      setLoaded(true);
    });

    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('Interstitial ad closed');
      setLoaded(false);
      ad.load(); // Reload ad for next time
    });

    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('Interstitial ad error:', error);
      setLoaded(false);
    });

    // Load the ad
    ad.load();
    setInterstitial(ad);

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, [adUnitId]);

  const showAd = async (callback) => {
    if (loaded && interstitial) {
      try {
        await interstitial.show();
        // Callback is called after ad is closed (via CLOSED event)
      } catch (error) {
        console.log('Error showing interstitial ad:', error);
        if (callback) callback();
      }
    } else {
      console.log('Interstitial ad not loaded yet');
      if (callback) callback();
    }
  };

  return { showAd, loaded };
}
