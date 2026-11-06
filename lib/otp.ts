import "server-only";

import crypto from "crypto";
import dns from "dns";
import net from "net";
import tls from "tls";
import { promisify } from "util";
import { cookies } from "next/headers";

const COOKIE_NAME = "otp_pending";
const TTL_SECONDS = 10 * 60; // 10 minutes

function getKey(): Buffer {
  const secret = process.env.AUTH_SECRET || "dev-secret-change-me";
  return crypto.scryptSync(secret, "lecteurs-juniors-otp-salt", 32);
}

const resolveMx = promisify(dns.resolveMx);

/** Génère un code OTP à 6 chiffres. */
export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Vérifie que le domaine de l'e-mail possède des enregistrements MX (peut recevoir des e-mails). */
export async function verifyEmailDomain(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}

/** Chiffre un payload (AES-256-GCM, authentifié) pour le stocker dans un cookie. */
export function encryptOtpPayload(payload: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.from(JSON.stringify(payload), "utf8");
  const ct = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ct]).toString("base64url");
}

/** Déchiffre et valide un payload. Retourne null si invalide/expiré. */
export function decryptOtpPayload<T = unknown>(token: string): T | null {
  try {
    const buf = Buffer.from(token, "base64url");
    if (buf.length < 12 + 16) return null;
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(), iv);
    decipher.setAuthTag(tag);
    const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
    return JSON.parse(pt.toString("utf8")) as T;
  } catch {
    return null;
  }
}

export type OtpPayload = {
  purpose: "inscription" | "changement_email" | "reset_password";
  email: string;
  code: string;
  expiresAt: number;
  data: Record<string, unknown>;
};

/** Stocke un payload OTP dans un cookie httpOnly chiffré. */
export async function setOtpCookie(payload: OtpPayload): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, encryptOtpPayload(payload), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

/** Lit et valide le cookie OTP courant. Retourne null si absent/invalide/expiré. */
export async function getOtpCookie(): Promise<OtpPayload | null> {
  const store = await cookies();
  const c = store.get(COOKIE_NAME);
  if (!c?.value) return null;
  const payload = decryptOtpPayload<OtpPayload>(c.value);
  if (!payload) return null;
  if (Date.now() > payload.expiresAt) return null;
  return payload;
}

/** Supprime le cookie OTP. */
export async function clearOtpCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Construit le template HTML de l'e-mail OTP. */
function buildOtpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Code de vérification</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f1ea;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f1ea;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:480px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#1a3a5c 0%,#2d5a87 100%);padding:32px 24px;text-align:center;">
              <img src="https://lecteurs-juniors.vercel.app/logo-saint-michel-carre.webp" alt="Logo" width="64" height="64" style="border-radius:12px;margin-bottom:12px;" />
              <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;letter-spacing:0.5px;">Lecteurs Juniors</h1>
              <p style="color:#b8d4e8;font-size:13px;margin:4px 0 0;">Paroisse Saint-Michel Gbeto • Cotonou</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;text-align:center;">
              <h2 style="color:#1a3a5c;font-size:18px;font-weight:600;margin:0 0 8px;">Code de vérification</h2>
              <p style="color:#5a6a7a;font-size:14px;margin:0 0 24px;line-height:1.5;">
                Utilisez le code ci-dessous pour confirmer votre inscription ou votre changement d'adresse e-mail.
              </p>
              <div style="background-color:#f0f4f8;border:2px dashed #2d5a87;border-radius:12px;padding:20px 16px;margin:0 auto 24px;max-width:280px;">
                <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#1a3a5c;font-family:'Courier New',monospace;">${code}</span>
              </div>
              <p style="color:#8a9aaa;font-size:13px;margin:0 0 8px;">
                Ce code expire dans <strong>10 minutes</strong>.
              </p>
              <p style="color:#8a9aaa;font-size:12px;margin:0;line-height:1.4;">
                Si vous n'êtes pas à l'origine de cette demande, ignorez simplement ce message. Votre compte reste sécurisé.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8f6f2;padding:16px 24px;text-align:center;border-top:1px solid #e8e4dc;">
              <p style="color:#9a9a9a;font-size:11px;margin:0;">
                © Lecteurs Juniors — Guilde liturgique des jeunes lecteurs<br/>
                Archidiocèse de Cotonou • Bénin
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------- SMTP ----------

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  secure: boolean;
};

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  return {
    host,
    port,
    user,
    pass,
    from: process.env.SMTP_FROM || user,
    secure: port === 465,
  };
}

/** Envoie un e-mail via SMTP en utilisant les modules net/tls natifs de Node.js. */
async function sendSmtpEmail(to: string, subject: string, code: string): Promise<void> {
  const cfg = getSmtpConfig();
  if (!cfg) throw new Error("Configuration SMTP manquante.");

  const fromAddr = cfg.from.includes("<") ? cfg.from : `${cfg.from} <${cfg.from}>`;
  const fromEmail = cfg.from.includes("<") ? cfg.from.match(/<(.+)>/)?.[1] || cfg.from : cfg.from;
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const html = buildOtpEmailHtml(code);

  const message = [
    `From: ${fromAddr}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="utf-8"`,
    ``,
    `Votre code de vérification Lecteurs Juniors : ${code}`,
    ``,
    `Ce code expire dans 10 minutes.`,
    ``,
    `Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset="utf-8"`,
    ``,
    html,
    ``,
    `--${boundary}--`,
    ``,
  ].join("\r\n");

  return new Promise((resolve, reject) => {
    let socket: net.Socket | tls.TLSSocket;
    let buffer = "";
    let step = 0;
    let settled = false;

    const finish = (err?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      socket?.destroy();
      if (err) reject(err);
      else resolve();
    };

    const timeoutId = setTimeout(() => {
      finish(new Error("Timeout de connexion SMTP (15s)."));
    }, 15000);

    const sendCmd = (cmd: string) => socket.write(cmd + "\r\n");

    const processLine = (line: string) => {
      const code = parseInt(line.slice(0, 3), 10);
      if (isNaN(code)) return;

      switch (step) {
        case 0: // Server greeting
          if (code === 220) {
            step = 1;
            sendCmd("EHLO lecteurs-juniors");
          }
          break;
        case 1: // EHLO response
          if (line.startsWith("250-")) {
            // continue reading more lines
          } else if (line.startsWith("250 ")) {
            if (cfg.secure) {
              step = 2;
              sendCmd("AUTH LOGIN");
            } else {
              step = 10;
              sendCmd("STARTTLS");
            }
          }
          break;
        case 10: // STARTTLS response
          if (code === 220) {
            // Upgrade to TLS
            const tlsSock = tls.connect(
              { socket: socket as net.Socket, servername: cfg.host },
              () => {
                socket = tlsSock;
                step = 1;
                sendCmd("EHLO lecteurs-juniors");
              }
            );
            tlsSock.on("error", (err) => finish(err));
            tlsSock.on("data", (d: Buffer) => {
              const str = d.toString("utf8");
              buffer += str;
              processBuffer();
            });
          }
          break;
        case 2: // AUTH LOGIN username prompt
          if (code === 334) {
            step = 3;
            sendCmd(Buffer.from(cfg.user).toString("base64"));
          }
          break;
        case 3: // AUTH LOGIN password prompt
          if (code === 334) {
            step = 4;
            sendCmd(Buffer.from(cfg.pass).toString("base64"));
          }
          break;
        case 4: // Auth result
          if (code === 235) {
            step = 5;
            sendCmd(`MAIL FROM:<${fromEmail}>`);
          } else {
            finish(new Error(`Authentification SMTP échouée: ${line}`));
          }
          break;
        case 5: // MAIL FROM result
          if (code === 250) {
            step = 6;
            sendCmd(`RCPT TO:<${to}>`);
          }
          break;
        case 6: // RCPT TO result
          if (code === 250) {
            step = 7;
            sendCmd("DATA");
          } else {
            finish(new Error(`Destinataire refusé: ${line}`));
          }
          break;
        case 7: // DATA result
          if (code === 354) {
            step = 8;
            sendCmd(message + "\r\n.");
          }
          break;
        case 8: // Message sent result
          if (code === 250) {
            step = 9;
            sendCmd("QUIT");
          }
          break;
        case 9: // QUIT result
          finish();
          break;
      }
    };

    const processBuffer = () => {
      while (buffer.includes("\r\n")) {
        const idx = buffer.indexOf("\r\n");
        const line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 2);
        if (line.length > 0) {
          processLine(line);
        }
      }
    };

    const onSocketData = (data: string | Buffer) => {
      buffer += typeof data === "string" ? data : data.toString("utf8");
      processBuffer();
    };

    const connectSocket = (sock: net.Socket | tls.TLSSocket) => {
      socket = sock;
      sock.setEncoding("utf8");
      sock.on("data", onSocketData);
      sock.on("error", (err) => finish(err));
    };

    if (cfg.secure) {
      const tlsSock = tls.connect(
        { host: cfg.host, port: cfg.port, servername: cfg.host },
        () => {
          connectSocket(tlsSock);
        }
      );
      tlsSock.on("error", (err) => finish(err));
    } else {
      const plainSock = net.connect({ host: cfg.host, port: cfg.port }, () => {
        connectSocket(plainSock);
      });
      plainSock.on("error", (err) => finish(err));
    }
  });
}

/** Envoie le code OTP par e-mail. Priorité : SMTP, puis mode dev. */
export async function sendOtpEmail(
  email: string,
  code: string
): Promise<{ devCode?: string }> {
  const smtpCfg = getSmtpConfig();

  if (smtpCfg) {
    try {
      await sendSmtpEmail(email, "Code de vérification — Lecteurs Juniors", code);
      return {};
    } catch (err) {
      console.error("SMTP error:", err);
      throw new Error("Échec de l'envoi de l'e-mail de vérification.");
    }
  }

  // Fallback dev : log dans la console + renvoyer le code au client
  console.log(`[OTP DEV] ${email} → ${code}`);
  return { devCode: code };
}
