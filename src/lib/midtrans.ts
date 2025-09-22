// src/lib/midtrans.ts
// Utility to dynamically load Midtrans Snap.js on the client

export function loadSnap(clientKey: string, isProduction = false): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();

    // Already loaded
    if ((window as any).snap) return resolve();

    if (!clientKey) return reject(new Error('Missing NEXT_PUBLIC_MIDTRANS_CLIENT_KEY'));

    const script = document.createElement('script');
    script.src = isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', clientKey);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Midtrans Snap.js'));

    document.head.appendChild(script);
  });
}
