export const paths = {
  home: () => '/',
  about: () => '/#tentang',
  explore: () => '/explore',
  memories: () => '/memories',
  memoryDetail: (id: string) => `/memories/${id}`,
  profile: (slug: string) => `/people/${slug}`,
  field: (slug: string) => `/field/${slug}`,
  batch: (generationKey: string) => `/batch/${generationKey}`,
  place: (slug: string) => `/place/${slug}`,
  me: () => '/me',
  meEdit: () => '/me/edit',
  feedback: () => '/feedback',
  admin: () => '/admin',
  adminFeedback: () => '/admin/feedback',
  login: () => '/login',
  logout: () => '/auth/logout',
  join: (token: string) => `/join/${token}`,
};

export interface NavigationLink {
  href: string;
  label: string;
}

export const navigationLinks: NavigationLink[] = [
  { href: paths.home(), label: 'Beranda' },
  { href: paths.explore(), label: 'Jelajahi' },
  { href: paths.memories(), label: 'Kenangan' },
  { href: paths.about(), label: 'Tentang' },
  { href: paths.login(), label: 'Masuk' },
];

export function publicStorageUrl(
  bucket: 'profile-photos' | 'proud-moments' | 'memories',
  path: string,
): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  if (bucket === 'memories' && path.includes('1788287546105-c2d63702.mp4')) {
    return `/memories/${path}`;
  }
  const base = (import.meta.env.PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

export function mediaStreamUrl(
  bucket: 'memories' | 'profile-photos' | 'proud-moments',
  path: string,
): string {
  return publicStorageUrl(bucket, path);
}
