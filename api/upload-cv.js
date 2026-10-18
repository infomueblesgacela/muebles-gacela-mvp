import { put } from '@vercel/blob';
import { signPathname } from './_cv-link.js';

// Las funciones de Vercel aceptan hasta 4.5 MB por request.
const MAX_BYTES = 4 * 1024 * 1024;

// Se valida por la firma real del archivo, no solo por la extensión.
const FILE_TYPES = {
  pdf:  { contentType: 'application/pdf', magic: [0x25, 0x50, 0x44, 0x46] },             // %PDF
  docx: { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', magic: [0x50, 0x4b, 0x03, 0x04] }, // ZIP
  doc:  { contentType: 'application/msword', magic: [0xd0, 0xcf, 0x11, 0xe0] },           // OLE2
};

function safeFileName(name) {
  const base = name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  return base.slice(-80) || 'cv';
}

async function readBody(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('too_large'), { code: 'too_large' });
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  const url = new URL(req.url, 'http://localhost');
  const fileName = safeFileName(url.searchParams.get('filename') || 'cv');
  const ext = fileName.split('.').pop();
  const type = FILE_TYPES[ext];
  if (!type) {
    return res.status(400).json({ error: 'El CV tiene que ser PDF o Word (.pdf, .doc, .docx).' });
  }

  let body;
  try {
    body = await readBody(req, MAX_BYTES);
  } catch (err) {
    if (err.code === 'too_large') {
      return res.status(413).json({ error: 'El CV supera los 4 MB. Por favor subí un archivo más liviano.' });
    }
    throw err;
  }

  if (body.length === 0 || !type.magic.every((byte, i) => body[i] === byte)) {
    return res.status(400).json({ error: 'El archivo no parece ser un PDF o Word válido.' });
  }

  try {
    const month = new Date().toISOString().slice(0, 7);
    const blob = await put(`cvs/${month}/${fileName}`, body, {
      access: 'private',
      contentType: type.contentType,
      addRandomSuffix: true,
    });

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const params = new URLSearchParams({ p: blob.pathname, s: signPathname(blob.pathname) });
    return res.status(200).json({ url: `https://${host}/api/cv?${params}` });
  } catch (err) {
    console.error('[upload-cv] Error al guardar el CV:', err);
    return res.status(500).json({ error: 'No se pudo guardar el CV. Reintentá en unos minutos.' });
  }
}
