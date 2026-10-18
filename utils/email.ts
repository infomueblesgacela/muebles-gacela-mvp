import emailjs from '@emailjs/browser';

// ─── EmailJS Configuration ───────────────────────────────────────────────────
const PUBLIC_KEY        = import.meta.env.VITE_EMAILJS_PUBLIC_KEY       || '';
const SERVICE_ID        = import.meta.env.VITE_EMAILJS_SERVICE_ID       || '';
const TEMPLATE_CONTACT  = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT || '';
const TEMPLATE_CLAIMS   = import.meta.env.VITE_EMAILJS_TEMPLATE_CLAIMS  || '';

// ─── EmailJS RRHH (Sumate) Configuration ─────────────────────────────────────
const RRHH_PUBLIC_KEY   = import.meta.env.VITE_EMAILJS_RRHH_PUBLIC_KEY  || '';
const RRHH_SERVICE_ID   = import.meta.env.VITE_EMAILJS_RRHH_SERVICE_ID  || '';
const RRHH_TEMPLATE_ID  = import.meta.env.VITE_EMAILJS_RRHH_TEMPLATE_ID || '';
const TEMPLATE_FEEDBACK = import.meta.env.VITE_EMAILJS_TEMPLATE_FEEDBACK || 'template_v3oltfi';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface EmailPayload {
  subject:         string;
  from_name:       string;
  from_email:      string;
  message:         string;
  attachment_url?: string;
  extra?:          Record<string, string>;
}

export interface RRHHEmailPayload {
  from_name:       string;
  from_email:      string;
  phone:           string;
  city:            string;
  interest_area:   string;
  message:         string;
  attachment_url:  string;
}

// ─── Send Email ───────────────────────────────────────────────────────────────
export async function sendEmail(
  payload: EmailPayload, 
  useClaimsTemplate: boolean = false,
  useFeedbackTemplate: boolean = false
): Promise<void> {
  let serviceId = SERVICE_ID;
  let templateId = useClaimsTemplate ? TEMPLATE_CLAIMS : TEMPLATE_CONTACT;
  let publicKey = PUBLIC_KEY;

  if (useFeedbackTemplate) {
    serviceId = RRHH_SERVICE_ID || SERVICE_ID;
    templateId = TEMPLATE_FEEDBACK;
    publicKey = RRHH_PUBLIC_KEY || PUBLIC_KEY;
  }

  if (!publicKey || !serviceId || !templateId) {
    // En desarrollo, simular envío si no hay credenciales configuradas
    console.warn('[EmailJS] No están configuradas las variables de entorno correctas. Simulando envío:', {
      serviceId,
      templateId,
      payload,
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  }

  const templateParams = {
    subject:         payload.subject,
    from_name:       payload.from_name,
    from_email:      payload.from_email,
    email:           payload.from_email, // Add 'email' to support both 'email' and 'from_email' variables in template
    message:         payload.message,
    attachment_url:  payload.attachment_url || '',
    to_email:        'rrhhmueblesgacela@gmail.com',
    ...payload.extra,
  };

  await emailjs.send(serviceId, templateId, templateParams, publicKey);
}

// ─── Send RRHH Email ─────────────────────────────────────────────────────────
export async function sendRRHHEmail(payload: RRHHEmailPayload): Promise<void> {
  if (!RRHH_PUBLIC_KEY || !RRHH_SERVICE_ID || !RRHH_TEMPLATE_ID) {
    console.warn('[EmailJS - RRHH] No están configuradas las variables de entorno de RRHH. Simulando envío:', payload);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return;
  }

  await emailjs.send(RRHH_SERVICE_ID, RRHH_TEMPLATE_ID, payload as any, RRHH_PUBLIC_KEY);
}

// ─── File Upload Helper ───────────────────────────────────────────────────────
// Guarda el CV en el Blob privado de Vercel (api/upload-cv.js) y devuelve un link
// firmado permanente (/api/cv) para incluir en el mail a RRHH.
export const MAX_CV_BYTES = 4 * 1024 * 1024;

export async function uploadAttachment(file: File): Promise<string> {
  if (file.size > MAX_CV_BYTES) {
    throw new Error('El CV supera los 4 MB. Por favor subí un archivo más liviano.');
  }

  let response: Response;
  try {
    response = await fetch(`/api/upload-cv?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: file,
    });
  } catch (err: any) {
    console.error('[FileUpload] Fallo la subida del CV:', err);
    throw new Error('No se pudo subir el CV. Revisá tu conexión y reintentá.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    console.error('[FileUpload] Fallo la subida del CV:', response.status, data);
    throw new Error(data.error || 'No se pudo subir el CV. Reintentá en unos minutos.');
  }
  return data.url;
}


