import {it} from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {invitingCoachProfile} from '@/lib/sports-profile';
import type {SportsRecord} from '@/lib/sports';
import InvitingCoachProfile from '@/components/shared/InvitingCoachProfile';
const invite:SportsRecord={id:'invite',kind:'invite',owner:'sender',data:{recipient:'athlete',profile:'wrong',status:'Aceito'}};
const coach:SportsRecord={id:'coach',kind:'coach',owner:'sender',data:{name:'Treinador real',sport:'Basquete',qualifications:'Formação publicada',contact:'javascript:alert(1)'}};
it('resolve o perfil do remetente exato, não outro perfil ou currículo de atleta',()=>{
 const wrong={...coach,id:'wrong',owner:'other'};
 assert.equal(invitingCoachProfile(invite,[wrong,coach],'athlete'),coach);
 assert.equal(invitingCoachProfile(invite,[wrong,{...coach,kind:'athlete'}],'athlete'),undefined);
 assert.equal(invitingCoachProfile(invite,[coach],'stranger'),undefined);
 assert.equal(invitingCoachProfile({...invite,kind:'application'},[coach],'athlete'),undefined);
});
it('mostra perfil na convocação inclusive respondida e fallback honesto se removido',()=>{
 const render=(records:SportsRecord[],recipientId='athlete')=>renderToStaticMarkup(React.createElement(InvitingCoachProfile,{invite,records,recipientId}));
 assert.match(render([coach]),/Ver perfil profissional do treinador/);
 assert.match(render([coach]),/Formação publicada/);
 assert.doesNotMatch(render([coach]),/href="javascript:/);
 assert.match(render([]),/não possui um perfil profissional publicado/);
 assert.equal(render([coach],'stranger'),'');
});
