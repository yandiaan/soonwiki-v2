<script lang="ts">
  let { mode = 'join', invitationToken }: { mode?: 'join' | 'login'; invitationToken?: string } =
    $props();
</script>

<form method="post" action="/auth/google" class="join-with-google">
  <input type="hidden" name="mode" value={mode} />
  {#if invitationToken}
    <input type="hidden" name="invitationToken" value={invitationToken} />
  {/if}
  <button type="submit">Masuk dengan Google</button>
</form>

<style>
  .join-with-google button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding-inline: 1.5rem;
    border: 2px solid var(--ink);
    background: var(--ink);
    color: var(--paper);
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .join-with-google button:focus-visible {
    outline: none;
    box-shadow: var(--focus-ring);
  }
</style>
