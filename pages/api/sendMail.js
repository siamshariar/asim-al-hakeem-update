import sgMail from "@sendgrid/mail";
import nodemailer from 'nodemailer';

const isValidEmail = (e) => typeof e === 'string' && /^\S+@\S+\.\S+$/.test(e);

export default async function (req, res) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  const authEmail = process.env.AUTH_EMAIL;
  const contactEmail = process.env.CONTACT_EMAIL;

  const { name, subject = '', email, phone = '', message = '' } = req.body || {};

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

  const mailSubject = subject === '' ? `New message from ${name || email}` : subject;

  const data = {
    to: contactEmail,
    from: authEmail,
    subject: mailSubject,
    replyTo: email,
    text: `${message} | Sent from: ${email} name: ${name || ''} phone: ${phone}`,
    html: `<div>
      <b>Name: </b>${name || ''}<br/>
      <b>Email: </b>${email}<br/>
      <b>Phone: </b>${phone}<br/>
      <b>Message: </b>${message}
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
  const authEmailPassword = process.env.AUTH_EMAIL_PASSWORD;
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
  return res.status(500).json({ error: 'No valid mail provider configured. Set a SendGrid key (starts with "SG.") in SENDGRID_API_KEY or SMTP creds in AUTH_EMAIL_PASSWORD.' });
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