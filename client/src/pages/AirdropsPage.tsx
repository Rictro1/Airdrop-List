import { useMemo, useState } from 'react';
import Reveal from '../ui/animate/Reveal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Airdrop, api, twitterHandleToAvatarUrl } from '../lib/api';
import Modal from '../components/Modal';
import { Table, THead, TBody, Th, Td } from '../components/Table';

export default function AirdropsPage() {
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [detail, setDetail] = useState<Airdrop | null>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['airdrops', search],
    queryFn: async () => (await api.get<Airdrop[]>('/api/airdrops', { params: { q: search } })).data,
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'FINISHED' | 'NOT_FINISHED' }) => (await api.patch(`/api/airdrops/${id}/status`, { status })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['airdrops'] })
  });

  const remove = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/airdrops/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['airdrops'] })
  });

  const airdrops = data || [];

  return (
    <section className="space-y-6">
      <Reveal className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search airdrop..." className="input w-72" />
        </div>
        <button className="btn btn-primary" onClick={() => setOpenAdd(true)}>Add Airdrop</button>
      </Reveal>

      <Reveal>
      <Table>
        <THead>
          <tr>
            <Th className="w-20">Logo</Th>
            <Th className="w-[22%]">Airdrop Name</Th>
            <Th className="w-[18%]">Project Link</Th>
            <Th className="w-[22%]">Airdrop Detail</Th>
            <Th className="w-[18%]">Action</Th>
            <Th className="w-40">Status</Th>
          </tr>
        </THead>
        <TBody>
          {airdrops.map(ad => (
            <tr key={ad.id} className="table-row group">
              <Td>
                <img src={ad.logoUrl || twitterHandleToAvatarUrl(ad.xHandle)} alt={ad.name} className="airdrop-logo group-hover:scale-110" />
              </Td>
              <Td className="font-semibold text-white/90">{ad.name}</Td>
              <Td>
                <a href={ad.websiteUrl} target="_blank" className="btn inline-block">
                  <span className="flex items-center gap-2">
                    <span>Open</span>
                    <span className="text-xs">↗</span>
                  </span>
                </a>
              </Td>
              <Td>
                <button className="btn" onClick={() => setDetail(ad)}>
                  <span className="flex items-center gap-2">
                    <span>See Details</span>
                    <span className="text-xs">👁</span>
                  </span>
                </button>
              </Td>
              <Td>
                <button className="btn btn-danger" onClick={() => remove.mutate(ad.id)}>
                  <span className="flex items-center gap-2">
                    <span>Delete</span>
                    <span className="text-xs">🗑</span>
                  </span>
                </button>
              </Td>
              <Td>
                <button
                  className={`btn status-btn ${ad.status === 'FINISHED' ? 'status-finished' : 'status-not-finished'}`}
                  onClick={() => setStatus.mutate({ id: ad.id, status: ad.status === 'FINISHED' ? 'NOT_FINISHED' : 'FINISHED' })}
                >
                  <span className="flex items-center gap-2">
                    <span>{ad.status === 'FINISHED' ? 'Finished' : 'Not Finished'}</span>
                    <span className="text-xs">{ad.status === 'FINISHED' ? '✅' : '⏳'}</span>
                  </span>
                </button>
              </Td>
            </tr>
          ))}
        </TBody>
      </Table>
      </Reveal>

      <AddAirdropModal open={openAdd} onClose={() => setOpenAdd(false)} />
      {detail && <AirdropDetailModal airdrop={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}

function AddAirdropModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [xHandle, setXHandle] = useState('');
  const [name, setName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [info, setInfo] = useState('');
  const [tasks, setTasks] = useState<string[]>(['']);

  const add = useMutation({
    mutationFn: async () => (await api.post('/api/airdrops', {
      name, xHandle, websiteUrl, info,
      logoUrl: twitterHandleToAvatarUrl(xHandle),
      tasks: tasks.filter(Boolean).map(t => ({ title: t }))
    })).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['airdrops'] }); onClose(); alert('Successfully add airdrop'); }
  });

  return (
    <Modal open={open} onClose={onClose} title="Add Airdrop">
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-white/70">Logo (X account link or @handle)</span>
          <input className="glass px-3 py-2" value={xHandle} onChange={e => setXHandle(e.target.value)} placeholder="https://x.com/project or @project" />
        </label>
        <label className="grid gap-1">
          <span className="text-white/70">Airdrop Name</span>
          <input className="glass px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-white/70">Airdrop information</span>
          <textarea className="glass px-3 py-2" value={info} onChange={e => setInfo(e.target.value)} rows={4} />
        </label>
        <label className="grid gap-1">
          <span className="text-white/70">Project Website</span>
          <input className="glass px-3 py-2" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..." />
        </label>
        <div className="grid gap-2">
          <div className="text-white/70">Tasks</div>
          {tasks.map((t, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <input className="glass px-3 py-2 flex-1" value={t} onChange={e => setTasks(s => s.map((v, i) => i === idx ? e.target.value : v))} placeholder={`Task ${idx + 1}`} />
              <button className="glass px-3 py-2" onClick={() => setTasks(s => s.filter((_, i) => i !== idx))}>Delete</button>
            </div>
          ))}
          <button className="glass px-3 py-2 w-fit" onClick={() => setTasks(s => [...s, ''])}>+ Add Task</button>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button className="glass px-4 py-2" onClick={() => add.mutate()} disabled={add.isPending}>Add</button>
        </div>
      </div>
    </Modal>
  );
}

function AirdropDetailModal({ airdrop, onClose }: { airdrop: Airdrop; onClose: () => void }) {
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [local, setLocal] = useState(() => ({
    name: airdrop.name,
    xHandle: airdrop.xHandle,
    websiteUrl: airdrop.websiteUrl,
    info: airdrop.info
  }));

  const addTask = useMutation({
    mutationFn: async (title: string) => (await api.post(`/api/airdrops/${airdrop.id}/tasks`, { title })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['airdrops'] })
  });
  const patchTask = useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => (await api.patch(`/api/tasks/${id}`, { title })).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['airdrops'] })
  });
  const deleteTask = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/tasks/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['airdrops'] })
  });
  const updateAd = useMutation({
    mutationFn: async () => (await api.patch(`/api/airdrops/${airdrop.id}`, local)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['airdrops'] }); setEditOpen(false); }
  });

  return (
    <Modal open onClose={onClose} title="Airdrop Detail" maxWidth="max-w-3xl">
      <div className="flex items-start gap-4">
        <img src={airdrop.logoUrl || twitterHandleToAvatarUrl(airdrop.xHandle)} className="w-14 h-14 rounded-xl object-cover" />
        <div className="flex-1">
          <div className="text-xl font-semibold">{airdrop.name}</div>
          <a className="text-accent-400" href={airdrop.websiteUrl} target="_blank">{airdrop.websiteUrl}</a>
        </div>
      </div>
      <div className="mt-4 glass p-4">
        <div className="text-white/80 whitespace-pre-wrap">{airdrop.info}</div>
      </div>
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-white/80">Tasks</div>
          <button className="glass px-3 py-1" onClick={() => addTask.mutate('New Task')}>+ Add</button>
        </div>
        <div className="glass divide-y divide-white/10">
          {airdrop.tasks.map(t => (
            <div key={t.id} className="flex items-center gap-2 px-3 py-2">
              <input className="bg-transparent flex-1 outline-none" defaultValue={t.title} onBlur={e => patchTask.mutate({ id: t.id, title: e.target.value })} />
              <button className="glass px-3 py-1" onClick={() => deleteTask.mutate(t.id)}>Delete</button>
            </div>
          ))}
          {airdrop.tasks.length === 0 && <div className="px-3 py-3 text-white/50">No tasks yet.</div>}
        </div>
      </div>
      <div className="flex justify-end mt-6">
        <button className="glass px-4 py-2" onClick={() => setEditOpen(v => !v)}>Edit</button>
      </div>
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Airdrop">
        <div className="grid gap-3">
          <label className="grid gap-1">
            <span className="text-white/70">Logo (X account link or @handle)</span>
            <input className="glass px-3 py-2" value={local.xHandle} onChange={e => setLocal(s => ({ ...s, xHandle: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-white/70">Airdrop Name</span>
            <input className="glass px-3 py-2" value={local.name} onChange={e => setLocal(s => ({ ...s, name: e.target.value }))} />
          </label>
          <label className="grid gap-1">
            <span className="text-white/70">Airdrop information</span>
            <textarea className="glass px-3 py-2" value={local.info} onChange={e => setLocal(s => ({ ...s, info: e.target.value }))} rows={4} />
          </label>
          <label className="grid gap-1">
            <span className="text-white/70">Project Website</span>
            <input className="glass px-3 py-2" value={local.websiteUrl} onChange={e => setLocal(s => ({ ...s, websiteUrl: e.target.value }))} />
          </label>
          <div className="flex justify-end">
            <button className="glass px-4 py-2" onClick={() => updateAd.mutate()}>Save</button>
          </div>
        </div>
      </Modal>
    </Modal>
  );
}


