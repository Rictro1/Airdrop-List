import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const api = axios.create({ baseURL: API_BASE_URL });

export type Airdrop = {
  id: number;
  name: string;
  xHandle: string;
  websiteUrl: string;
  info: string;
  logoUrl?: string | null;
  status: 'FINISHED' | 'NOT_FINISHED';
  tasks: Task[];
};

export type Task = {
  id: number;
  title: string;
  done: boolean;
  airdropId: number;
};

export type Faucet = { id: number; name: string; logoUrl?: string | null; linkUrl: string; status: boolean };
export type Waitlist = { id: number; name: string; logoUrl?: string | null; linkUrl: string; status: boolean };

export function twitterHandleToAvatarUrl(handleOrUrl: string): string {
  // If user pastes a full X profile URL, extract handle
  const url = handleOrUrl.trim();
  let handle = url;
  try {
    if (url.startsWith('http')) {
      const u = new URL(url);
      handle = u.pathname.replace(/\//g, '');
    }
  } catch {}
  handle = handle.replace(/^@/, '');
  // Use unavatar for simplicity; it resolves X avatars server-side
  return `https://unavatar.io/x/${encodeURIComponent(handle)}`;
}


