import 'reflect-metadata';
import {
  Module,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  Res,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { db, saveUpload, uploadsDir, releasesDir } from './database';
import { isAllowedImage, optimiseIdCard } from './images';

const JWT_SECRET = process.env.JWT_SECRET || 'mindlink-dev-secret-change-me';
const ADMIN_KEY = process.env.ADMIN_KEY || 'mindlink-admin-2026';

/* ------------------------------------------------------------------ */
/* Email (SMTP) - silently skipped when not configured                 */
/* ------------------------------------------------------------------ */

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

const mailer = SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

const EMAIL_FROM = process.env.EMAIL_FROM || `MindLink.AI <${SMTP_USER}>`;

async function sendStatusEmail(
  user: { email: string; name: string; role: string },
  action: string,
  reason: string | null
) {
  if (!mailer) {
    console.log(`[email] SMTP not configured - skipped email to ${user.email} (${action})`);
    return;
  }

  const isTeacher = user.role === 'teacher';
  let subject: string;
  let lines: string[];

  if (action === 'approve' || action === 'reactivate') {
    subject = action === 'approve'
      ? 'Your MindLink.AI account has been approved'
      : 'Your MindLink.AI account has been re-activated';
    lines = [
      `Hello ${user.name},`,
      '',
      action === 'approve'
        ? `Great news! Your MindLink.AI ${isTeacher ? 'teacher' : 'student'} account request has been approved.`
        : 'Your MindLink.AI account has been re-activated by the school admin.',
      '',
      'You can now sign in to the MindLink.AI app with your email and password:',
      `   Email: ${user.email}`,
      '',
      'Welcome aboard - we will see you in class!',
      '',
      'MindLink.AI School Admin',
    ];
  } else if (action === 'reject') {
    subject = 'Your MindLink.AI signup request was not approved';
    lines = [
      `Hello ${user.name},`,
      '',
      `Unfortunately, your MindLink.AI ${isTeacher ? 'teacher' : 'student'} signup request was not approved.`,
      reason ? `Reason: ${reason}` : 'You may submit a new request with the correct details.',
      '',
      'If you believe this is a mistake, visit the school office.',
      '',
      'MindLink.AI School Admin',
    ];
  } else {
    return; // suspend: no email
  }

  try {
    const info = await mailer.sendMail({
      from: EMAIL_FROM,
      to: user.email,
      subject,
      text: lines.join('\n'),
      html: lines
        .map((l) => (l.trim() === '' ? '<br>' : `<p style="margin:4px 0">${l}</p>`))
        .join(''),
    });
    console.log(`[email] ${action} notice sent to ${user.email} (${info.messageId})`);
  } catch (err: any) {
    console.warn(`[email] FAILED to send ${action} email to ${user.email}: ${err?.message}`);
  }
}

function fail(status: number, message: any): never {
  throw new HttpException({ success: false, message }, status);
}

const adminKeyOf = (req: any) =>
  req.headers['x-admin-key'] ||
  req.query?.key ||
  (typeof req.headers.authorization === 'string' &&
    req.headers.authorization.replace(/^Bearer\s+/i, ''));

function requireAdmin(req: any) {
  const key = adminKeyOf(req);
  if (!key || String(key) !== ADMIN_KEY) fail(HttpStatus.UNAUTHORIZED, 'Invalid admin key');
}

const isAdmin = (req: any) => {
  const key = adminKeyOf(req);
  return Boolean(key) && String(key) === ADMIN_KEY;
};

function publicUser(row: any) {
  if (!row) return null;
  return {
    id: row.id,
    role: row.role,
    name: row.name,
    email: row.email,
    phone: row.phone,
    rollNumber: row.rollNumber,
    status: row.status,
    idCardFront: row.idCardFrontPath,
    idCardBack: row.idCardBackPath,
    createdAt: row.createdAt,
    approvedAt: row.approvedAt,
    rejectedReason: row.rejectedReason,
    lastLoginAt: row.lastLoginAt,
  };
}

function otpToken() {
  return crypto.randomBytes(20).toString('hex');
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

@Controller('api/auth')
class AuthController {
  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'idCardFront', maxCount: 1 },
        { name: 'idCardBack', maxCount: 1 },
      ],
      { storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } }
    )
  )
  async register(@Body() body: any, @UploadedFiles() files: any) {
    const front = files?.idCardFront?.[0];
    const back = files?.idCardBack?.[0];

    const role = String(body.role || '').toLowerCase();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const phone = String(body.phone || '').trim();
    const rollNumber = String(body.rollNumber || '').trim();
    const password = String(body.password || '');

    if (role !== 'student' && role !== 'teacher') fail(400, 'Role must be student or teacher');
    if (!name || name.length < 3) fail(400, 'Full name is required');
    if (!/^\S+@\S+\.\S+$/.test(email)) fail(400, 'A valid email is required');
    if (!/^[\d+\-\s()]{6,20}$/.test(phone)) fail(400, 'A valid phone number is required');
    if (!rollNumber) fail(400, role === 'student' ? 'Student / roll ID is required' : 'Teacher ID is required');
    if (password.length < 6) fail(400, 'Password must be at least 6 characters');
    if (!isAllowedImage(front)) fail(400, 'Upload a JPG, PNG or WebP photo of the front of your ID card');
    if (!isAllowedImage(back)) fail(400, 'Upload a JPG, PNG or WebP photo of the back of your ID card');

    const existing = db
      .prepare('SELECT id, status FROM users WHERE email = ?')
      .get(email) as any;
    if (existing) {
      if (existing.status === 'pending')
        fail(409, 'This email already has a request awaiting approval');
      fail(409, 'An account with this email already exists');
    }

    // Keep ID card images small and dashboard-friendly. Old app versions may
    // still send multi-megabyte photos, so do the reduction on the server too.
    const [frontOptimised, backOptimised] = await Promise.all([
      optimiseIdCard(front.buffer),
      optimiseIdCard(back.buffer),
    ]);
    const frontName = saveUpload(
      {
        ...front,
        buffer: frontOptimised || front.buffer,
        originalname: frontOptimised ? 'id-card-front.jpg' : front.originalname,
      },
      'front'
    );
    const backName = saveUpload(
      {
        ...back,
        buffer: backOptimised || back.buffer,
        originalname: backOptimised ? 'id-card-back.jpg' : back.originalname,
      },
      'back'
    );
    const hash = bcrypt.hashSync(password, 10);

    let inserted: any;
    try {
      const result = db
        .prepare(
          `INSERT INTO users
            (role, name, email, phone, rollNumber, passwordHash, status,
             idCardFrontPath, idCardBackPath, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
        )
        .run(role, name, email, phone, rollNumber, hash, frontName, backName, new Date().toISOString());
      inserted = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } catch (err: any) {
      if (String(err.message || '').includes('users_roll_unique'))
        fail(409, `A request with this ${role === 'student' ? 'student roll' : 'teacher'} ID already exists`);
      throw err;
    }

    console.log(`[auth] signup request #${inserted.id} (${role}) ${email} -> pending`);
    return {
      success: true,
      status: 'pending',
      requestId: inserted.id,
      message: 'Signup request submitted. Your account will be active after admin approval.',
    };
  }

  @Post('login')
  login(@Body() body: any) {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    if (!email || !password) fail(400, 'Email and password are required');

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    // constant-ish response: do not reveal which part failed
    if (!user || !bcrypt.compareSync(password, user.passwordHash))
      fail(401, 'Email or password is incorrect');

    if (user.status === 'pending')
      fail(403, {
        code: 'PENDING',
        status: 'pending',
        message: 'Your account is awaiting admin approval.',
      });
    if (user.status === 'suspended')
      fail(403, {
        code: 'SUSPENDED',
        status: 'suspended',
        message: 'This account has been suspended. Contact the school office.',
      });
    if (user.status === 'rejected')
      fail(403, {
        code: 'REJECTED',
        status: 'rejected',
        message: user.rejectedReason
          ? `Signup rejected: ${user.rejectedReason}`
          : 'Your signup request was rejected.',
      });

    db.prepare('UPDATE users SET lastLoginAt = ? WHERE id = ?')
      .run(new Date().toISOString(), user.id);

    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email, name: user.name, jti: otpToken() },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return {
      success: true,
      token,
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        rollNumber: user.rollNumber,
      },
    };
  }
}

/* ------------------------------------------------------------------ */
/* Admin: users management                                             */
/* ------------------------------------------------------------------ */

@Controller('api/users')
class UsersController {
  @Get()
  list(@Req() req: any) {
    requireAdmin(req);
    const rows = db
      .prepare(
        `SELECT * FROM users
          WHERE status IN ('active','suspended')
          ORDER BY CASE status WHEN 'active' THEN 0 ELSE 1 END, createdAt DESC`
      )
      .all() as any[];
    return { success: true, users: rows.map(publicUser) };
  }

  @Get('requests')
  requests(@Req() req: any) {
    requireAdmin(req);
    const rows = db
      .prepare(
        `SELECT * FROM users WHERE status = 'pending'
          ORDER BY createdAt DESC`
      )
      .all() as any[];
    return { success: true, requests: rows.map(publicUser) };
  }

  @Post(':id/status')
  setStatus(@Param('id') id: string, @Req() req: any, @Body() body: any) {
    requireAdmin(req);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(id)) as any;
    if (!user) fail(404, 'User not found');

    const action = String(body.action || '').toLowerCase();
    const reason = body.reason ? String(body.reason).slice(0, 300) : null;

    if (action === 'approve') {
      db.prepare(`UPDATE users SET status = 'active', approvedAt = ?, rejectedReason = NULL WHERE id = ?`)
        .run(new Date().toISOString(), user.id);
    } else if (action === 'suspend') {
      db.prepare(`UPDATE users SET status = 'suspended' WHERE id = ?`).run(user.id);
    } else if (action === 'reject') {
      db.prepare(`UPDATE users SET status = 'rejected', rejectedReason = ? WHERE id = ?`)
        .run(reason || 'Not approved by admin', user.id);
    } else if (action === 'reactivate') {
      db.prepare(`UPDATE users SET status = 'active', approvedAt = ?, rejectedReason = NULL WHERE id = ?`)
        .run(new Date().toISOString(), user.id);
    } else {
      fail(400, 'action must be approve | suspend | reject | reactivate');
    }

    const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);
    console.log(`[admin] user #${user.id} -> ${action}`);

    // fire-and-forget email notification (never blocks the admin response)
    if (action === 'approve' || action === 'reject' || action === 'reactivate') {
      sendStatusEmail(user, action, reason).catch(() => {});
    }

    return { success: true, user: publicUser(updated) };
  }
}

/* ------------------------------------------------------------------ */
/* Admin: ID card images                                               */
/* ------------------------------------------------------------------ */

@Controller('api/uploads')
class UploadsController {
  @Get(':file')
  serve(@Param('file') file: string, @Req() req: any, @Res() res: any) {
    requireAdmin(req);
    const name = String(file || '').replace(/[^a-zA-Z0-9._-]/g, '');
    const full = path.join(uploadsDir, name);
    if (!name.startsWith('.') && fs.existsSync(full)) {
      const ext = path.extname(name).toLowerCase();
      const types: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
      };
      res.setHeader('Content-Type', types[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'private, max-age=300');
      fs.createReadStream(full).pipe(res);
    } else {
      res.status(404).json({ success: false, message: 'File not found' });
    }
  }
}

/* ------------------------------------------------------------------ */
/* OTA (unchanged contract for the installed APK)                      */
/* ------------------------------------------------------------------ */

function semverGt(a, b) {
  const pa = String(a || '0.0.0').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b || '0.0.0').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) > (pb[i] || 0)) return true;
    if ((pa[i] || 0) < (pb[i] || 0)) return false;
  }
  return false;
}

@Controller('api/ota')
class OtaController {
  @Get('check')
  checkVersion(@Req() req: any) {
    const row = db.prepare(`SELECT value FROM ota_state WHERE key = 'version'`).get() as any;
    const latest = row?.value || '1.0.0';
    // current bundle a client reports (sent as ?clientVersion=)
    const clientVersion = String(req.query?.clientVersion || '0.0.0');
    const updateAvailable = semverGt(latest, clientVersion);
    // log every check so we can see exactly which versions phones report
    try {
      const agent =
        String(req.headers?.['user-agent'] || '-') +
        (String(req.headers?.['x-forwarded-for'] || '')
          ? ` via ${req.headers['x-forwarded-for']}`
          : '');
      fs.appendFileSync(
        path.join(__dirname, '..', 'data', 'ota-checks.log'),
        `${new Date().toISOString()} clientVersion=${clientVersion} ua=${agent}\n`
      );
    } catch {
      // logging must never break the endpoint
    }
    return {
      updateAvailable,
      currentVersion: latest,
      bundleUrl: '',
      message: updateAvailable
        ? `Version ${latest} is available.`
        : `App is up to date (installed v${clientVersion}).`,
    };
  }

  @Post('publish')
  publishUpdate(@Req() req: any, @Body() body: { version: string; bundleUrl: string }) {
    requireAdmin(req);
    if (!body || !body.version) fail(400, 'version is required');
    db.prepare(
      `INSERT INTO ota_state (key, value) VALUES ('version', ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).run(String(body.version));
    console.log(`[ota] published version ${body.version}`);
    return {
      success: true,
      message: `OTA update version ${body.version} published successfully!`,
      publishedAt: new Date().toISOString(),
    };
  }
}

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Server-driven content (Flutter client reads everything from here)   */
/* ------------------------------------------------------------------ */

// Seed defaults live in the data folder so they stay portable for Proxmox.
function readContentDefaults(): any {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '..', 'data', 'content-defaults.json'), 'utf8');
    const parsed = JSON.parse(raw);
    return {
      courses: parsed.courses || [],
      notices: parsed.notices || [],
      texts: parsed.texts || {},
    };
  } catch {
    return { courses: [], notices: [], texts: {} };
  }
}

function getContentTree(): any {
  const seed = readContentDefaults();
  const readKey = (key: string, fallback: any) => {
    const row = db.prepare('SELECT value FROM content_state WHERE key = ?').get(key) as any;
    if (!row) {
      db.prepare('INSERT OR IGNORE INTO content_state (key, value) VALUES (?, ?)')
        .run(key, JSON.stringify(fallback));
      return fallback;
    }
    try {
      return JSON.parse(row.value);
    } catch {
      return fallback;
    }
  };
  return {
    courses: readKey('courses', seed.courses),
    notices: readKey('notices', seed.notices),
    texts: readKey('texts', seed.texts),
  };
}

@Controller('api/content')
class ContentController {
  @Get()
  all() {
    const tree = getContentTree();
    return { success: true, ...tree };
  }

  @Post(':key')
  replace(@Req() req: any, @Param('key') key: string, @Body() body: any) {
    requireAdmin(req);
    if (!['courses', 'notices', 'texts'].includes(String(key))) fail(400, 'Unknown content key');
    if (body === undefined || body === null) fail(400, 'Value is required');
    const value = key === 'texts'
      ? { ...getContentTree().texts, ...body }
      : body;
    db.prepare(
      `INSERT INTO content_state (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`
    ).run(String(key), JSON.stringify(value));
    console.log(`[content] ${key} updated`);
    return { success: true, message: `${key} saved` };
  }
}

/* ------------------------------------------------------------------ */
/* App release APK (in-app updater for the Flutter client)             */
/* ------------------------------------------------------------------ */

@Controller('api/app')
class AppReleasesController {
  @Get('latest')
  latest() {
    const row = db
      .prepare('SELECT * FROM app_releases ORDER BY publishedAt DESC LIMIT 1')
      .get() as any;
    if (!row) {
      return { success: true, version: null, updateAvailable: false };
    }
    return {
      success: true,
      version: row.version,
      notes: row.notes || '',
      publishedAt: row.publishedAt,
      updateAvailable: true,
      url: '/api/app/apk',
    };
  }

  @Post('publish')
  @UseInterceptors(
    FileInterceptor('apk', { storage: multer.memoryStorage(), limits: { fileSize: 120 * 1024 * 1024 } })
  )
  publish(@Req() req: any, @Body() body: any, @UploadedFiles() apkFile: any) {
    requireAdmin(req);
    const apk = apkFile || req.file;
    const version = String(body?.version || '').trim();
    if (!/^[\d.]+$/.test(version)) fail(400, 'A numeric version like 1.3.0 is required');
    if (!apk || !/\.apk$/i.test(apk.originalname || ''))
      fail(400, 'An .apk file is required');

    const filename = `mindlink-student-v${version}.apk`;
    fs.writeFileSync(path.join(releasesDir, filename), apk.buffer);
    db.prepare(
      'INSERT INTO app_releases (version, file, notes, publishedAt) VALUES (?, ?, ?, ?)'
    ).run(version, filename, String(body?.notes || ''), new Date().toISOString());
    console.log(`[app] release v${version} published (${filename}, ${apk.buffer.length} bytes)`);
    return {
      success: true,
      message: `Release ${version} published successfully!`,
      version,
    };
  }

  @Get('apk')
  serveApk(@Req() req: any, @Res() res: any) {
    const row = db
      .prepare('SELECT * FROM app_releases ORDER BY publishedAt DESC LIMIT 1')
      .get() as any;
    const full = row ? path.join(releasesDir, row.file) : '';
    if (row && fs.existsSync(full)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${row.file}"`);
      fs.createReadStream(full).pipe(res);
    } else {
      res.status(404).json({ success: false, message: 'No release published yet' });
    }
  }
}

/* ------------------------------------------------------------------ */

@Module({
  controllers: [
    AuthController,
    UsersController,
    UploadsController,
    OtaController,
    ContentController,
    AppReleasesController,
  ],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`MindLink OTA & Backend Service running on port ${port}`);
  console.log(`Admin key: ${ADMIN_KEY === 'mindlink-admin-2026' ? '(default) mindlink-admin-2026' : '(from env)'}`);
}
bootstrap();
