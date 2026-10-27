import { Platform } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

const explicitUrl = process.env.EXPO_PUBLIC_API_URL;

const fallbackUrl =
  Platform.OS === 'web' ? 'http://localhost:8000' : 'https://niko.tailf5f9d7.ts.net';

export const API_BASE_URL = (explicitUrl || fallbackUrl).replace(/\/+$/, '');

const SESSION_KEY = 'mindlink.session';

/* ------------------------------------------------------------------ */
/* Session persistence                                                 */
/* ------------------------------------------------------------------ */

export async function saveSession(session) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadSession() {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

/** Map a backend account onto the fields the app screens already use. */
export function toStudent(user) {
  if (!user) return null;
  const name = user.name || 'Member';
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
  return {
    id: user.rollNumber || `ML-${user.id}`,
    name,
    firstName: name.split(/\s+/)[0],
    initials,
    email: user.email,
    role: user.role || 'student',
    rollNumber: user.rollNumber || '',
    program: user.role === 'teacher' ? 'Teacher · Faculty' : 'Student · Enrolled',
    cohort: user.role === 'teacher' ? 'Faculty Portal' : 'Cohort 12 · Section A',
    joined: 'Recently',
    streak: 0,
    hours: 0,
    averageScore: 0,
    rank: 0,
    weeklyGoal: 5,
    weeklyHours: 0,
  };
}

/* ------------------------------------------------------------------ */
/* Auth API                                                            */
/* ------------------------------------------------------------------ */

const TIMEOUT_MS = 12000;

async function request(path, options = {}) {
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = setTimeout(() => {
    if (controller) controller.abort();
  }, options.timeoutMs || TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller ? controller.signal : undefined,
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }
    const payload = data || {};
    // surfaced shape: { ok, status, code, message, ...payload }
    const message =
      payload.message?.message || payload.message || `Server error (${response.status})`;
    return {
      ok: response.ok,
      status: response.status,
      code: payload.message?.code || payload.code || '',
      message: typeof message === 'string' ? message : 'Unexpected server response',
      data: payload,
    };
  } catch (err) {
    const offline = err?.name === 'AbortError' || String(err?.message || '').includes('aborted');
    return { ok: false, status: 0, code: 'OFFLINE', message: offline ? 'Server not reachable right now.' : 'Network error. Check your connection.' };
  } finally {
    clearTimeout(timer);
  }
}

export async function loginUser(email, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (res.ok && res.data.token) {
    return { ok: true, token: res.data.token, user: res.data.user };
  }
  return { ok: false, code: res.code, status: res.data?.message?.status || res.status, message: res.message };
}

/**
 * filePart: { uri, ... } from expo-image-picker (or plain uri string).
 * Native -> { uri, name, type } for RN FormData; web -> real File.
 */
async function filePart(asset, name) {
  const uri = typeof asset === 'string' ? asset : asset?.uri;
  if (!uri) return null;
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    return new File([blob], name, { type: blob.type || 'image/jpeg' });
  }
  const type = asset?.mimeType === 'image/png' ? 'image/png' : 'image/jpeg';
  return { uri, name, type };
}

export async function registerUser(form, idCardFront, idCardBack) {
  const fd = new FormData();
  fd.append('role', form.role);
  fd.append('name', form.name);
  fd.append('email', form.email);
  fd.append('phone', form.phone);
  fd.append('rollNumber', form.rollNumber);
  fd.append('password', form.password);

  let frontPart = null;
  let backPart = null;
  try {
    frontPart = await filePart(idCardFront, 'id-card-front.jpg');
    backPart = await filePart(idCardBack, 'id-card-back.jpg');
  } catch {
    return { ok: false, message: 'Could not read the selected ID card images.' };
  }
  if (!frontPart || !backPart) {
    return { ok: false, message: 'Both ID card images are required.' };
  }
  fd.append('idCardFront', frontPart);
  fd.append('idCardBack', backPart);

  const res = await request('/api/auth/register', { method: 'POST', body: fd, timeoutMs: 60000 });
  if (res.ok) return { ok: true, data: res.data };
  return { ok: false, message: res.message };
}

/* ------------------------------------------------------------------ */
/* OTA (unchanged for the installed APK)                               */
/* ------------------------------------------------------------------ */

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
  } catch {
    return {
      ok: false,
      updateAvailable: false,
      version: clientVersion,
      bundleUrl: '',
      message: 'Could not reach update server.',
    };
  } finally {
    clearTimeout(timer);
  }
}
