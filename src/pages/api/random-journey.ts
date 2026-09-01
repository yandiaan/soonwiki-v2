import type { APIRoute } from 'astro';

import { getRandomProfileSlug } from '@/lib/server/public-repository';
import { paths } from '@/lib/shared/paths';

export const prerender = false;

export const GET: APIRoute = async (context) => {
  try {
    const slug = await getRandomProfileSlug(context);
    if (slug) {
      return context.redirect(paths.profile(slug), 302);
    }
  } catch {
    // Fallback if database is unreachable
  }
  return context.redirect(paths.explore(), 302);
};
