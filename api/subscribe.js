import crypto from 'crypto';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Utilizar POST.' });
  }

  const { name, email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'El correo electrónico es requerido.' });
  }

  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;

  if (!apiKey || !listId) {
    console.error('Mailchimp API Key o List ID no configurados.');
    return res.status(500).json({ error: 'Error de configuración del servidor.' });
  }

  // Eliminar espacios en blanco accidentales (por ejemplo, trailing spaces de cmd echo)
  const trimmedApiKey = apiKey.trim();
  const trimmedListId = listId.trim();

  // Extraer datacenter del API Key (ejemplo: 'KEY-us18' -> 'us18')
  const dc = trimmedApiKey.split('-')[1];
  if (!dc) {
    console.error('API Key de Mailchimp en formato incorrecto (falta datacenter).');
    return res.status(500).json({ error: 'Error en el formato de API Key.' });
  }

  try {
    const subscriberHash = crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex');
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${trimmedListId}/members/${subscriberHash}`;

    // Usar PUT para suscribir o actualizar si ya existe
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${Buffer.from(`anykey:${trimmedApiKey}`).toString('base64')}`,
      },
      body: JSON.stringify({
        email_address: email.trim(),
        status: 'subscribed',
        merge_fields: {
          FNAME: name ? name.trim() : '',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error de Mailchimp:', data);
      return res.status(response.status).json({
        error: data.title || 'Error al comunicarse con Mailchimp',
        detail: data.detail || '',
      });
    }

    return res.status(200).json({ success: true, member: data.email_address });
  } catch (error) {
    console.error('Excepción en suscripción de Mailchimp:', error);
    return res.status(500).json({ error: 'Fallo interno al procesar suscripción.' });
  }
}
