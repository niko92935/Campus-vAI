import { Platform } from 'react-native';

const explicitUrl = process.env.EXPO_PUBLIC_API_URL;

const fallbackUrl =
  Platform.OS === 'web' ? 'http://localhost:4000' : 'https://niko.tailf5f9d7.ts.net';

export const API_BASE_URL = (explicitUrl || fallbackUrl).replace(/\/+$/, '');

/**
 * Ask the MindLink backend whether a newer JS bundle is available.
 * The request is deliberately short-lived so the profile screen never hangs
 * when the student is offline.
 */
export async function checkForUpdate(clientVersion = '1.0.0', timeoutMs = 4500) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => {
    if (controller) controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(`${API_BASE_URL}/api/ota/check`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller ? controller.signal : undefined,
    });

    if (!response.ok) {
      throw new Error(`Update server returned ${response.status}`);
    }

    const data = await response.json();
    return {
      ok: true,
      updateAvailable: Boolean(data.updateAvailable),
      version: data.currentVersion || clientVersion,
      bundleUrl: data.bundleUrl || '',
      message: data.message || '',
    };
  } finally {
    clearTimeout(timer);
  }
}
