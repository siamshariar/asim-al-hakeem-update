import sgMail from "@sendgrid/mail";
import nodemailer from 'nodemailer';

const isValidEmail = (e) => typeof e === 'string' && /^\S+@\S+\.\S+$/.test(e);

// The live site sends form submissions to the Sheikh's bookings inbox. Everywhere else (local dev,
// local test servers, Vercel preview deployments) they go to the developer's test inbox, so test
// messages never reach the Sheikh. Vercel sets VERCEL_ENV=production only on the live deployment.
const LIVE_INBOX = 'sheikhassim.bookings@gmail.com';
const TEST_INBOX = 'siam.it.int@gmail.com';
const isLiveSite = () => process.env.VERCEL_ENV === 'production';

// Visitor input goes into an HTML email: escape it so it can't add markup or links
const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Single-line fields (name, subject, phone) end up in headers: no line breaks, sensible length
const singleLine = (value, max = 200) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, max);

export default async function (req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  // Sent from and to the same Gmail account by default (its App Password is AUTH_EMAIL_PASSWORD);
  // AUTH_EMAIL / CONTACT_EMAIL can override either address
  const live = isLiveSite();
  const inbox = live ? LIVE_INBOX : TEST_INBOX;
  const authEmail = process.env.AUTH_EMAIL || inbox;
  const contactEmail = process.env.CONTACT_EMAIL || inbox;

  const body = req.body || {};
  const name = singleLine(body.name);
  const subject = singleLine(body.subject);
  const phone = singleLine(body.phone, 50);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = String(body.message ?? '').slice(0, 10000);

  if (process.env.NODE_ENV !== 'production') {
    console.log('contact form payload:', { name, subject, email, phone, message });
  }

  if (!isValidEmail(authEmail)) {
    return res.status(500).json({ error: 'AUTH_EMAIL is not set or not a valid email.' });
  }

  if (!isValidEmail(contactEmail)) {
    return res.status(500).json({ error: 'CONTACT_EMAIL is not set or not a valid email.' });
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Sender email is missing or invalid in request body.' });
  }

  const baseSubject = subject === '' ? `New message from ${name || email}` : subject;
  // Test messages are labelled so they are never mistaken for real visitors
  const mailSubject = live ? baseSubject : `[Test] ${baseSubject}`;

  const data = {
    to: contactEmail,
    from: authEmail,
    subject: mailSubject,
    replyTo: email,
    text: `${message} | Sent from: ${email} name: ${name || ''} phone: ${phone}`,
    html: `<div>
      <b>Name: </b>${escapeHtml(name)}<br/>
      <b>Email: </b>${escapeHtml(email)}<br/>
      <b>Phone: </b>${escapeHtml(phone)}<br/>
      <b>Message: </b>${escapeHtml(message).replace(/\r?\n/g, '<br/>')}
    </div>`
  };

  // Try SendGrid if key looks valid
  if (SENDGRID_API_KEY && SENDGRID_API_KEY.startsWith('SG.')) {
    try {
      sgMail.setApiKey(SENDGRID_API_KEY);
      await sgMail.send(data);
      return res.status(200).json({ status: 'OK', provider: 'sendgrid' });
    } catch (err) {
      console.error('SendGrid error:', err?.response?.body || err.message || err);
      // fallthrough to other methods or return error
    }
  } else if (SENDGRID_API_KEY) {
    // key present but not a SendGrid key
    console.warn('SENDGRID_API_KEY does not appear to be a SendGrid key (missing SG. prefix)');
  }

  // Fallback to nodemailer if SMTP creds provided
  // Google shows App Passwords in groups of four ("abcd efgh ijkl mnop"); the password has no spaces
  const authEmailPassword = (process.env.AUTH_EMAIL_PASSWORD || '').replace(/\s+/g, '');
  if (authEmailPassword) {
    try {
      const transporter = nodemailer.createTransport({
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 465,
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        auth: {
          user: authEmail,
          pass: authEmailPassword,
        },
        secure: true,
      });

      const mailData = {
        from: authEmail,
        to: contactEmail,
        subject: mailSubject,
        replyTo: email,
        html: data.html,
      };

      await transporter.sendMail(mailData);
      return res.status(200).json({ status: 'OK', provider: 'nodemailer' });
    } catch (err) {
      console.error('Nodemailer error:', err);
      return res.status(500).json({ error: 'Failed to send email via SMTP: ' + (err.message || err) });
    }
  }

  // No working provider configured
  return res.status(500).json({ error: 'No mail provider configured. Set the Gmail App Password in AUTH_EMAIL_PASSWORD (or a SendGrid key starting with "SG." in SENDGRID_API_KEY).' });
}



// import nodemailer from 'nodemailer'

// export default function (req, res) {
//   const authEmail = process.env.AUTH_EMAIL
//   const authEmailPassword = process.env.AUTH_EMAIL_PASSWORD
// 	const contactEmail = process.env.CONTACT_EMAIL

// 	const transporter = nodemailer.createTransport({
// 		port: 465,
// 		host: 'smtp.gmail.com',
// 		auth: {
// 			user: authEmail,
// 			pass: authEmailPassword
// 		},
// 		secure: true
// 	})

// 	const { name, subject, email, phone, message } = req.body

// 	const mailData = {
// 		from: email,
// 		to: contactEmail,
// 		subject: subject,
// 		replyTo: email,
// 		//text: message + " | Sent from: " + email + ' name: ' + name + ' phone ' + phone,
// 		html: `<div>
// 			<b>Name: </b>${name}<br/>
// 			<b>Email: </b>${email}<br/>
// 			<b>Phone: </b>${phone}<br/>
// 			<b>Message: </b>${message}
// 		</div>`
// 	}

// 	transporter.sendMail(mailData, function (err, info) {
// 		if (err) console.log(err)
// 		else console.log(info)
// 	})

// 	res.send('success')
// }