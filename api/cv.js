import { get } from '@vercel/blob';
import { Readable } from 'stream';
import { isValidSignature } from './_cv-link.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Método no permitido.');
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.searchParams.get('p');
  const signature = url.searchParams.get('s');

  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Cache-Control', 'private, no-store');

  if (!pathname || !pathname.startsWith('cvs/') || !isValidSignature(pathname, signature)) {
    return res.status(403).send('Link inválido.');
  }

  try {
    const result = await get(pathname, { access: 'private' });
    if (!result || result.statusCode !== 200) {
      return res.status(404).send('CV no encontrado.');
    }

    const fileName = pathname.split('/').pop();
    const disposition = result.blob.contentType === 'application/pdf' ? 'inline' : 'attachment';
    res.setHeader('Content-Type', result.blob.contentType);
    res.setHeader('Content-Length', String(result.blob.size));
    res.setHeader('Content-Disposition', `${disposition}; filename="${fileName}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200);
    Readable.fromWeb(result.stream).pipe(res);
  } catch (err) {
    console.error('[cv] Error al leer el CV:', err);
    return res.status(500).send('No se pudo abrir el CV. Reintentá en unos minutos.');
  }
}
