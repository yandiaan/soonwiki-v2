/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
  readonly PUBLIC_SITE_URL: string;
  readonly OPENROUTER_API_KEY?: string;
  readonly OPENROUTER_MODEL?: string;
  readonly OPENROUTER_FALLBACK_MODEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    requestId: string;
  }
}
