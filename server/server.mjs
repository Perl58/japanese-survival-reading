import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Config ──────────────────────────────────────────────────
const PORT = process.env.PORT || 8083;

// VOICEVOX ENGINE — a locally-run app (https://voicevox.hiroshiba.jp), NOT a
// hosted API. Download it, leave it open, and it exposes this REST API.
// If it's not running, /api/tts fails and the frontend falls back to
// captions + mouth-flap only (see src/context/PresenterContext.tsx) — no
// other feature depends on this.
// Commercial use requires crediting "VOICEVOX:春日部つむぎ" somewhere in the
// app UI — see the character's terms of use (checked 2026-08-20).
const VOICEVOX_ENGINE_URL =
  process.env.VOICEVOX_ENGINE_URL || "http://127.0.0.1:50021";
const VOICEVOX_SPEAKER_NAME =
  process.env.VOICEVOX_SPEAKER_NAME || "春日部つむぎ";
const VOICEVOX_SPEAKER_STYLE =
  process.env.VOICEVOX_SPEAKER_STYLE || "ノーマル";

// Speaker IDs aren't stable across VOICEVOX versions/installs, so resolve
// "春日部つむぎ / ノーマル" → numeric id by name via GET /speakers instead of
// hardcoding a guessed number. Cached after the first successful lookup — a
// running VOICEVOX ENGINE process doesn't change its own speaker list.
let cachedSpeakerId = null;

async function resolveSpeakerId() {
  if (cachedSpeakerId !== null) return cachedSpeakerId;
  let speakersRes;
  try {
    speakersRes = await fetch(`${VOICEVOX_ENGINE_URL}/speakers`);
  } catch (err) {
    const wrapped = new Error(
      `Could not reach VOICEVOX ENGINE at ${VOICEVOX_ENGINE_URL}. Is VOICEVOX running? (${err.message})`,
    );
    wrapped.status = 502;
    throw wrapped;
  }
  if (!speakersRes.ok) {
    const err = new Error(
      `VOICEVOX ENGINE /speakers returned ${speakersRes.status}`,
    );
    err.status = 502;
    throw err;
  }
  const speakers = await speakersRes.json();
  const speaker = speakers.find((s) => s.name === VOICEVOX_SPEAKER_NAME);
  const style = speaker?.styles.find(
    (s) => s.name === VOICEVOX_SPEAKER_STYLE,
  );
  if (!style) {
    const err = new Error(
      `Speaker "${VOICEVOX_SPEAKER_NAME} / ${VOICEVOX_SPEAKER_STYLE}" not found in this VOICEVOX install. ` +
        `Available speakers: ${speakers.map((s) => s.name).join(", ")}`,
    );
    err.status = 502;
    throw err;
  }
  cachedSpeakerId = style.id;
  return cachedSpeakerId;
}

// ── Express app ─────────────────────────────────────────────────────────
const app = express();
app.disable("x-powered-by");

const IS_DEV = process.env.NODE_ENV !== "production";

app.use(express.json());

/**
 * Wrap a route handler so any thrown error becomes a JSON error response
 * instead of an unhandled rejection — Express 4 does not catch async
 * handler rejections on its own.
 * @param {(req: express.Request, res: express.Response) => Promise<void>} handler
 */
function route(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      const status = err.status ?? 502;
      res.status(status).json(err.payload ?? { error: String(err) });
    }
  };
}

// GET /api/health → liveness check. Always 200.
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// POST /api/tts
// Request: { text: string }
// Returns: audio/wav bytes (春日部つむぎ's voice, via a local VOICEVOX ENGINE).
// Errors:  400 missing/empty text · 502 VOICEVOX ENGINE unreachable,
//          misconfigured, or missing the configured speaker/style (message
//          says which).
app.post(
  "/api/tts",
  route(async (req, res) => {
    const text = req.body?.text;
    if (typeof text !== "string" || !text.trim()) {
      res.status(400).json({ error: "'text' must be a non-empty string." });
      return;
    }
    const speaker = await resolveSpeakerId();

    const queryRes = await fetch(
      `${VOICEVOX_ENGINE_URL}/audio_query?speaker=${speaker}&text=${encodeURIComponent(text)}`,
      { method: "POST" },
    );
    if (!queryRes.ok) {
      const err = new Error(
        `VOICEVOX /audio_query returned ${queryRes.status}`,
      );
      err.status = 502;
      throw err;
    }
    const audioQuery = await queryRes.json();

    const synthRes = await fetch(
      `${VOICEVOX_ENGINE_URL}/synthesis?speaker=${speaker}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(audioQuery),
      },
    );
    if (!synthRes.ok) {
      const err = new Error(`VOICEVOX /synthesis returned ${synthRes.status}`);
      err.status = 502;
      throw err;
    }
    const wavBuffer = Buffer.from(await synthRes.arrayBuffer());
    res.set({ "Content-Type": "audio/wav", "Cache-Control": "no-store" });
    res.send(wavBuffer);
  }),
);

// ── Static frontend (production only) ──────────────────────────────────
// In dev, Vite serves the frontend on its own port and proxies /api/* here
// (see vite.config.ts) — this server only needs to answer /api routes. In
// production, `npm run build` in the project root outputs to dist/, and
// this server serves it directly so the whole app is one deployable unit.
if (!IS_DEV) {
  const distDir = path.join(__dirname, "..", "dist");
  app.use(express.static(distDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(distDir, "index.html"));
  });
}

// ── Start ────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nJapanese Survival Reading — API server`);
  console.log(`  URL  : http://localhost:${PORT}`);
  console.log(`  Mode : ${IS_DEV ? "dev (Vite serves the frontend)" : "production (serving dist/)"}`);
});
