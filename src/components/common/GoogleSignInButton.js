import { useEffect, useRef } from 'react';
import { authService } from '../../services/authService';

// Fallback: You can hardcode your client ID here if env variables aren't working
const HARDCODED_CLIENT_ID = '1087857363657-puoamnl1p7q92avg0h1agk206g0e4hsg.apps.googleusercontent.com';

function getGoogleClientId() {
  // Try hardcoded first
  if (HARDCODED_CLIENT_ID && HARDCODED_CLIENT_ID !== 'YOUR_CLIENT_ID_HERE') {
    return HARDCODED_CLIENT_ID;
  }
  // Try env variables
  if (typeof process !== 'undefined' && process.env?.REACT_APP_GOOGLE_CLIENT_ID) {
    return process.env.REACT_APP_GOOGLE_CLIENT_ID;
  }
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }
  // Try window variable
  if (typeof window !== 'undefined' && window.__GOOGLE_CLIENT_ID) {
    return window.__GOOGLE_CLIENT_ID;
  }
  // Try meta tag
  if (typeof document !== 'undefined') {
    const meta = document.querySelector('meta[name="google-client-id"]');
    if (meta?.content) {
      return meta.content;
    }
  }
  return null;
}

function GoogleSignInButton({ onSuccess, onError }) {
  const btnRef = useRef(null);

  useEffect(() => {
    const clientId = getGoogleClientId();
    console.log('Google Client ID check:', { clientId, hasGoogle: !!window.google });
    
    if (!clientId) {
      onError?.(new Error('Google client ID not configured'));
      return;
    }
    let cancelled = false;
    const tryInitialize = () => {
      if (cancelled || !btnRef.current) return false;
      if (!window.google) return false;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            try {
              const data = await authService.googleAuth(credential);
              onSuccess?.(data);
            } catch (e) {
              onError?.(e);
            }
          },
        });

        window.google.accounts.id.renderButton(btnRef.current, { theme: 'outline', size: 'large', width: 320 });
        return true;
      } catch (e) {
        onError?.(e);
        return true;
      }
    };

    if (tryInitialize()) {
      return () => {
        cancelled = true;
      };
    }

    const interval = setInterval(() => {
      if (tryInitialize()) {
        clearInterval(interval);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [onSuccess, onError]);

  return <div ref={btnRef} />;
}

export default GoogleSignInButton;
