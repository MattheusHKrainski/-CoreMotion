-- Historical counters were larger than the stored JSON comments. Do not fabricate missing comments.
UPDATE public.community_posts SET comments_count=jsonb_array_length(CASE WHEN jsonb_typeof(comments)='array' THEN comments ELSE '[]'::jsonb END) WHERE comments_count IS DISTINCT FROM jsonb_array_length(CASE WHEN jsonb_typeof(comments)='array' THEN comments ELSE '[]'::jsonb END);
