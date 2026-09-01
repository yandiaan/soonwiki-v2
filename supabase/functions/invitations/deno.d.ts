// Ambient declarations for the Supabase Edge Function runtime (Deno).
// Only the subset of globals and module specifiers actually used here are declared.

declare namespace Deno {
  const env: {
    get(name: string): string | undefined;
  };
  function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module 'npm:@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}
