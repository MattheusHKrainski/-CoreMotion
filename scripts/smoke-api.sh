#!/usr/bin/env bash
# Teste de fumaça de autorização nas rotas /api do CoreMotiom.
#
# Para cada rota protegida, verifica que:
#   1. sem token, a resposta é 401 (mesmo com corpo inválido ou vazio);
#   2. com token forjado (assinatura inválida), a resposta também é 401.
#
# Não depende de banco de dados: a validação de sessão ocorre antes de qualquer consulta.
#
# Uso (com o servidor no ar, por exemplo "npm run start"):
#   BASE_URL=http://localhost:3000 bash scripts/smoke-api.sh

set -u

BASE_URL="${BASE_URL:-http://localhost:3000}"
FAKE_TOKEN="eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTQwMDAtODAwMC0wMDAwMDAwMDAwMDAiLCJyb2xlIjoiYWRtaW4ifQ.assinatura-falsa"

pass=0
fail=0

check() {
  local method="$1" path="$2" expected="$3" token="${4:-}"
  local label="sem token"
  local -a args=(-s -o /dev/null -w '%{http_code}' -X "$method" "$BASE_URL$path" -H 'Content-Type: application/json' --data '{}')
  if [ -n "$token" ]; then
    args+=(-H "Authorization: Bearer $token")
    label="token forjado"
  fi
  local code
  code="$(curl "${args[@]}")"
  if [ "$code" = "$expected" ]; then
    pass=$((pass + 1))
    echo "PASS  $method $path ($label) -> $code"
  else
    fail=$((fail + 1))
    echo "FAIL  $method $path ($label) -> $code (esperado $expected)"
  fi
}

PROTECTED_ROUTES=(
  "POST /api/auth/sync"
  "POST /api/products"
  "PATCH /api/products"
  "DELETE /api/products"
  "POST /api/stores"
  "PATCH /api/stores"
  "GET /api/users"
  "PATCH /api/users"
  "DELETE /api/users"
)

echo "Alvo: $BASE_URL"
echo
echo "== Rotas protegidas sem token (esperado 401) =="
for route in "${PROTECTED_ROUTES[@]}"; do
  # shellcheck disable=SC2086
  check $route 401
done

echo
echo "== Rotas protegidas com token forjado (esperado 401) =="
for route in "${PROTECTED_ROUTES[@]}"; do
  # shellcheck disable=SC2086
  check $route 401 "$FAKE_TOKEN"
done

echo
echo "Resultado: $pass aprovados, $fail reprovados."
[ "$fail" -eq 0 ]
