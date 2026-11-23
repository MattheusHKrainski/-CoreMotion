import { it } from 'node:test';
import assert from 'node:assert/strict';
import { communityPostUrl } from '@/lib/community-share';
import { readFileSync } from 'node:fs';
it('compartilha a publicação específica sem parâmetros de outras telas', () => {
 const url = new URL(communityPostUrl('https://core.test/compras?token=private', 'post-123'));
 assert.equal(url.pathname,'/');
 assert.equal(url.searchParams.get('view'),'community');
 assert.equal(url.searchParams.get('post'),'post-123');
 assert.equal(url.searchParams.get('token'),null);
});
it('mantém comentários antes da curtida e compartilhar à direita sem a seta', () => {
 const view=readFileSync('components/CommunityView.tsx','utf8');
 assert.ok(!view.includes('<ArrowUp'));
 assert.ok(view.indexOf('<MessageCircle className="h-4 w-4"') < view.indexOf('<Heart aria-hidden'));
 assert.ok(view.indexOf('<Heart aria-hidden') < view.indexOf('<CommunityShare id={post.id}'));
 assert.match(view,/community-post-\$\{post.id\}/);
 assert.match(view,/<CommunityComments/);
 const share=readFileSync('components/community-share.tsx','utf8');
 assert.match(share,/showModal/);
 assert.match(share,/copyText\(url\)/);
 assert.match(share,/navigator.share\(\{title,url\}\)/);
 assert.match(share,/AbortError/);
});
