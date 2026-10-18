import crypto from 'crypto';

// Los CVs se guardan en un Blob privado. El link que llega por mail a RRHH apunta a
// /api/cv con el pathname firmado, así solo se pueden abrir links generados por el sitio.
// La clave de firma se deriva del token del Blob (variable secreta del servidor).

function getSigningKey() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN no configurado.');
  return crypto.createHash('sha256').update(`gacela-cv-link:${token}`).digest();
}

export function signPathname(pathname) {
  return crypto.createHmac('sha256', getSigningKey()).update(pathname).digest('base64url');
}

export function isValidSignature(pathname, signature) {
  if (typeof pathname !== 'string' || typeof signature !== 'string') return false;
  const expected = Buffer.from(signPathname(pathname));
  const received = Buffer.from(signature);
  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
