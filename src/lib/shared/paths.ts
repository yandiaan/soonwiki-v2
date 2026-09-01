export const paths = {
  home: () => '/',
  about: () => '/#tentang',
  explore: () => '/explore',
  profile: (slug: string) => `/people/${slug}`,
  field: (slug: string) => `/field/${slug}`,
  batch: (year: number) => `/batch/${year}`,
  place: (slug: string) => `/place/${slug}`,
  me: () => '/me',
  meEdit: () => '/me/edit',
  admin: () => '/admin',
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
  { href: paths.about(), label: 'Tentang' },
  { href: paths.login(), label: 'Masuk' },
];

export function publicStorageUrl(bucket: 'profile-photos' | 'proud-moments', path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  const base = (import.meta.env.PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
