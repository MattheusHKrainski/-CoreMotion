export function communityPostUrl(origin: string, postId: string): string {
  const url = new URL('/', origin);
  url.searchParams.set('view', 'community');
  url.searchParams.set('post', postId);
  return url.toString();
}
