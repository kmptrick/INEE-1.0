import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { nom, telephone, creneau, conversation } = await req.json()

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
      from: '"Assistant INEE" <pkuete@inee.lu>',
      to: 'contact@inee.lu',
      subject: `🤖 Rappel demandé — ${nom} — ${telephone}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; background: #FAF6F1;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Georgia, serif; font-size: 28px; color: #C8803A; letter-spacing: 6px; margin: 0;">INEE</h1>
            <p style="font-size: 12px; color: #9C8B7A; margin-top: 4px;">Demande de rappel via l'assistant IA</p>
          </div>

          <div style="background: #fff; border: 1px solid #EEE4D8; padding: 32px; border-radius: 4px;">
            <div style="background: #FFF8F0; border-left: 3px solid #C8803A; padding: 16px; margin-bottom: 24px; border-radius: 2px;">
              <p style="margin: 0; font-size: 13px; color: #C8803A; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Demande de rappel</p>
            </div>

            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px; width: 140px;">Nom</td>
                <td style="padding: 10px 0; font-size: 15px; color: #1A0E06; font-weight: 500;">${nom}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px;">Téléphone</td>
                <td style="padding: 10px 0; font-size: 15px; color: #C8803A; font-weight: 600;">
                  <a href="tel:${telephone}" style="color: #C8803A; text-decoration: none;">${telephone}</a>
                </td>
              </tr>
              ${creneau ? `
              <tr>
                <td style="padding: 10px 0; font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px;">Créneau</td>
                <td style="padding: 10px 0; font-size: 15px; color: #1A0E06;">${creneau}</td>
              </tr>` : ''}
            </table>

            ${conversation ? `
            <hr style="border: none; border-top: 1px solid #EEE4D8; margin: 24px 0;" />
            <p style="font-size: 12px; color: #9C8B7A; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">Contexte de la conversation</p>
            <div style="font-size: 14px; color: #1A0E06; line-height: 1.7; background: #FAF6F1; padding: 16px; border-radius: 4px; white-space: pre-line;">${conversation}</div>
            ` : ''}
          </div>

          <p style="text-align: center; font-size: 12px; color: #9C8B7A; margin-top: 24px;">
            Reçu le ${new Date().toLocaleDateString('fr-LU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Erreur rappel:', err)
    return NextResponse.json({ error: 'Erreur envoi.' }, { status: 500 })
  }
}
