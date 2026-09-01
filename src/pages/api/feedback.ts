import type { APIRoute } from 'astro';
import { submitFeedback, type FeedbackCategory } from '@/lib/server/feedback-repository';
import { createServerSupabase } from '@/lib/supabase/server';

export const POST: APIRoute = async (context) => {
  const supabase = createServerSupabase(context);

  try {
    const body = (await context.request.json()) as {
      category?: string;
      title?: string;
      description?: string;
      deviceInfo?: string;
    };

    const validCategories: FeedbackCategory[] = ['bug', 'feature', 'general'];
    const category = validCategories.includes(body.category as FeedbackCategory)
      ? (body.category as FeedbackCategory)
      : 'general';

    const result = await submitFeedback(supabase, {
      category,
      title: body.title ?? '',
      description: body.description ?? '',
      deviceInfo: body.deviceInfo,
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.code, message: result.message }), {
        status: result.code === 'UNAUTHORIZED' ? 401 : 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, data: result.data }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'SERVER_ERROR', message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
