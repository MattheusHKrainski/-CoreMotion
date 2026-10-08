import { redirect } from 'next/navigation';

// A apresentação agora vive em um arquivo .html autônomo (estilo PowerPoint),
// servido estaticamente a partir de public/apresentacao.html.
export default function ApresentacaoPage() {
  redirect('/apresentacao.html');
}
