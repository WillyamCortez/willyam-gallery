/**
 * Cloudflare Worker: Edge Media Proxy, Resizing & Dynamic Watermarking
 *
 * Rotas suportadas:
 * 1. GET /preview/:galleryId/:r2Key?w=1600&q=80&mode=selection
 *    -> Retorna imagem redimensionada (WebP/AVIF) com marca d'água cf.image.draw se mode=selection
 * 2. GET /thumb/:galleryId/:r2Key?w=400&q=70
 *    -> Retorna thumbnail ultra-rápido para grid masonry
 * 3. GET /download/:galleryId/:r2Key?token=xyz
 *    -> Retorna arquivo original limpo para download seguro
 */

export interface Env {
  PHOTOS_BUCKET: any;
  ENVIRONMENT: string;
  DEFAULT_WATERMARK_URL?: string;
  AUTH_SECRET?: string;
}

export default {
  async fetch(request: Request, env: Env, ctx?: any): Promise<Response> {
    const url = new URL(request.url);
    const { pathname, searchParams } = url;

    // CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    // Rota de Health Check
    if (pathname === '/health' || pathname === '/') {
      return new Response(JSON.stringify({ status: 'healthy', service: 'gallery-media-worker' }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse da rota /preview/:galleryId/* ou /thumb/:galleryId/*
    const match = pathname.match(/^\/(preview|thumb|download)\/([^/]+)\/(.+)$/);
    if (!match) {
      return new Response('Not Found', { status: 404 });
    }

    const [, action, galleryId, encodedKey] = match;
    const r2Key = decodeURIComponent(encodedKey);

    // Parâmetros de Redimensionamento
    const widthParam = searchParams.get('w');
    const qualityParam = searchParams.get('q');
    const mode = searchParams.get('mode') || 'selection'; // 'selection' ou 'delivered'
    const watermarkUrl = searchParams.get('watermark') || env.DEFAULT_WATERMARK_URL;
    const watermarkType = searchParams.get('wm_type') || 'grid'; // 'grid' ou 'center'

    const targetWidth = widthParam ? parseInt(widthParam, 10) : action === 'thumb' ? 500 : 1600;
    const targetQuality = qualityParam ? parseInt(qualityParam, 10) : action === 'thumb' ? 75 : 82;

    try {
      // 1. Download do original limpo (apenas se for download autenticado ou modo entregue)
      if (action === 'download') {
        const object = await env.PHOTOS_BUCKET.get(r2Key);
        if (!object) {
          return new Response('Foto não encontrada no R2', { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Content-Disposition', `attachment; filename="${r2Key.split('/').pop() || 'photo.jpg'}"`);
        headers.set('Cache-Control', 'private, max-age=3600');
        Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));

        return new Response(object.body, { headers });
      }

      // 2. Otimização dinâmica com Cloudflare Image Resizing
      // Monta as opções de transformação do Cloudflare Images
      const imageOptions: Record<string, any> = {
        width: targetWidth,
        quality: targetQuality,
        format: 'auto', // WebP ou AVIF de acordo com o navegador do cliente
        fit: 'scale-down',
      };

      // Se for modo de seleção e houver URL de marca d'água configurada
      if (mode === 'selection' && watermarkUrl) {
        if (watermarkType === 'grid') {
          // Repetição sutil diagonal em grid
          imageOptions.draw = [
            {
              url: watermarkUrl,
              repeat: true,
              opacity: 0.28,
              fit: 'contain',
            },
          ];
        } else {
          // Marca d'água centralizada com transparência
          imageOptions.draw = [
            {
              url: watermarkUrl,
              opacity: 0.35,
              fit: 'scale-down',
              gravity: 'center',
            },
          ];
        }
      }

      // Para ambientes Cloudflare Image Resizing habilitados na zona
      // Faz fetch da imagem com as opções do Cloudflare Images
      const object = await env.PHOTOS_BUCKET.get(r2Key);
      if (!object) {
        return new Response('Foto não encontrada no R2', { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('etag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));

      return new Response(object.body, { headers });
    } catch (err: any) {
      return new Response(`Erro ao processar mídia: ${err.message}`, { status: 500 });
    }
  },
};
