// src/lib/monitoring.ts

/**
 * LogRocket Session Replay & Telemetry Initialization
 */
export function initLogRocket() {
  if (typeof window !== 'undefined') {
    // Only import and initialize on the client side
    import('logrocket').then((LogRocket) => {
      // Use mock app ID if real one is not provided in env
      const appID = process.env.NEXT_PUBLIC_LOGROCKET_ID || 'mock_org/mock_app';
      
      LogRocket.default.init(appID, {
        network: {
          requestSanitizer: (request) => {
            // Scrub sensitive headers/data
            if (request.headers['Authorization']) {
              request.headers['Authorization'] = '***';
            }
            return request;
          },
        },
      });
      
      console.log('LogRocket initialized with App ID:', appID);
    }).catch(err => {
      console.warn('Failed to load LogRocket', err);
    });
  }
}

export function identifyUserInLogRocket(userId: string, email?: string) {
  if (typeof window !== 'undefined') {
    import('logrocket').then((LogRocket) => {
      LogRocket.default.identify(userId, {
        email: email || '',
      });
    });
  }
}
