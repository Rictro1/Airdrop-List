import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const app = express();

app.use(helmet());
app.use(cors({ origin: '*'}));
app.use(express.json());
app.use(morgan('dev'));

// Utility: daily reset of airdrop status at UTC midnight cache
let lastResetDate: string | null = null;
async function resetAirdropStatusesIfNewDay() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  if (lastResetDate !== today) {
    await prisma.airdrop.updateMany({ data: { status: 'NOT_FINISHED' } });
    lastResetDate = today;
  }
}

app.use(async (_req, _res, next) => {
  try {
    await resetAirdropStatusesIfNewDay();
  } catch (err) {
    // continue even if reset fails
  }
  next();
});

app.get('/health', (_req, res) => res.json({ ok: true }));

// Schemas
const airdropSchema = z.object({
  name: z.string().min(1),
  xHandle: z.string().min(1),
  websiteUrl: z.string().url(),
  info: z.string().min(1),
  logoUrl: z.string().url().optional().nullable(),
  tasks: z.array(z.object({ title: z.string().min(1), done: z.boolean().optional() })).optional()
});

// Airdrops
app.get('/api/airdrops', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const where = q ? { OR: [ { name: { contains: q, mode: 'insensitive' } }, { info: { contains: q, mode: 'insensitive' } } ] } : {};
  const airdrops = await prisma.airdrop.findMany({ where, include: { tasks: true }, orderBy: { createdAt: 'desc' } });
  res.json(airdrops);
});

app.post('/api/airdrops', async (req, res) => {
  const parsed = airdropSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, xHandle, websiteUrl, info, logoUrl, tasks } = parsed.data;
  const created = await prisma.airdrop.create({ data: { name, xHandle, websiteUrl, info, logoUrl: logoUrl ?? undefined, tasks: { create: (tasks || []).map(t => ({ title: t.title, done: t.done ?? false })) } }, include: { tasks: true } });
  res.status(201).json(created);
});

app.patch('/api/airdrops/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = airdropSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { name, xHandle, websiteUrl, info, logoUrl } = parsed.data;
  const updated = await prisma.airdrop.update({ where: { id }, data: { 
    ...(name !== undefined ? { name } : {}),
    ...(xHandle !== undefined ? { xHandle } : {}),
    ...(websiteUrl !== undefined ? { websiteUrl } : {}),
    ...(info !== undefined ? { info } : {}),
    ...(logoUrl !== undefined ? { logoUrl: logoUrl ?? undefined } : {}),
  } });
  res.json(updated);
});

app.patch('/api/airdrops/:id/status', async (req, res) => {
  const id = Number(req.params.id);
  const { status } = z.object({ status: z.enum(['FINISHED','NOT_FINISHED']) }).parse(req.body);
  const updated = await prisma.airdrop.update({ where: { id }, data: { status } });
  res.json(updated);
});

app.delete('/api/airdrops/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.airdrop.delete({ where: { id } });
  res.status(204).end();
});

// Tasks under airdrop
app.post('/api/airdrops/:id/tasks', async (req, res) => {
  const id = Number(req.params.id);
  const { title, done } = z.object({ title: z.string().min(1), done: z.boolean().optional() }).parse(req.body);
  const created = await prisma.task.create({ data: { title, done: done ?? false, airdropId: id } });
  res.status(201).json(created);
});

app.patch('/api/tasks/:taskId', async (req, res) => {
  const taskId = Number(req.params.taskId);
  const { title, done } = z.object({ title: z.string().min(1).optional(), done: z.boolean().optional() }).parse(req.body);
  const updated = await prisma.task.update({ where: { id: taskId }, data: { ...(title !== undefined ? { title } : {}), ...(done !== undefined ? { done } : {}) } });
  res.json(updated);
});

app.delete('/api/tasks/:taskId', async (req, res) => {
  const taskId = Number(req.params.taskId);
  await prisma.task.delete({ where: { id: taskId } });
  res.status(204).end();
});

// Faucets
const faucetSchema = z.object({ name: z.string().min(1), logoUrl: z.string().url().optional().nullable(), linkUrl: z.string().url(), status: z.boolean().optional() });
app.get('/api/faucets', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const where = q ? { OR: [ { name: { contains: q, mode: 'insensitive' } } ] } : {};
  const faucets = await prisma.faucet.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(faucets);
});
app.post('/api/faucets', async (req, res) => {
  const parsed = faucetSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await prisma.faucet.create({ data: { ...parsed.data, logoUrl: parsed.data.logoUrl ?? undefined, status: parsed.data.status ?? false } });
  res.status(201).json(created);
});
app.patch('/api/faucets/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = faucetSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await prisma.faucet.update({ where: { id }, data: { ...parsed.data, logoUrl: parsed.data.logoUrl ?? undefined } });
  res.json(updated);
});
app.delete('/api/faucets/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.faucet.delete({ where: { id } });
  res.status(204).end();
});

// Waitlists
const waitlistSchema = z.object({ name: z.string().min(1), logoUrl: z.string().url().optional().nullable(), linkUrl: z.string().url(), status: z.boolean().optional() });
app.get('/api/waitlists', async (req, res) => {
  const q = String(req.query.q || '').trim();
  const where = q ? { OR: [ { name: { contains: q, mode: 'insensitive' } } ] } : {};
  const waitlists = await prisma.waitlist.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json(waitlists);
});
app.post('/api/waitlists', async (req, res) => {
  const parsed = waitlistSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await prisma.waitlist.create({ data: { ...parsed.data, logoUrl: parsed.data.logoUrl ?? undefined, status: parsed.data.status ?? false } });
  res.status(201).json(created);
});
app.patch('/api/waitlists/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = waitlistSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const updated = await prisma.waitlist.update({ where: { id }, data: { ...parsed.data, logoUrl: parsed.data.logoUrl ?? undefined } });
  res.json(updated);
});
app.delete('/api/waitlists/:id', async (req, res) => {
  const id = Number(req.params.id);
  await prisma.waitlist.delete({ where: { id } });
  res.status(204).end();
});

const PORT = Number(process.env.PORT || 4000);
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}


