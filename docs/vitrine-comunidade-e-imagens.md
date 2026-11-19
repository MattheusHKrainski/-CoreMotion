# Vitrine direta, comunidade e imagens

## Interface

- O site abre diretamente a home com destaques, produtos e ofertas, sem a página de boas-vindas. Login, cadastro e contas salvas continuam em um diálogo sobre a página; visitantes não precisam entrar para explorar.
- A venda começa com uma galeria vazia e captura pela câmera. Não existe foto pronta para publicar acidentalmente, campo de URL no anúncio nem campo de tempo de uso. O texto principal é **Descrição**. A validação exige pelo menos uma foto e mantém telefone, preço e descrição obrigatórios.
- A captura usa `getUserMedia`, solicita câmera traseira quando disponível, mostra prévia e permite capturar/cancelar. A câmera é liberada ao sair da tela. É necessário HTTPS e permissão do navegador. O painel embutido do preview pode negar câmera por política do contêiner; nesse caso, a interface orienta abrir o site em uma aba separada. Não é possível atestar autenticidade da captura apenas com código do navegador; câmera virtual, alterações no cliente e chamadas diretas à API não são bloqueadas por essa interface.
- Comunidade com abas **Para você**, **Seguindo** e **Minhas publicações**, filtro por assunto e ações de curtir, responder, compartilhar a página e denunciar. Seguir/deixar de seguir atualiza o banco antes de refletir sucesso. O formulário fixo foi removido: **Publicar** abre um diálogo separado com conteúdo, título opcional, assunto e imagem opcional (arquivo ou HTTPS).
- Dados pessoais permitem importar imagem ou usar um link HTTPS para foto de perfil. Salvar confirma a alteração em `profiles.avatar_url`; o avatar aparece na navegação, no perfil e nas novas publicações/comentários. Publicações antigas de outros autores podem continuar com a imagem registrada na época da postagem.
- Cartões de profissionais exibem formação, metodologia, localização, horários e contato publicado pelo próprio treinador, com link adequado para WhatsApp, e-mail ou HTTPS. Não foram inventados telefones para perfis que não os possuem. O fluxo anterior de agendamento sem integração foi substituído por informações, sem alegar envio de pedido inexistente.

## Supabase

Migrações aplicadas: `social_media_and_follows` e `follow_target_validation`.

- `community_follows`: par único de seguidor/seguido, chaves estrangeiras com exclusão em cascata, proibição de seguir a si mesmo e RLS. A conta pode ler/remover apenas suas relações e criar apenas relações em seu próprio nome, se ambas as contas estiverem ativas.
- A função `community_follow_allowed` valida elegibilidade sem abrir leitura da tabela privada `profiles`. É `SECURITY DEFINER` com caminho de busca fixo e execução somente para autenticados.
- Bucket público `user-media`, até 8 MB, MIME JPEG/PNG/WebP. O cliente verifica usuário real, decodifica a imagem, limita dimensões e reencoda em JPEG antes do envio (sem metadados EXIF/GPS do arquivo original).
- Escrita/remoção de objetos limitada à pasta do UUID autenticado; contas suspensas não podem enviar. Leitura pública é intencional para imagens publicadas de anúncios, perfis e comunidade. Não enviar documentos ou imagens privadas.
- As imagens não são salvas em base64 nem apenas no cache do navegador. A URL pública persistente fica no registro correspondente. Fotos importadas ainda sem anúncio/post publicado podem deixar objetos sem referência; exclusão visual de uma imagem não é uma rotina de expurgo físico de arquivos.

## Validação

- Testes unitários de entrada direta, feed, captura, imagens, contatos e perfil.
- Testes PostgreSQL em PGlite: 20 verificações adicionais de RLS, perfis privados, relações, falsificação de identidade, contas suspensas e propriedade de imagens.
- `tests/browser/storefront-social.mjs`: Chromium com SDK Supabase real, HTTP controlado e câmera virtual. Exercita entrada direta, seguir/deixar de seguir, feeds, publicação com imagem, upload/salvamento de avatar, rejeição de anúncio sem foto, captura, publicação e contato do treinador. Não é uma compra ou teste de autenticação real em produção.
- O teste existente de contas salvas continua cobrindo login/cadastro, troca de contas, retorno sem senha e remoção com confirmação.

Reprodução (com o preview na porta 3000):

```sh
npm install --prefix .cache/session-ui --no-audit --no-fund playwright-core @sparticuz/chromium
node tests/browser/storefront-social.mjs
MOBILE=1 node tests/browser/storefront-social.mjs
npm run test:unit
npm run test:db
```
