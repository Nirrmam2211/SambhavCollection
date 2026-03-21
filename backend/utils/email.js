const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ─── HTML Email Templates ─────────────────────────────────────────
const templates = {
  emailVerify: (data) => ({
    subject: 'Verify Your Email — Sambhav Collection',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#f7f2eb;padding:40px;">
        <h1 style="font-size:28px;color:#0a0a0a;margin-bottom:8px;">Sambhav Collection</h1>
        <p style="font-size:12px;letter-spacing:3px;color:#b8922a;text-transform:uppercase;margin-bottom:32px;">Bespoke Menswear</p>
        <p style="color:#6e665c;font-size:16px;">Dear ${data.name},</p>
        <p style="color:#6e665c;font-size:16px;line-height:1.7;">Welcome! Please verify your email to complete your registration.</p>
        <a href="${data.verifyUrl}" style="display:inline-block;background:#b8922a;color:#f7f2eb;padding:14px 32px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0;">Verify Email</a>
        <p style="color:#b8922a;font-size:12px;margin-top:24px;font-style:italic;">Every stitch. Your story.</p>
      </div>`,
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset — Sambhav Collection',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#f7f2eb;padding:40px;">
        <h1 style="font-size:28px;color:#0a0a0a;">Sambhav Collection</h1>
        <p style="color:#6e665c;">Dear ${data.name},</p>
        <p style="color:#6e665c;line-height:1.7;">You requested a password reset. Click below to set a new password. This link expires in ${data.expiresIn}.</p>
        <a href="${data.resetUrl}" style="display:inline-block;background:#0a0a0a;color:#f7f2eb;padding:14px 32px;text-decoration:none;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin:24px 0;">Reset Password</a>
        <p style="color:#6e665c;font-size:13px;">If you didn't request this, please ignore this email.</p>
      </div>`,
  }),

  orderConfirm: (data) => ({
    subject: `Order Confirmed — ${data.order.orderNumber}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#f7f2eb;padding:40px;">
        <h1 style="font-size:28px;color:#0a0a0a;">Order Confirmed!</h1>
        <p style="color:#b8922a;font-size:13px;letter-spacing:2px;">Order #${data.order.orderNumber}</p>
        <p style="color:#6e665c;">Dear ${data.name}, your order has been placed successfully.</p>
        <div style="background:#fff;padding:20px;margin:20px 0;border-left:3px solid #b8922a;">
          <p style="margin:0;color:#0a0a0a;font-size:15px;"><strong>Total:</strong> ₹${data.order.pricing.total.toLocaleString()}</p>
          <p style="margin:8px 0 0;color:#6e665c;font-size:13px;">Estimated delivery: 10–15 working days</p>
        </div>
        <p style="color:#b8922a;font-style:italic;font-size:14px;">We'll notify you at every step of your garment's journey.</p>
      </div>`,
  }),

  orderStatus: (data) => ({
    subject: `Order Update — ${data.order.orderNumber}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#f7f2eb;padding:40px;">
        <h1 style="font-size:28px;color:#0a0a0a;">Order Update</h1>
        <p style="color:#b8922a;letter-spacing:2px;font-size:13px;">#${data.order.orderNumber}</p>
        <p style="color:#6e665c;">Dear ${data.name}, your order status has been updated to:</p>
        <p style="font-size:20px;color:#b8922a;font-style:italic;margin:16px 0;">${data.order.status.replace(/_/g, ' ').toUpperCase()}</p>
        ${data.message ? `<p style="color:#6e665c;">${data.message}</p>` : ''}
        ${data.order.shipping?.trackingNumber
          ? `<p style="color:#6e665c;">Tracking: <strong>${data.order.shipping.trackingNumber}</strong></p>` : ''}
      </div>`,
  }),

  appointmentConfirm: (data) => ({
    subject: 'Appointment Confirmed — Sambhav Collection',
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;background:#f7f2eb;padding:40px;">
        <h1 style="font-size:28px;color:#0a0a0a;">Appointment Confirmed</h1>
        <p style="color:#6e665c;">Dear ${data.name},</p>
        <div style="background:#fff;padding:20px;margin:20px 0;border-left:3px solid #b8922a;">
          <p style="margin:0;color:#0a0a0a;"><strong>Type:</strong> ${data.appointment.type}</p>
          <p style="margin:8px 0 0;color:#0a0a0a;"><strong>Date:</strong> ${new Date(data.appointment.date).toDateString()}</p>
          <p style="margin:8px 0 0;color:#0a0a0a;"><strong>Time:</strong> ${data.appointment.timeSlot}</p>
        </div>
        <p style="color:#6e665c;">📍 Sambhav Collection Atelier, Mumbai</p>
        <p style="color:#b8922a;font-style:italic;">Every stitch. Your story.</p>
      </div>`,
  }),

  appointmentAdmin: (data) => ({
    subject: `New Appointment: ${data.appointment.type} — ${data.appointment.name}`,
    html: `<pre style="font-family:monospace">${JSON.stringify(data.appointment, null, 2)}</pre>`,
  }),
};

// ─── Send Email ───────────────────────────────────────────────────
const sendEmail = async ({ to, subject, template, data, html }) => {
  try {
    const emailContent = template && templates[template]
      ? templates[template](data)
      : { subject, html };

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to,
      subject: emailContent.subject || subject,
      html:    emailContent.html    || html,
    });

    console.log(`📧 Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    throw error;
  }
};

module.exports = { sendEmail };
