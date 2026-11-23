import {it} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {readFileSync} from 'node:fs';
import {moderationTarget} from '@/lib/moderation-target';
import ModerationTargetLink from '@/components/shared/ModerationTargetLink';
it('abre o anúncio correto e codifica IDs sem aceitar URLs externas',()=>{
 assert.equal(moderationTarget('athlete_listing','abc')?.href,'/produto/athlete/abc');
 assert.equal(moderationTarget('external_offer','abc')?.href,'/produto/core/abc');
 assert.equal(moderationTarget('community','one&two')?.href,'/?view=community&post=one%26two');
 assert.ok(moderationTarget('external_offer','https://external.test')?.href.startsWith('/produto/core/https%3A'));
 assert.equal(moderationTarget('trial','id'),null);
 assert.equal(moderationTarget('athlete_listing',' '),null);
});
it('preserva a análise abrindo conteúdo em outra aba com proteção',()=>{
 const html=renderToStaticMarkup(React.createElement(ModerationTargetLink,{category:'athlete_listing',targetId:'abc'}));
 assert.match(html,/Ver anúncio/);assert.match(html,/target="_blank"/);assert.match(html,/noopener noreferrer/);
});
it('adiciona acesso em denúncias, gestão e notificações sem liberar compras suspensas',()=>{
 for(const file of ['components/admin/AdminDashboard.tsx','components/admin/AdminOffersManager.tsx','components/shared/NotificationsInbox.tsx'])assert.match(readFileSync(file,'utf8'),/<ModerationTargetLink/);
 const product=readFileSync('components/commerce/ProductPage.tsx','utf8');
 assert.match(product,/isStaffRole\(user\?\.role\) && !user\?\.is_banned/);
 assert.match(product,/disabled=\{!available \|\| soldOut \|\| variantRequired\}/);
 assert.match(product,/Visualização da equipe/);
});
