import { it } from 'node:test';
import assert from 'node:assert/strict';
import { signupErrorMessage, MIN_PASSWORD_LENGTH } from '@/lib/signup-validation';
import { readFileSync } from 'node:fs';
it('explica o mínimo antes do envio e aplica apenas ao cadastro', () => {
  assert.equal(MIN_PASSWORD_LENGTH, 6);
  const source = readFileSync('components/auth/AuthModal.tsx', 'utf8');
  assert.match(source, /Mínimo de 6 caracteres/);
  assert.match(source, /minLength=\{authModalMode === 'register' \? MIN_PASSWORD_LENGTH : undefined\}/);
  assert.match(source, /aria-describedby=.*signup-password-help/);
});
it('traduz erros de cadastro sem expor mensagens internas', () => {
  assert.match(signupErrorMessage({ code: 'weak_password' }), /6 caracteres/);
  assert.match(signupErrorMessage({ code: 'user_already_exists' }), /Faça login/);
  assert.match(signupErrorMessage({ code: 'email_address_invalid' }), /e-mail informado não é válido/);
  assert.match(signupErrorMessage({ status: 429 }), /Aguarde/);
  assert.match(signupErrorMessage({ code: 'signup_disabled' }), /temporariamente desativado/);
  assert.match(signupErrorMessage({ status: 503 }), /serviço de cadastro/);
  assert.doesNotMatch(signupErrorMessage({ message: 'sensitive internal SQL details' }), /SQL|sensitive|Verifique os dados/);
});

it('distingue falhas da configuração de envio de erros nos dados do usuário', () => {
  const quota = signupErrorMessage({ code: 'over_email_send_rate_limit', status: 429 });
  assert.match(quota, /Não foi possível concluir o cadastro/);
  assert.match(quota, /problema do serviço, não dos seus dados/);
  assert.doesNotMatch(quota, /alguns minutos|corrigidos sem reenviar|Conta criada/);
  const restricted = signupErrorMessage({ code: 'email_address_not_authorized', status: 403 });
  assert.match(restricted, /serviço de confirmação/);
  assert.match(restricted, /não significa que seu e-mail seja inválido/);
});
