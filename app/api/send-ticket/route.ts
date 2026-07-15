import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import MisaTicketEmail from '@/app/components/MisaTicketEmail';
import React from 'react';

// Inicializar el SDK de Resend con la clave de entorno.
// Si no se encuentra configurada, usamos una clave de demostración para evitar fallos.
const resend = new Resend(process.env.RESEND_API_KEY || 're_demokey');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      nombreSolicitante,
      telefonoSolicitante,
      emailSolicitante,
      tipoCelebracion,
      tipoIntencion = '',
      nombreIntencion = '',
      fechaMisa,
      horaMisa,
      montoOfrenda,
      codigoOperacion,
      documentos = []
    } = body;

    // Validación básica de campos obligatorios
    if (!nombreSolicitante || !emailSolicitante || !fechaMisa || !horaMisa || !codigoOperacion) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios para enviar el correo.' },
        { status: 400 }
      );
    }

    const adminEmail = 'angelabenancio04@gmail.com';
    const cleanAmount = Number(montoOfrenda) || 0;

    // Si la clave API de Resend no está configurada, simulamos el envío de forma exitosa
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_demokey') {
      console.log('--- SIMULACIÓN DE ENVÍO DE TICKET (Resend) ---');
      console.log(`De: Parroquia Patrocinio <onboarding@resend.dev>`);
      console.log(`Para: ${emailSolicitante}, ${adminEmail}`);
      console.log(`Asunto: Confirmación de Solicitud Litúrgica`);
      console.log('Detalles:', {
        solicitante: nombreSolicitante,
        fecha: fechaMisa,
        hora: horaMisa,
        monto: cleanAmount,
        yapeOp: codigoOperacion
      });
      console.log('---------------------------------------------');
      
      return NextResponse.json({
        success: true,
        simulated: true,
        message: 'Envío simulado correctamente (RESEND_API_KEY no configurado).'
      });
    }

    // Renderizar el correo a HTML para evitar problemas de compatibilidad y dependencias con React Email
    const { renderToString } = eval("require('react-dom/server')");
    const emailHtml = renderToString(
      React.createElement(MisaTicketEmail, {
        nombreSolicitante,
        telefonoSolicitante,
        emailSolicitante,
        tipoCelebracion,
        tipoIntencion,
        nombreIntencion,
        fechaMisa,
        horaMisa,
        montoOfrenda: cleanAmount,
        codigoOperacion,
        documentos
      })
    );

    // Enviar el correo utilizando Resend
    let result = await resend.emails.send({
      from: 'onboarding@resend.dev', // Debe ser exactamente este remitente en Sandbox
      to: [emailSolicitante, adminEmail],
      subject: `Confirmación de Solicitud Litúrgica - ${tipoCelebracion === 'SACRAMENTO' ? 'Sacramento' : 'Misa'}`,
      html: emailHtml,
    });

    // Si falla (muy común en Sandbox de Resend si el adminEmail no es el correo registrado),
    // reintentamos enviándolo ÚNICAMENTE al correo del solicitante (que es el verificado en las pruebas).
    if (result.error) {
      console.warn('Fallo al enviar correo conjunto (posible restricción de Sandbox de Resend). Reintentando enviar solo al solicitante...', result.error);
      
      result = await resend.emails.send({
        from: 'onboarding@resend.dev', // Debe ser exactamente este remitente en Sandbox
        to: [emailSolicitante],
        subject: `Confirmación de Solicitud Litúrgica - ${tipoCelebracion === 'SACRAMENTO' ? 'Sacramento' : 'Misa'}`,
        html: emailHtml,
      });
    }

    if (result.error) {
      console.error('Error final al enviar el correo vía Resend:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    const { data } = result;

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error: any) {
    console.error('Excepción al procesar el ticket de correo:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al enviar el correo.' },
      { status: 500 }
    );
  }
}
