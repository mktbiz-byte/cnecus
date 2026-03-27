const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { creatorName, campaignTitle, videoUrl, applicationId, weekNumber, is4Week } = JSON.parse(event.body);

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT || '587';
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const adminEmail = process.env.ADMIN_EMAIL || 'mkt_biz@cnec.co.kr';

    if (!smtpHost || !smtpUser || !smtpPass) {
      console.warn('SMTP env vars not configured, skipping notification');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: false, reason: 'SMTP not configured' }),
      };
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort),
      secure: smtpPort === '465',
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: false },
    });

    const weekInfo = is4Week && weekNumber ? ` (Week ${weekNumber})` : '';
    const timestamp = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

    const mailOptions = {
      from: `CNEC US <${smtpUser}>`,
      to: adminEmail,
      subject: `[CNEC US] Video Uploaded - ${campaignTitle || 'Unknown Campaign'}${weekInfo}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">New Video Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Creator</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${creatorName || 'Unknown'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Campaign</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${campaignTitle || 'Unknown'}${weekInfo}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Application ID</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${applicationId || '-'}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Video URL</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><a href="${videoUrl}">${videoUrl ? 'View Video' : '-'}</a></td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-weight: bold;">Submitted At</td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${timestamp}</td></tr>
          </table>
          <p style="color: #6b7280; margin-top: 20px; font-size: 14px;">This is an automated notification from CNEC US creator platform.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error('Video upload notification error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
