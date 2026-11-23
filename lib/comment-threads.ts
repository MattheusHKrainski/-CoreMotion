import type { CommunityPost } from './types';
type Comment = CommunityPost['comments'][number];
/** Flatten reply depth visually, while retaining the exact reply target. */
export function commentThreads(comments: Comment[]) {
 const byId=new Map(comments.map(comment=>[comment.id,comment]));
 const groups=new Map<string,{root:Comment;replies:Comment[]}>();
 for(const comment of comments){
  let root=comment;const seen=new Set([comment.id]);
  while(root.parent_id && byId.has(root.parent_id) && !seen.has(root.parent_id)){
   root=byId.get(root.parent_id)!;seen.add(root.id);
  }
  // Malformed legacy cycles become standalone comments rather than disappearing.
  if(root.parent_id && seen.has(root.parent_id))root=comment;
  const group=groups.get(root.id)||{root,replies:[]};
  if(comment.id!==root.id)group.replies.push(comment);
  groups.set(root.id,group);
 }
 return [...groups.values()];
}
