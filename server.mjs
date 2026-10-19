const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
export default {async fetch(request,env){const url=new URL(request.url);try{
if(url.pathname.startsWith('/images/')){const image=IMAGE_ASSETS[url.pathname];if(!image)return new Response('Not found',{status:404});const bytes=Uint8Array.from(atob(image),c=>c.charCodeAt(0));return new Response(bytes,{headers:{'Content-Type':'image/jpeg','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff'}})}
if(url.pathname==='/api/choice'){
if(request.method!=='POST')return json({error:'method'},405);
if(request.headers.get('Origin')!==url.origin)return json({error:'origin'},403);
if(Number(request.headers.get('Content-Length'))>30200)return json({error:'large'},413);
const text=await request.text();if(text.length>30200)return json({error:'large'},413);let b;try{b=JSON.parse(text)}catch{return json({error:'invalid JSON'},400)}
if(!b||b.consent!==true||!/^[-a-f0-9]{36}$/.test(b.id)||!Array.isArray(b.favorites)||!Array.isArray(b.cart)||!Array.isArray(b.events))return json({error:'invalid'},400);
const validIds=a=>a.length<=302&&a.every(i=>Number.isInteger(i)&&i>=1&&i<=302);if(!validIds(b.favorites)||!validIds(b.cart))return json({error:'invalid'},400);
if(b.size!==''&&(!Number.isFinite(Number(b.size))||Number(b.size)<14||Number(b.size)>23))return json({error:'size'},400);
const configs={};const validMetals=['Белое золото','Жёлтое золото','Розовое золото','Платина','Серебро'];for(const [k,c] of Object.entries(b.configs||{})){if(!/^\d+$/.test(k)||Number(k)<1||Number(k)>302||!validMetals.includes(c.metal)||!(c.size===''||Array.from({length:19},(_,i)=>String(14+i*.5)).includes(String(c.size)))||![.25,.5,.75,1,1.5,2,3].includes(Number(c.carat)))return json({error:'config'},400);const validSize=(v,max=26)=>v===''||(typeof v==='string'&&Number(v)>=14&&Number(v)<=max&&Number(v)*2===Math.round(Number(v)*2));for(const key of ['sizeHer','sizeHis'])if(c[key]!==undefined&&!validSize(c[key],key==='sizeHer'?23:26))return json({error:'pair size'},400);for(const key of ['engraving','engravingHer','engravingHis'])if(c[key]!==undefined&&(typeof c[key]!=='string'||Array.from(c[key]).length>30||/[\x00-\x1f\x7f]/.test(c[key])))return json({error:'engraving'},400);if(c.engravingFont!==undefined&&!['classic','script'].includes(c.engravingFont))return json({error:'engraving font'},400);configs[k]={metal:c.metal,size:c.size,carat:c.carat,...Object.fromEntries(['sizeHer','sizeHis','engraving','engravingHer','engravingHis','engravingFont'].filter(key=>c[key]!==undefined).map(key=>[key,c[key]]))}}
const data={id:b.id,name:String(b.name||'').slice(0,40),size:b.size,favorites:[...new Set(b.favorites)],cart:[...new Set(b.cart)],configs,events:b.events.slice(-60).map(e=>({action:String(e.action).slice(0,60),product:Number.isInteger(e.product)&&e.product>=1&&e.product<=302?e.product:null,at:Number.isFinite(Date.parse(e.at))?e.at:new Date().toISOString()})),updatedAt:new Date().toISOString(),consent:true};
await env.BUCKET.put('choices/'+b.id+'.json',JSON.stringify(data),{httpMetadata:{contentType:'application/json'}});return json({ok:true});}
if(url.pathname==='/api/admin'){
if(!env.ADMIN_PASSWORD||request.headers.get('Authorization')!=='Bearer '+env.ADMIN_PASSWORD)return json({error:'unauthorized'},401);
if(request.method==='DELETE'){const id=url.searchParams.get('id');if(!/^[-a-f0-9]{36}$/.test(id||''))return json({error:'id'},400);await env.BUCKET.delete('choices/'+id+'.json');return json({ok:true})}
if(request.method!=='GET')return json({error:'method'},405);
let cursor,objects=[];do{let list=await env.BUCKET.list({prefix:'choices/',limit:1000,cursor});objects.push(...list.objects);cursor=list.truncated?list.cursor:undefined}while(cursor);
const data=await Promise.all(objects.map(async x=>{let item=await env.BUCKET.get(x.key);return item?item.json():null}));return json(data.filter(Boolean).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)));}
if(url.pathname.startsWith('/api/'))return json({error:'not found'},404);
if(!['/','/admin'].includes(url.pathname))return new Response('Not found',{status:404});
return new Response(HTML,{headers:{'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'SAMEORIGIN'}});
}catch{return json({error:'request failed'},500)}}};
