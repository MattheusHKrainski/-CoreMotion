import { getSupabaseClient } from './supabaseClient';
import { CommunityPost } from '@/lib/types';
import { INITIAL_COMMUNITY_POSTS } from '@/fixtures/initial-data';
import { DEMO_MODE } from '@/lib/demo-mode';

/** Posts de demonstração: só com NEXT_PUBLIC_DEMO_MODE=true (C9). */
const demoPosts = () => (DEMO_MODE ? INITIAL_COMMUNITY_POSTS : []);

const POST_NOT_FOUND = 'Publicação não encontrada ou sem permissão para alterá-la.';

export class CommunityService {
  /** Denúncia: marca a publicação para moderação (RLS: usuário autenticado). */
  static async reportPost(postId: string, reason: string): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: true };
    const { data, error } = await sb
      .from('community_posts')
      .update({ is_reported: true, report_reason: reason.slice(0, 300) })
      .eq('id', postId)
      .select('id');
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) return { success: false, error: POST_NOT_FOUND };
    return { success: true };
  }

  /** Remoção por moderação (RLS: autor da publicação, administrador ou supervisor). */
  static async deletePost(postId: string): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: true };
    const { error } = await sb.from('community_posts').delete().eq('id', postId);
    return error ? { success: false, error: error.message } : { success: true };
  }

  /**
   * Fetches community posts from Supabase or fallback.
   */
  static async getPosts(): Promise<CommunityPost[]> {
    const sb = getSupabaseClient();
    if (!sb) return demoPosts();

    try {
      const { data, error } = await sb
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return demoPosts();
      }

      return data.map(this.mapDbPostToModel);
    } catch {
      return demoPosts();
    }
  }

  /**
   * Creates a community post.
   */
  static async createPost(
    post: {
      title: string;
      content: string;
      category: CommunityPost['category'];
      image_url?: string;
      author_name: string;
      author_avatar?: string;
      author_badge?: string;
    },
    authorId?: string
  ): Promise<{ success: boolean; data?: CommunityPost; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: false, error: 'Supabase indisponível' };

    try {
      const { data, error } = await sb
        .from('community_posts')
        .insert([
          {
            author_id: authorId || null,
            author_name: post.author_name,
            author_avatar: post.author_avatar,
            author_badge: post.author_badge || 'Atleta',
            category: post.category,
            title: post.title,
            content: post.content,
            image_url: post.image_url,
            likes_count: 0,
            comments_count: 0,
            comments: [],
          },
        ])
        .select()
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, data: this.mapDbPostToModel(data) };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Likes a post.
   */
  static async likePost(postId: string): Promise<{ success: boolean; error?: string; likes_count?: number }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: true };

    try {
      const { data: current, error: readError } = await sb
        .from('community_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();
      if (readError || !current) return { success: false, error: readError?.message || POST_NOT_FOUND };

      const likes = (current.likes_count || 0) + 1;
      const { data, error } = await sb
        .from('community_posts')
        .update({ likes_count: likes })
        .eq('id', postId)
        .select('id');
      if (error) return { success: false, error: error.message };
      if (!data || data.length === 0) return { success: false, error: POST_NOT_FOUND };
      return { success: true, likes_count: likes };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  /**
   * Adds a comment to a community post.
   */
  static async addComment(
    postId: string,
    comment: {
      author_name?: string;
      user_name?: string;
      author_avatar?: string;
      user_avatar?: string;
      content: string;
      id?: string;
      created_at?: string;
    }
  ): Promise<{ success: boolean; error?: string }> {
    const sb = getSupabaseClient();
    if (!sb) return { success: true };

    try {
      const { data: current, error: readError } = await sb
        .from('community_posts')
        .select('comments, comments_count')
        .eq('id', postId)
        .single();
      if (readError || !current) return { success: false, error: readError?.message || POST_NOT_FOUND };

      const newComment = {
        id: comment.id || `c-${Date.now()}`,
        author_name: comment.author_name || comment.user_name || 'Atleta CoreMotion',
        author_avatar: comment.author_avatar || comment.user_avatar,
        content: comment.content,
        created_at: comment.created_at || new Date().toISOString(),
      };
      const existingComments = Array.isArray(current.comments) ? current.comments : [];

      const { data, error } = await sb
        .from('community_posts')
        .update({
          comments: [...existingComments, newComment],
          comments_count: (current.comments_count || 0) + 1,
        })
        .eq('id', postId)
        .select('id');
      if (error) return { success: false, error: error.message };
      if (!data || data.length === 0) return { success: false, error: POST_NOT_FOUND };
      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- linha crua do banco; tipada na correção de pedidos/comunidade
  private static mapDbPostToModel(dbRow: any): CommunityPost {
    const rawComments = Array.isArray(dbRow.comments) ? dbRow.comments : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- comentários crus do JSONB; tipados na correção de comunidade
    const comments = rawComments.map((c: any) => ({
      id: c.id || `c-${Math.random()}`,
      author_name: c.author_name || c.user_name || 'Atleta',
      author_avatar: c.author_avatar || c.user_avatar,
      content: c.content || '',
      created_at: c.created_at || new Date().toISOString(),
    }));

    return {
      id: String(dbRow.id),
      author_id: dbRow.author_id || '',
      author_name: dbRow.author_name || 'Membro CoreMotion',
      author_avatar: dbRow.author_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      author_badge: dbRow.author_badge || 'Atleta',
      category: dbRow.category || 'treino',
      title: dbRow.title || '',
      content: dbRow.content || '',
      image_url: dbRow.image_url,
      likes_count: Number(dbRow.likes_count) || 0,
      comments_count: Number(dbRow.comments_count) || comments.length,
      comments,
      created_at: dbRow.created_at || new Date().toISOString(),
      is_reported: Boolean(dbRow.is_reported),
      report_reason: dbRow.report_reason,
    };
  }
}
