export function viewTransitionStyle(transitionKey?: string): string | undefined {
  if (!transitionKey) {
    return undefined;
  }

  return `view-transition-name: ${transitionKey}`;
}

export function supportsViewTransitions(): boolean {
  return typeof document !== 'undefined' && 'startViewTransition' in document;
}
