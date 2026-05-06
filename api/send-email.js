import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Permitir la solicitud CORS (Preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    ticket,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    shipping_city,
    shipping_state,
    shipping_zip,
    order_summary,
    order_total,
    shipping_cost,
    total_with_shipping,
    message_body
  } = req.body;

  // Validar que todos los campos estén presentes
  if (!customer_name || !customer_email || !ticket) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Configurar el transporte de correo
    // Aquí usamos EmailJS a través de una API más segura
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          ticket,
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_zip,
          order_summary,
          order_total,
          shipping_cost,
          total_with_shipping,
          message_body
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`EmailJS error: ${response.status}`);
    }

    const data = await response.json();

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      response: data
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to send email',
      details: error.message
    });
  }
}
