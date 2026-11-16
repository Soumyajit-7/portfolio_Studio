import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
          } else if (/\.(webp|jpg|jpeg|png|svg|woff2|pdf)$/i.test(filePath)) {
            // Cache static images, fonts & CV for 30 days on Cloudflare CDN & browser
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
