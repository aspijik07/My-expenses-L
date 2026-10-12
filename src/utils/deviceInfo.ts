// Device, Browser, and Public IP resolution utilities for Audit Logs

export const getClientDeviceInfo = (): string => {
  if (typeof window === 'undefined') return 'Web Client';

  const ua = navigator.userAgent || '';
  let os = 'Device';
  if (/iPad|iPhone|iPod/.test(ua)) {
    os = 'iPhone (iOS)';
  } else if (/Android/.test(ua)) {
    os = 'Android Phone';
  } else if (/Macintosh|Mac OS X/.test(ua)) {
    os = 'MacBook (macOS)';
  } else if (/Windows NT/.test(ua)) {
    os = 'Windows PC';
  } else if (/Linux/.test(ua)) {
    os = 'Linux Device';
  }

  let browser = 'Browser';
  if (/Chrome|CriOS/.test(ua) && !/Edg/.test(ua)) {
    browser = 'Chrome';
  } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
    browser = 'Safari';
  } else if (/Firefox|FxiOS/.test(ua)) {
    browser = 'Firefox';
  } else if (/Edg/.test(ua)) {
    browser = 'Edge';
  }

  const screenDim = typeof window !== 'undefined' && window.screen 
    ? `${window.screen.width}x${window.screen.height}` 
    : '';

  return screenDim ? `${os} • ${browser} (${screenDim})` : `${os} • ${browser}`;
};

export const fetchClientIp = async (): Promise<string> => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2200);

    // Primary lookup
    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      if (data && data.ip) {
        return data.ip;
      }
    }
  } catch {
    // Failover lookup
    try {
      const controller2 = new AbortController();
      const timer2 = setTimeout(() => controller2.abort(), 2000);
      const res2 = await fetch('https://api64.ipify.org?format=json', {
        signal: controller2.signal,
        cache: 'no-store',
      });
      clearTimeout(timer2);
      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && data2.ip) return data2.ip;
      }
    } catch {
      // Quiet fallback
    }
  }

  return 'Local / Mobile Network';
};
