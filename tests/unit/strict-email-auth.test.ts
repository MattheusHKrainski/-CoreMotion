import { it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { isValidEmailAddress } from '@/lib/email-validation';

it('aceita provedores comuns e domínios próprios completos', () => {
  for (const email of ['nome@gmail.com', 'nome@hotmail.com', 'nome@outlook.com', 'nome@yahoo.com.br', 'nome+teste@minhaempresa.com.br']) assert.ok(isValidEmailAddress(email), email);
});
it('rejeita e-mails incompletos ou malformados', () => {
  for (const email of ['dsadsa@dsad', 'nome', '@gmail.com', 'nome@gmail', 'nome@.com', 'a..b@gmail.com', 'a@-gmail.com', 'a b@gmail.com', 'a@@gmail.com', 'a@gmail.c']) assert.equal(isValidEmailAddress(email), false, email);
});
it('sem Supabase nunca autentica/cadastra com qualquer senha, nem Admin, mesmo com modo local ativo', () => {
  execFileSync(process.execPath, ['--import', 'tsx', '-e', `
    const assert = require('node:assert/strict');
    global.fetch = () => { throw new Error('Não deve tentar sincronizar sessão inventada'); };
    const { AuthService } = require('./services/auth.ts');
    (async () => {
      for (const email of ['naocadastrado@gmail.com', 'mattheus.h.krainski@gmail.com', 'dsadsa@dsad']) {
        for (const pass of ['', 'qualquer-senha']) {
          const result = await AuthService.loginWithEmail(email, pass);
          assert.equal(result.success, false);
          assert.equal(result.data, undefined);
        }
        const signup = await AuthService.signUpWithEmail(email, 'qualquer-senha', 'Pessoa');
        assert.equal(signup.success, false);
        assert.equal(signup.data, undefined);
      }
      assert.equal((await AuthService.getProfileOrCreate('inventado', 'mattheus.h.krainski@gmail.com')).success, false);
    })().catch(e => {console.error(e); process.exit(1)});
  `], {env: {...process.env, NEXT_PUBLIC_SUPABASE_URL:'', NEXT_PUBLIC_SUPABASE_ANON_KEY:'', NEXT_PUBLIC_DEMO_MODE:'true'}});
});
it('login não mostra convite de novo perfil e senha pode ser exibida nos dois modos', async () => {
  const { readFileSync } = await import('node:fs');
  const source = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.doesNotMatch(source, /Novo por aqui\?|Cadastre-se gratuitamente/);
  assert.match(source, /authModalMode === 'register' && <div className="mb-5/);
  assert.match(source, /type=\{showPassword \? 'text' : 'password'\}/);
  assert.match(source, /showPassword \? 'Ocultar senha' : 'Ver senha'/);
});
