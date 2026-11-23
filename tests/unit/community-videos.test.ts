import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {validateVideoFile,MAX_VIDEO_BYTES,validCommunityVideoUrl} from '@/lib/media';
import CommunityMedia from '@/components/shared/CommunityMedia';
it('valida vídeo por formato e limite de tamanho',()=>{
 for(const type of ['video/mp4','video/webm'])assert.doesNotThrow(()=>validateVideoFile({type,size:MAX_VIDEO_BYTES}));
 for(const size of [0,MAX_VIDEO_BYTES+1])assert.throws(()=>validateVideoFile({type:'video/mp4',size}));
 assert.throws(()=>validateVideoFile({type:'text/html',size:10}));
});
it('reproduz apenas uploads do Storage configurado, com controles e sem autoplay',()=>{
 const previous=process.env.NEXT_PUBLIC_SUPABASE_URL;
 process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';
 try{
 const url='https://example.supabase.co/storage/v1/object/public/user-media/11111111-1111-4111-8111-111111111111/community-videos/22222222-2222-4222-8222-222222222222.mp4';
 assert.equal(validCommunityVideoUrl(url),true);
 assert.equal(validCommunityVideoUrl(url.replace('example.supabase.co','untrusted.test')),false);
 assert.equal(validCommunityVideoUrl(url+'?other=true'),false);
 const html=renderToStaticMarkup(React.createElement(CommunityMedia,{video:url,author:'Atleta'}));
 assert.match(html,/<video/);assert.match(html,/controls=""/);assert.match(html,/preload="none"/);assert.doesNotMatch(html,/autoplay/);
 }finally{if(previous===undefined)delete process.env.NEXT_PUBLIC_SUPABASE_URL;else process.env.NEXT_PUBLIC_SUPABASE_URL=previous;}
});
it('persiste vídeo no post, protege alterações e inclui o player no perfil',()=>{
 const service=readFileSync('services/communityService.ts','utf8');
 assert.match(service,/video_url: post.video_url/);assert.match(service,/video_url: dbRow.video_url/);
 const sql=readFileSync('supabase/migrations/20261123020000_community_videos.sql','utf8');
 assert.match(sql,/NEW.video_url:=OLD.video_url/);assert.match(sql,/AS RESTRICTIVE FOR INSERT/);
 assert.match(sql,/8388608/);assert.match(sql,/52428800/);
 assert.match(readFileSync('components/community-author-profile.tsx','utf8'),/video=\{post.video_url\}/);
 assert.ok(existsSync('public/community/treino-coletivo.jpg'));
});
