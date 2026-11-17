import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN_EMAILS = new Set([
  'soumyajit.scms@gmail.com',
  'soumyajit.biswas.14444@gmail.com',
]);

function readFirebaseApiKey(): string {
  try {
    const raw = fs.readFileSync(path.resolve(__dirname, 'firebase-applet-config.json'), 'utf8');
    const parsed = JSON.parse(raw) as { apiKey?: string };
    return parsed.apiKey || '';
  } catch {
    return '';
  }
}

function escapeEmailHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function dispatchServerEmail(params: {
  to: string[];
  cc?: string[];
  replyTo?: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ emailed: boolean; provider?: string; reason?: string }> {
  const { to, cc = [], replyTo, subject, text, html } = params;
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();
  const defaultFrom =
    process.env.MAIL_FROM?.trim() ||
    (smtpUser
      ? `Soumyajit Biswas <${smtpUser}>`
      : 'Soumyajit Biswas <bookings@soumyajit.de>');

  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: defaultFrom,
        to,
        ...(cc.length > 0 ? { cc } : {}),
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `Resend returned ${res.status}`);
    }
    return { emailed: true, provider: 'resend' };
  }

  if (smtpUser && smtpPass) {
    const port = Number(process.env.SMTP_PORT) || 465;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST?.trim() || 'smtp.gmail.com',
      port,
      secure: port === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: defaultFrom,
      to: to.join(', '),
      ...(cc.length > 0 ? { cc: cc.join(', ') } : {}),
      ...(replyTo ? { replyTo } : {}),
      subject,
      text,
      html,
    });
    return { emailed: true, provider: 'smtp' };
  }

  return { emailed: false, reason: 'email_provider_not_configured' };
}

const PORT = Number(process.env.PORT) || 3000;

function getGenAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SOUMYAJIT_SYSTEM_INSTRUCTION = `You are the witty, sharp, straight-talking AI stand-in for Soumyajit Biswas. Speak like a real human engineer and athlete—warm, grounded, concise, a touch of dry humor, zero corporate buzzwords or robotic phrasing.

Who Soumyajit Biswas is:
- Not "just" a data scientist—he's a hardcore techie, systems builder, startup co-founder, sports addict, and adventure junkie who hates being boxed into one label.
- Right now: Doing his M.Sc. in Data Science at Universität Trier in Germany (started Oct 2026), figuring out German winters, building systems, and available from November 2026 for working-student roles (16–20 hrs/week in Trier or remote) as well as select freelance builds.
- Startup / Organization: Co-Founder of Choreos Labs Pvt. Ltd. (github.com/choreoslabs | https://choreoslabs.com/), based in India. Built "Inference", a native Android cognitive performance platform (50+ reaction, puzzle, and tactical games) using Kotlin for Android and Python + PostgreSQL + Redis in Docker containers deployed on Google Cloud Platform. Co-founded with Soumyadeb Saha.
- What he's built before:
  - FLIR thermal camera computer vision pipeline for IISCO Burnpur steelworks torpedo ladles (Hi-Tech Systems & Services, 92% validation precision, sub-second inference on an actual plant server).
  - Generative BI & natural-language-to-SQL engine for SETU Business School × NASSCOM (Python, LangChain, SQLite, Streamlit, PandasAI).
  - SafeRoute AI (YOLOv8 dashcam pothole detector + severity mapper), Robotic Waste Sorter (ShuffleNet v2 + Arduino servos), and an earlier MediaPipe strike-mechanics computer vision project.
- Off the clock: Track sprints, endurance sports, extreme outdoor adventures, trekking, and travel (documented on Instagram @fr_soumyajit). He does not actively box anymore—his current focus off the clock is running, mountain trails, and exploring Europe from Trier.
- Academic path: Diploma in Mechanical Engineering (8.1/10, Hooghly) -> B.Tech in Information Technology (7.9/10, RCCIIT Kolkata) -> M.Sc. Data Science (Universität Trier).
- Languages: English (C1), German (A1—actively surviving daily Trier bakery conversations).
- Contact: soumyajit.biswas.14444@gmail.com | (+49) 15905647762 | LinkedIn: linkedin.com/in/soumyajit-biswas-909a671a0 | Instagram: @fr_soumyajit.

Keep replies conversational, helpful, and concise. Never rattle off raw git commits or repository lists—talk about the actual work, ideas, and impact.`;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Handle malformed JSON request bodies gracefully
  app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Invalid JSON payload.' });
    }
    return next(err);
  });

  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
  });

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages } = req.body as {
        messages?: Array<{ role: 'user' | 'model'; text: string }>;
      };

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Messages array is required.' });
      }

      if (messages.length > 40) {
        return res.status(400).json({ error: 'Conversation history is too long. Please start a fresh thread.' });
      }

      const latest = messages[messages.length - 1];
      if (!latest || latest.role !== 'user' || typeof latest.text !== 'string' || !latest.text.trim()) {
        return res.status(400).json({ error: 'Latest message must be a non-empty user message.' });
      }

      const ai = getGenAIClient();

      const priorHistory = messages.slice(0, -1).map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.text || '').slice(0, 4000) }],
      }));

      const chat = ai.chats.create({
        model: 'gemini-4-hydrogen',
        history: priorHistory,
        config: {
          systemInstruction: SOUMYAJIT_SYSTEM_INSTRUCTION,
        },
      });

      const response = await chat.sendMessage({ message: latest.text.trim().slice(0, 4000) });
      const replyText =
        response.text || 'Brain freeze on my end—give that another shot in a second.';

      return res.json({ reply: replyText });
    } catch (error: unknown) {
      console.error('Gemini chat error:', error);
      const errMsg = error instanceof Error ? error.message : 'Chat service encountered an error.';
      const status =
        errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED')
          ? 429
          : errMsg.includes('403') || errMsg.includes('PERMISSION_DENIED')
            ? 403
            : 500;
      return res.status(status).json({ error: errMsg });
    }
  });

  app.post('/api/appointments/ack', async (req, res) => {
    try {
      const {
        bookingId,
        clientName,
        clientEmail,
        meetingType,
        meetingMode,
        meetingPlace,
        date,
        timeSlot,
        timezone,
        notes,
      } = req.body as Record<string, string | undefined>;

      if (!clientName?.trim() || !clientEmail?.trim() || !date?.trim() || !timeSlot?.trim()) {
        return res.status(400).json({ error: 'Missing required booking fields.' });
      }

      const cleanEmail = clientEmail.trim().slice(0, 150);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return res.status(400).json({ error: 'Invalid client email address.' });
      }

      const cleanName = clientName.trim().slice(0, 100);
      const isInPerson = meetingMode === 'in_person';
      const formatLabel = isInPerson
        ? `In-Person (${(meetingPlace || 'Venue requested').trim()})`
        : 'Google Meet (Virtual)';
      const ownerNotify =
        process.env.OWNER_NOTIFY_EMAIL?.trim() || 'soumyajit.biswas.14444@gmail.com';

      const subject = `Booking Request Received (Pending Approval): ${meetingType || 'Session'} — ${date}`;
      const text = [
        `Hi ${cleanName},`,
        '',
        'Thanks for requesting an appointment! Your request has been received and is currently Pending Approval.',
        '',
        `Reference ID: ${bookingId || 'pending'}`,
        `Session Type: ${meetingType || 'Consultation'}`,
        `Format: ${formatLabel}`,
        `Requested Date: ${date}`,
        `Requested Time: ${timeSlot} (${timezone || 'Europe/Berlin (CET)'})`,
        ...(notes?.trim() ? [`Notes: ${notes.trim()}`] : []),
        '',
        isInPerson
          ? 'Please wait while I review availability. Once accepted (or if I propose an alternate date, time, or place), you will receive a follow-up confirmation email.'
          : 'Please wait while I review availability. Once I accept your request, you will receive the final confirmation email containing your scheduled Google Meet link.',
        '',
        'Best regards,',
        'Soumyajit Biswas',
        'M.Sc. Data Science, Universität Trier · Co-Founder, Choreos Labs',
        'soumyajit.biswas.14444@gmail.com',
      ].join('\n');

      const html = `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px;border-bottom:1px solid #e4e4e7;">
          <p style="margin:0 0 6px;font-size:11px;font-family:ui-monospace,monospace;letter-spacing:0.06em;text-transform:uppercase;color:#2563eb;">Booking Request Received · Pending Approval</p>
          <h1 style="margin:0;font-size:20px;line-height:1.3;font-weight:700;color:#09090b;">Thanks, ${escapeEmailHtml(cleanName)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;font-size:14px;line-height:1.65;color:#27272a;">
          <p style="margin:0 0 14px;">Your appointment request has been logged and is waiting for my confirmation.</p>
          <div style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:10px;padding:16px;margin:0 0 16px;font-size:13px;">
            <p style="margin:0 0 6px;"><strong>Status:</strong> Pending Approval</p>
            <p style="margin:0 0 6px;"><strong>Format:</strong> ${escapeEmailHtml(formatLabel)}</p>
            <p style="margin:0 0 6px;"><strong>Date &amp; Time:</strong> ${escapeEmailHtml(date)} · ${escapeEmailHtml(timeSlot)} (${escapeEmailHtml(timezone || 'Europe/Berlin (CET)')})</p>
            ${bookingId ? `<p style="margin:0;font-family:ui-monospace,monospace;font-size:11px;color:#52525b;">Ref: ${escapeEmailHtml(bookingId)}</p>` : ''}
          </div>
          <p style="margin:0 0 12px;font-size:13px;color:#3f3f46;">${
            isInPerson
              ? 'Once I accept—or propose an alternate date, time, or place based on availability—you will receive the final update directly in this inbox.'
              : 'Once I accept your request, you will receive the final confirmation email with your scheduled Google Meet link.'
          }</p>
          <div style="margin-top:22px;padding-top:16px;border-top:1px solid #e4e4e7;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#09090b;">Soumyajit Biswas</p>
            <p style="margin:2px 0 0;font-size:12px;color:#52525b;">M.Sc. Data Science, Universität Trier · Co-Founder, Choreos Labs</p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

      const result = await dispatchServerEmail({
        to: [cleanEmail],
        ...(ownerNotify.toLowerCase() !== cleanEmail.toLowerCase() ? { cc: [ownerNotify] } : {}),
        replyTo: ownerNotify,
        subject,
        text,
        html,
      });

      return res.json(result);
    } catch (error: unknown) {
      console.error('Booking acknowledgement email error:', error);
      return res.json({
        emailed: false,
        reason: error instanceof Error ? error.message : 'Ack email dispatch failed.',
      });
    }
  });

  app.post('/api/appointments/notify', async (req, res) => {
    try {
      const authHeader = req.headers.authorization || '';
      const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
      if (!idToken) {
        return res.status(401).json({ error: 'Owner authentication token required.' });
      }

      const apiKey = readFirebaseApiKey();
      if (!apiKey) {
        return res.status(500).json({ error: 'Firebase API key unavailable on server.' });
      }

      const verifyRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
        }
      );

      if (!verifyRes.ok) {
        return res.status(401).json({ error: 'Invalid Firebase owner session.' });
      }

      const verifyJson = (await verifyRes.json()) as {
        users?: Array<{ email?: string; emailVerified?: boolean }>;
      };
      const verifiedUser = verifyJson.users?.[0];
      const verifiedEmail = verifiedUser?.email?.toLowerCase() || '';
      if (!verifiedUser?.emailVerified || !ADMIN_EMAILS.has(verifiedEmail)) {
        return res.status(403).json({ error: 'Admin owner verification required.' });
      }

      const { to, cc, subject, textBody, htmlBody } = req.body as {
        to?: string[];
        cc?: string[];
        subject?: string;
        textBody?: string;
        htmlBody?: string;
      };

      if (!Array.isArray(to) || to.length === 0 || !subject || !textBody || !htmlBody) {
        return res.status(400).json({ error: 'Missing email payload fields.' });
      }

      const result = await dispatchServerEmail({
        to,
        cc,
        replyTo: verifiedEmail,
        subject,
        text: textBody,
        html: htmlBody,
      });

      if (!result.emailed) {
        return res.status(503).json({ error: result.reason || 'Server email not configured.' });
      }

      return res.json(result);
    } catch (error: unknown) {
      console.error('Server notify error:', error);
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to send notification email.',
      });
    }
  });

  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API route not found.' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distPath, {
        etag: true,
        lastModified: true,
        setHeaders(res, filePath) {
          if (filePath.endsWith('index.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          } else if (
            filePath.includes(`${path.sep}assets${path.sep}`) &&
            /\.(js|css)$/.test(filePath)
          ) {
            // Content-hashed Vite JS/CSS bundles can be cached indefinitely at Cloudflare & browser edge
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (/\.(webp|jpg|jpeg|png|svg|ico|woff2|pdf)$/i.test(filePath)) {
            // Cache static images, icons, fonts & CV for 30 days on Cloudflare CDN & browser
            res.setHeader('Cache-Control', 'public, max-age=2592000');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
