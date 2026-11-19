import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CoreMotiomProvider } from '@/lib/store';
import CommunityView from '@/components/CommunityView';
import SellC2CView from '@/components/SellC2CView';
import { coachContactUrl } from '@/lib/coach-contact';
import { validateImageFile, validImageUrl, MAX_IMAGE_BYTES } from '@/lib/media';

it('comunidade tem feeds e botão Publicar, sem formulário de publicação aberto no feed', () => {
 const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(CommunityView)));
 for (const text of ['Para você', 'Seguindo', 'Minhas publicações', 'Publicar']) assert.ok(html.includes(text));
 assert.match(html, /role="tablist"/);
 assert.doesNotMatch(html, /<textarea|Título do post \(Ex/);
 const source = readFileSync('components/CommunityView.tsx','utf8');
 assert.match(source, /dialog\?\.showModal\(\)/);
 assert.match(source, /await createCommunityPost/);
 assert.match(source, /await setFollowing/);
 assert.match(source, /following.includes\(post.author_id\)/);
});
it('venda começa sem foto pronta e exige captura sem campo de tempo de uso', () => {
 const html = renderToStaticMarkup(React.createElement(CoreMotiomProvider, null, React.createElement(SellC2CView)));
 assert.match(html, /Tirar foto do produto/); assert.match(html, /Descrição/);
 assert.doesNotMatch(html, /Tempo de Uso|Relato Honesto|Galeria de Fotos \(URL\)/);
 const source = readFileSync('components/SellC2CView.tsx','utf8');
 assert.match(source, /imageGallery.*useState<string\[\]>\(\[\]\)/);
 assert.match(source, /imageGallery.length === 0/);
 const camera = readFileSync('components/shared/CameraPhoto.tsx','utf8');
 assert.match(camera, /getUserMedia/); assert.match(camera, /getTracks\(\).forEach/);
 assert.match(camera, /await uploadImage/);
});
it('valida arquivos e links sem aceitar SVG, dados embutidos, credenciais ou arquivos grandes', () => {
 for (const type of ['image/jpeg','image/png','image/webp']) assert.doesNotThrow(() => validateImageFile({type,size:100}));
 for (const value of [{type:'image/svg+xml',size:100},{type:'image/jpeg',size:0},{type:'image/jpeg',size:MAX_IMAGE_BYTES+1}]) assert.throws(() => validateImageFile(value));
 assert.ok(validImageUrl('https://images.loja.com/foto.jpg'));
 for (const value of ['javascript:alert(1)','data:image/svg+xml,test','http://site.com/a.jpg','https://user:pass@site.com/a.jpg']) assert.equal(validImageUrl(value),false);
});
it('envio de imagens usa identidade verificada, armazenamento persistente e reprocessamento sem EXIF', () => {
 const source = readFileSync('services/media.ts','utf8');
 assert.match(source, /await client.auth.getUser\(\)/);
 assert.match(source, /createImageBitmap/); assert.match(source, /bitmap.close\(\)/);
 assert.match(source, /data.user.id.*purpose/);
 assert.match(source, /storage.from\('user-media'\).upload/);
 assert.match(source, /upsert: false/);
});
it('contato de treinador aceita telefone, email e HTTPS, mas nunca executa protocolos inseguros', () => {
 assert.equal(coachContactUrl('(41) 98891-8146'),'https://wa.me/5541988918146');
 assert.equal(coachContactUrl('coach@gmail.com'),'mailto:coach@gmail.com');
 assert.equal(coachContactUrl('https://site.com/contato'),'https://site.com/contato');
 for (const value of [undefined, '', 'javascript:alert(1)', 'http://site.com', 'https://user:password@site.com/']) assert.equal(coachContactUrl(value),null);
});
it('perfil permite importar foto ou usar link e as fotos aparecem na navegação', () => {
 assert.match(readFileSync('components/ProfileView.tsx','utf8'), /<ImageEditor purpose="avatars"/);
 assert.match(readFileSync('components/shared/ImageEditor.tsx','utf8'), /type="file"/);
 assert.match(readFileSync('components/shared/Sidebar.tsx','utf8'), /<UserAvatar src=\{user\?\.avatar_url\}/);
});
