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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { db, saveUpload, uploadsDir } from './database';

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

function imageAllowed(file: any) {
  const ok = ['image/jpeg', 'image/png', 'image/webp'];
  return Boolean(file) && ok.includes(file.mimetype);
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
      { storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }
    )
  )
  register(@Body() body: any, @UploadedFiles() files: any) {
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
    if (!imageAllowed(front)) fail(400, 'ID card front image (jpg/png/webp, max 5MB) is required');
    if (!imageAllowed(back)) fail(400, 'ID card back image (jpg/png/webp, max 5MB) is required');

    const existing = db
      .prepare('SELECT id, status FROM users WHERE email = ?')
      .get(email) as any;
    if (existing) {
      if (existing.status === 'pending')
        fail(409, 'This email already has a request awaiting approval');
      fail(409, 'An account with this email already exists');
    }

    const frontName = saveUpload(front, 'front');
    const backName = saveUpload(back, 'back');
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

@Controller('api/ota')
class OtaController {
  @Get('check')
  checkVersion() {
    const row = db.prepare(`SELECT value FROM ota_state WHERE key = 'version'`).get() as any;
    const latest = row?.value || '1.0.0';
    const updateAvailable = latest !== '1.0.0';
    return {
      updateAvailable,
      currentVersion: latest,
      bundleUrl: '',
      message: updateAvailable
        ? `Version ${latest} is available.`
        : 'App is up to date.',
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

@Module({
  controllers: [AuthController, UsersController, UploadsController, OtaController],
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
