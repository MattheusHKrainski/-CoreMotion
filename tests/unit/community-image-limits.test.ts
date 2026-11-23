import {it} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateImageFile,MAX_COMMUNITY_IMAGE_BYTES,MAX_IMAGE_BYTES} from '@/lib/media';
it('aceita até 20 MB na comunidade e mantém 8 MB como padrão',()=>{
 assert.equal(MAX_COMMUNITY_IMAGE_BYTES,20*1024*1024);
 assert.equal(MAX_IMAGE_BYTES,8*1024*1024);
 assert.doesNotThrow(()=>validateImageFile({type:'image/jpeg',size:MAX_COMMUNITY_IMAGE_BYTES},MAX_COMMUNITY_IMAGE_BYTES));
 assert.throws(()=>validateImageFile({type:'image/jpeg',size:MAX_COMMUNITY_IMAGE_BYTES}));
 assert.throws(()=>validateImageFile({type:'image/jpeg',size:MAX_COMMUNITY_IMAGE_BYTES+1},MAX_COMMUNITY_IMAGE_BYTES),/20 MB/);
 assert.throws(()=>validateImageFile({type:'image/svg+xml',size:100},MAX_COMMUNITY_IMAGE_BYTES));
});
it('limite maior é usado só para imagens da comunidade no cliente e servidor',()=>{
 assert.match(readFileSync('services/media.ts','utf8'),/purpose === 'community' \? MAX_COMMUNITY_IMAGE_BYTES : MAX_IMAGE_BYTES/);
 const sql=readFileSync('supabase/migrations/20261123060000_community_larger_images.sql','utf8');
 assert.match(sql,/THEN 20971520 ELSE 8388608 END/);
 assert.match(sql,/52428800/);
});
