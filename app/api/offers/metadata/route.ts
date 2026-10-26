import dns from 'node:dns/promises';
import net from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import { isStaffRole } from '@/lib/permissions';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { readJson } from '@/lib/api-utils';
import { isProductDestination } from '@/lib/offer-catalog';
import { detectStoreNameFromHost } from '@/lib/schemas/offer.schema';

export const dynamic = 'force-dynamic';

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    if (parts[0] === 10 || parts[0] === 127 || parts[0] === 0) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] >= 224) return true;
    return false;
  }
  const lower = ip.toLowerCase();
  return (
    lower === '::1' ||
    lower === '::' ||
    lower.startsWith('fc') ||
    lower.startsWith('fd') ||
    lower.startsWith('fe80') ||
    lower.startsWith('::ffff:127.') ||
    lower.startsWith('::ffff:10.') ||
    lower.startsWith('::ffff:192.168.')
  );
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function extractMeta(html: string, names: string[]): string | undefined {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexes = [
      new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["']`, 'i'),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, 'i'),
    ];
    for (const re of regexes) {
      const match = html.match(re);
      if (match?.[1]) return decodeHtml(match[1]);
    }
  }
  return undefined;
}

/**
 * Extrai automaticamente título, imagem real (og:image), loja e descrição de qualquer link de promoção
 * (AliExpress, Mercado Livre, Amazon, Netshoes, Centauro, Decathlon, Shopee etc.), com proteção anti-SSRF.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (!isStaffRole(auth.ctx.role)) {
    return errorResponse('Somente administradores podem importar metadados de links.', 403);
  }

  const body = await readJson<{ url?: string }>(req);
  const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';
  if (!rawUrl) return errorResponse('Informe o link da promoção.', 400);

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return errorResponse('Link inválido. Use um endereço completo começando com https://', 400);
  }

  if (!isProductDestination(rawUrl)) {
    return errorResponse('Informe o link direto do produto em https://, não uma busca ou categoria.', 400);
  }

  const storeName = detectStoreNameFromHost(parsed.hostname);

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    let response: Response;
    let destination = parsed;
    try {
      for (let redirects = 0; ; redirects++) {
        if (destination.protocol !== 'https:' || destination.username || destination.password) {
          return errorResponse('Redirecionamento de destino não permitido.', 400);
        }
        const addresses = await dns.lookup(destination.hostname, { all: true });
        if (!addresses.length || addresses.some(entry => isPrivateIp(entry.address))) {
          return errorResponse('Endereço de destino não permitido.', 400);
        }
        response = await fetch(destination.toString(), {
          signal: controller.signal,
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CoreMotion/1.0)',
            Accept: 'text/html,application/xhtml+xml',
            'Accept-Language': 'pt-BR,pt;q=0.9',
          },
        });
        if (![301, 302, 303, 307, 308].includes(response.status)) break;
        const location = response.headers.get('location');
        await response.body?.cancel();
        if (!location || redirects >= 4) return errorResponse('Não foi possível confirmar o destino do link.', 422);
        destination = new URL(location, destination);
      }
      if (!response.ok || !isProductDestination(destination.toString())) {
        await response.body?.cancel();
        return errorResponse('O link não abriu uma página de produto válida. Confira o endereço na loja.', 422);
      }
      // Keep the timeout active while reading the response, not just while receiving headers.
      const html = (await response.text()).slice(0, 350_000);
      const productMarkup = /["']@type["']\s*:\s*(?:\[\s*)?["']Product(?:Group)?["']/i.test(html) ||
        /(?:og:type[^>]+content=["'](?:product|og:product)|content=["'](?:product|og:product)["'][^>]+og:type)/i.test(html);
      if (!productMarkup) {
        return NextResponse.json({ success: true, partial: true, metadata: { store_name: detectStoreNameFromHost(destination.hostname) }, warning: 'Não foi possível confirmar dados de produto. Confira título e foto manualmente na loja.' });
      }
    const finalHost = (() => {
      try {
        return destination.hostname;
      } catch {
        return parsed.hostname;
      }
    })();

    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title =
      extractMeta(html, ['og:title', 'twitter:title']) ||
      (titleTagMatch?.[1] ? decodeHtml(titleTagMatch[1]) : undefined);
    const rawImage = extractMeta(html, ['og:image', 'og:image:secure_url', 'twitter:image']);
    const imageUrl = rawImage ? new URL(rawImage, destination).href : undefined;
    const description = extractMeta(html, ['og:description', 'description', 'twitter:description']);
    const rawPrice = extractMeta(html, ['product:price:amount', 'og:price:amount']);
    const parsedPrice = rawPrice ? Number(rawPrice.replace(',', '.')) : undefined;

    return NextResponse.json({
      success: true,
      metadata: {
        store_name: detectStoreNameFromHost(finalHost) || storeName,
        title: title?.slice(0, 180),
        image_url: imageUrl?.startsWith('https://') ? imageUrl : undefined,
        description: description?.slice(0, 800),
        price: parsedPrice && Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : undefined,
      },
    });
    } finally {
      clearTimeout(timeout);
    }
  } catch {
    // Em ambientes sem acesso externo ou se a loja bloquear bot, devolvemos ao menos a loja detectada sem erro 500.
    return NextResponse.json({
      success: true,
      partial: true,
      metadata: {
        store_name: storeName,
      },
    });
  }
}
