import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { prenom, nom, societe, email, telephone, objet, message } = body

    if (!prenom || !nom || !email || !message) {
      return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    await transporter.sendMail({
      from: `"Site INEE" <${process.env.SMTP_USER}>`,
      to: 'contact@inee.lu',
      replyTo: email,
      subject: `[inee.lu] Nouveau message — ${objet || 'Contact'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FAF6F1;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Georgia, serif; font-size: 28px; color: #C8803A; letter-spacing: 6px; margin: 0;">INEE</h1>
            <p style="font-size: 12px; color: #9C8B7A; margin-top: 4px;">Nouveau message depuis inee.lu</p>
          </div>

          <div style="background: #fff; border: 1px solid #EEE4D8; padding: 32px; border-radius: 4px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Prénom</td><td style="padding: 8px 0; font-size: 15px; color: #1A0E06;">${prenom}</td></tr>
              <tr><td style="padding: 8px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px;">Nom</td><td style="padding: 8px 0; font-size: 15px; color: #1A0E06;">${nom}</td></tr>
              ${societe ? `<tr><td style="padding: 8px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px;">Société</td><td style="padding: 8px 0; font-size: 15px; color: #1A0E06;">${societe}</td></tr>` : ''}
              <tr><td style="padding: 8px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px;">Email</td><td style="padding: 8px 0; font-size: 15px; color: #C8803A;"><a href="mailto:${email}" style="color: #C8803A;">${email}</a></td></tr>
              ${telephone ? `<tr><td style="padding: 8px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px;">Téléphone</td><td style="padding: 8px 0; font-size: 15px; color: #1A0E06;">${telephone}</td></tr>` : ''}
              ${objet ? `<tr><td style="padding: 8px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px;">Objet</td><td style="padding: 8px 0; font-size: 15px; color: #1A0E06;">${objet}</td></tr>` : ''}
            </table>

            <hr style="border: none; border-top: 1px solid #EEE4D8; margin: 24px 0;" />

            <p style="font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Message</p>
            <p style="font-size: 15px; color: #1A0E06; line-height: 1.7; white-space: pre-line;">${message}</p>
          </div>

          <p style="text-align: center; font-size: 12px; color: #9C8B7A; margin-top: 24px;">
            Message reçu le ${new Date().toLocaleDateString('fr-LU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur envoi email:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi.' }, { status: 500 })
  }
}
