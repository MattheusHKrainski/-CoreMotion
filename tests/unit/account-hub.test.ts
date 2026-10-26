import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

it('usa o avatar como acesso à conta e remove o atalho enganoso de favoritos', () => {
  const sidebar = readFileSync('components/shared/Sidebar.tsx', 'utf8');
  assert.match(sidebar, /aria-label="Abrir minha conta"/);
  assert.match(sidebar, /Minha conta →/);
  assert.doesNotMatch(sidebar, /Meus Favoritos/);
  assert.match(sidebar, /ACCOUNT_TYPES\[user.account_type\].label/);
});
it('a conta lista os favoritos e produtos pertencentes ao usuário, e mantém pedidos e currículo', () => {
  const account = readFileSync('components/ProfileView.tsx', 'utf8');
  assert.match(account, /favorites.includes\(p.id\)/);
  assert.match(account, /p.seller_id === user.id/);
  assert.match(account, /o.user_id === userId/);
  assert.match(account, /canAccessSports\(user\)/);
  for (const label of ['Meu carrinho', 'Meus produtos à venda', 'Pedidos feitos', 'Sair da conta']) assert.ok(account.includes(label));
});
