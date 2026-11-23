// Public scheduler trigger: ignores ALL caller input. Only server-selected,
// expired trash entries can be purged. No credentials or account data returned.
import { createClient } from 'npm:@supabase/supabase-js@2';
Deno.serve(async (req) => {
 if (req.method !== 'POST') return new Response('Method not allowed', {status:405});
 const sb=createClient(Deno.env.get('SUPABASE_URL'),Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:due,error}=await sb.from('account_trash').select('user_id,purge_after').lte('purge_after',new Date().toISOString()).order('purge_after').limit(10);
 if(error)return new Response('Cleanup unavailable',{status:503});
 let failed=false;
 for(const entry of due||[]){
  try{
   if(!/^[0-9a-f-]{36}$/i.test(entry.user_id)||Date.parse(entry.purge_after)>Date.now())throw new Error('Invalid queue entry');
   const bucket=sb.storage.from('user-media'), files=[];let requests=0;
   async function collect(prefix,depth){
    if(depth>8)throw new Error('Folder limit');
    for(let offset=0;;offset+=100){
     if(++requests>1000)throw new Error('File limit');
     const result=await bucket.list(prefix,{limit:100,offset,sortBy:{column:'name',order:'asc'}});
     if(result.error||!result.data)throw new Error('Storage list failed');
     for(const item of result.data){if(item.name.includes('/')||item.name==='.'||item.name==='..')throw new Error('Unsafe path');const path=`${prefix}/${item.name}`;if(item.id)files.push(path);else await collect(path,depth+1);}
     if(result.data.length<100)break;
    }
   }
   await collect(entry.user_id,0);
   for(let offset=0;offset<files.length;offset+=100){const batch=files.slice(offset,offset+100);const result=await bucket.remove(batch);if(result.error||result.data?.length!==batch.length)throw new Error('Storage removal failed');}
   // Auth deletion cascades through profile, content, interactions and appeal records.
   const deleted=await sb.auth.admin.deleteUser(entry.user_id);
   if(deleted.error)throw new Error('Auth deletion failed');
   const audit=await sb.from('moderation_audit').insert({actor_id:null,action:'account_purge',target_id:entry.user_id,reason:'Prazo de 30 dias encerrado; exclusão automática.'});
   if(audit.error)console.error('Account purge audit failed');
  }catch{failed=true;console.error('Account trash cleanup failed; retained for retry.');}
 }
 return new Response(failed?'Cleanup will retry':'Cleanup complete',{status:failed?503:200});
});
