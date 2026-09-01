import type { SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, any, any>;

export type FeedbackCategory = 'bug' | 'feature' | 'general';
export type FeedbackStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface AppFeedbackRow {
  id: string;
  userId: string | null;
  category: FeedbackCategory;
  title: string;
  description: string;
  deviceInfo: string | null;
  status: FeedbackStatus;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  adminNotes: string | null;
}

export interface FeedbackInput {
  category: FeedbackCategory;
  title: string;
  description: string;
  deviceInfo?: string | undefined;
}

export interface FeedbackResult<T> {
  ok: boolean;
  data?: T;
  code?: string;
  message?: string;
}

export async function submitFeedback(
  client: Client,
  input: FeedbackInput,
): Promise<FeedbackResult<AppFeedbackRow>> {
  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    return { ok: false, code: 'UNAUTHORIZED', message: 'Kamu harus masuk terlebih dahulu.' };
  }

  const trimmedTitle = input.title.trim();
  const trimmedDesc = input.description.trim();

  if (trimmedTitle.length < 3 || trimmedTitle.length > 200) {
    return {
      ok: false,
      code: 'INVALID_TITLE',
      message: 'Judul harus terdiri dari 3 hingga 200 karakter.',
    };
  }

  if (trimmedDesc.length < 10 || trimmedDesc.length > 3000) {
    return {
      ok: false,
      code: 'INVALID_DESC',
      message: 'Deskripsi harus terdiri dari 10 hingga 3000 karakter.',
    };
  }

  const { data, error } = await client
    .from('app_feedbacks')
    .insert({
      user_id: user.id,
      category: input.category,
      title: trimmedTitle,
      description: trimmedDesc,
      device_info: input.deviceInfo ?? null,
    })
    .select(
      'id, user_id, category, title, description, device_info, status, created_at, resolved_at, resolved_by, admin_notes',
    )
    .single();

  if (error || !data) {
    return {
      ok: false,
      code: 'DB_ERROR',
      message: 'Gagal mengirim laporan atau request fitur. Coba lagi.',
    };
  }

  return {
    ok: true,
    data: {
      id: data.id,
      userId: data.user_id,
      category: data.category as FeedbackCategory,
      title: data.title,
      description: data.description,
      deviceInfo: data.device_info,
      status: data.status as FeedbackStatus,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at,
      resolvedBy: data.resolved_by,
      adminNotes: data.admin_notes,
    },
  };
}

export async function listMyFeedbacks(client: Client, userId: string): Promise<AppFeedbackRow[]> {
  const { data, error } = await client
    .from('app_feedbacks')
    .select(
      'id, user_id, category, title, description, device_info, status, created_at, resolved_at, resolved_by, admin_notes',
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    category: row.category as FeedbackCategory,
    title: row.title,
    description: row.description,
    deviceInfo: row.device_info,
    status: row.status as FeedbackStatus,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    adminNotes: row.admin_notes,
  }));
}

export async function listAllFeedbacks(
  client: Client,
  statusFilter?: string,
): Promise<AppFeedbackRow[]> {
  let query = client
    .from('app_feedbacks')
    .select(
      'id, user_id, category, title, description, device_info, status, created_at, resolved_at, resolved_by, admin_notes',
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data, error } = await query;

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    userId: row.user_id,
    category: row.category as FeedbackCategory,
    title: row.title,
    description: row.description,
    deviceInfo: row.device_info,
    status: row.status as FeedbackStatus,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    adminNotes: row.admin_notes,
  }));
}

export async function updateFeedbackStatus(
  client: Client,
  feedbackId: string,
  status: FeedbackStatus,
  adminNotes: string | null,
  resolvedBy: string,
): Promise<FeedbackResult<void>> {
  const isResolvedOrClosed = status === 'resolved' || status === 'closed';

  const { error } = await client
    .from('app_feedbacks')
    .update({
      status,
      admin_notes: adminNotes,
      resolved_at: isResolvedOrClosed ? new Date().toISOString() : null,
      resolved_by: isResolvedOrClosed ? resolvedBy : null,
    })
    .eq('id', feedbackId);

  if (error) {
    return { ok: false, code: 'DB_ERROR', message: 'Gagal memperbarui status masukan.' };
  }

  return { ok: true, data: undefined };
}
