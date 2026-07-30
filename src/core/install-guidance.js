// v0.62.0 — Add-to-Home-Screen guidance.
//
// Root cause this addresses: several rounds of this session's own CSS-cascade
// debugging (fixed tabbar positioning, safe-area insets, viewport height)
// exist because Safari's own browser chrome (address bar, bottom toolbar)
// competes with the app's fixed-position UI when the app is used as an
// ordinary browser tab. manifest.webmanifest already declares
// "display":"standalone" — installing to the Home Screen removes that
// competing chrome entirely. Rather than keep fighting viewport edge cases
// indefinitely, this gives the person using the app in a normal browser tab
// a one-time, honest explanation of why installing helps, with instructions
// specific to their platform.

export function detectPlatform(userAgent = ''){
  const ua = String(userAgent || '');
  if(/iphone|ipad|ipod/i.test(ua)) return 'ios';
  if(/android/i.test(ua)) return 'android';
  return 'other';
}

export function describeInstallGuidance({ isStandalone = false, platform = 'other' } = {}){
  if(isStandalone) return null;
  if(platform === 'ios'){
    return {
      headline: 'Add Strategos to your Home Screen',
      body: 'Tap the Share icon, then "Add to Home Screen". This removes Safari’s browser bar so the organism and navigation display correctly, full-screen.'
    };
  }
  if(platform === 'android'){
    return {
      headline: 'Install Strategos',
      body: 'Open your browser menu and choose "Add to Home screen" or "Install app" for the full, distraction-free experience.'
    };
  }
  return {
    headline: 'Install Strategos',
    body: 'Use your browser’s "Add to Home Screen" or "Install app" option for the full, distraction-free experience.'
  };
}
