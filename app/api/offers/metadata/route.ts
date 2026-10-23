import dns from 'node:dns/promises';
import net from 'node:net';
import { NextRequest, NextResponse } from 'next/server';
import { isStaffRole } from '@/lib/permissions';
import { errorResponse, requireAuth } from '@/lib/server-auth';
import { readJson } from '@/lib/api-utils';
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

  if (parsed.protocol !== 'https:') {
    return errorResponse('Por segurança, use apenas links https://.', 400);
  }

  const storeName = detectStoreNameFromHost(parsed.hostname);

  try {
    const addresses = await dns.lookup(parsed.hostname, { all: true });
    if (addresses.length === 0 || addresses.some((entry) => isPrivateIp(entry.address))) {
      return errorResponse('Endereço de destino não permitido.', 400);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);
    const response = await fetch(parsed.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8',
      },
    }).finally(() => clearTimeout(timeout));

    const html = (await response.text()).slice(0, 350_000);
    const finalHost = (() => {
      try {
        return new URL(response.url || parsed.toString()).hostname;
      } catch {
        return parsed.hostname;
      }
    })();

    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title =
      extractMeta(html, ['og:title', 'twitter:title']) ||
      (titleTagMatch?.[1] ? decodeHtml(titleTagMatch[1]) : undefined);
    const imageUrl = extractMeta(html, ['og:image', 'og:image:secure_url', 'twitter:image']);
    const description = extractMeta(html, ['og:description', 'description', 'twitter:description']);
    const rawPrice = extractMeta(html, ['product:price:amount', 'og:price:amount']);
    const parsedPrice = rawPrice ? Number(rawPrice.replace(',', '.')) : undefined;

    return NextResponse.json({
      success: true,
      metadata: {
        store_name: detectStoreNameFromHost(finalHost) || storeName,
        title: title?.slice(0, 180),
        image_url: imageUrl,
        description: description?.slice(0, 800),
        price: parsedPrice && Number.isFinite(parsedPrice) && parsedPrice > 0 ? parsedPrice : undefined,
      },
    });
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
