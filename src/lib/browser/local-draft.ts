const DRAFT_VERSION = 2;

export interface DraftEnvelope<T> {
  version: number;
  savedAt: string;
  data: T;
}

function draftKey(userId: string): string {
  return `soonwiki:profile-draft:${userId}`;
}

export function saveDraft<T>(userId: string, data: T): void {
  if (typeof window === 'undefined') {
    return;
  }

  const envelope: DraftEnvelope<T> = {
    version: DRAFT_VERSION,
    savedAt: new Date().toISOString(),
    data,
  };

  window.localStorage.setItem(draftKey(userId), JSON.stringify(envelope));
}

export function loadDraft<T>(userId: string): DraftEnvelope<T> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(draftKey(userId));

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DraftEnvelope<T>;
    return parsed.version === DRAFT_VERSION ? parsed : null;
  } catch {
    return null;
  }
}

export function clearDraft(userId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(draftKey(userId));
}
