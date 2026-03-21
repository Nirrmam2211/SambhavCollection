const express = require('express');
const asyncHandler = require('express-async-handler');
const { sendEmail } = require('../utils/email');
const contactRouter = express.Router();

contactRouter.post('/', asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message, type = 'general' } = req.body;
  if (!name || !email || !message) {
    res.status(400); throw new Error('Name, email and message are required.');
  }

  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `[Contact] ${subject || type} — ${name}`,
    html: `<div style="font-family:monospace;padding:20px;background:#f5f5f5;">
      <h3>New Contact Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
      <p><strong>Message:</strong></p>
      <p style="background:#fff;padding:12px;">${message}</p>
    </div>`,
  });

  await sendEmail({
    to: email,
    subject: 'We received your message — Sambhav Collection',
    html: `<div style="font-family:Georgia,serif;padding:40px;background:#f7f2eb;max-width:600px;margin:0 auto;">
      <h2 style="color:#0a0a0a;">Thank you, ${name}!</h2>
      <p style="color:#6e665c;">We've received your message and will get back to you within 24 hours.</p>
      <p style="color:#b8922a;font-style:italic;">Every stitch. Your story.</p>
    </div>`,
  });

  res.json({ success: true, message: 'Message sent successfully. We\'ll be in touch soon!' });
}));

module.exports = contactRouter;
