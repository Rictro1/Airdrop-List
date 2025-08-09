import { useState } from 'react';
import Reveal from '../ui/animate/Reveal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Waitlist, api } from '../lib/api';
import Modal from '../components/Modal';
import { Table, THead, TBody, Th, Td } from '../components/Table';

export default function WaitlistsPage() {
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState<Waitlist | null>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['waitlists', search],
    queryFn: async () => (await api.get<Waitlist[]>('/api/waitlists', { params: { q: search } })).data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<Waitlist>) => (await api.post('/api/waitlists', payload)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['waitlists'] }); setOpenAdd(false); alert('Success add waitlist'); }
  });
  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Waitlist> }) => (await api.patch(`/api/waitlists/${id}`, payload)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['waitlists'] }); setEditing(null); alert('Success edit waitlist'); }
  });
  const remove = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/waitlists/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['waitlists'] }); alert('Success delete waitlist'); }
  });

  const waitlists = data || [];

  return (
    <section className="space-y-6">
      <Reveal className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search waitlist..." className="input w-72" />
        <button className="btn btn-primary" onClick={() => setOpenAdd(true)}>Add Waitlist</button>
      </Reveal>

      <Reveal>
      <Table>
        <THead>
          <tr>
            <Th className="w-20">Logo</Th>
            <Th className="w-[28%]">Waitlist Name</Th>
            <Th className="w-[22%]">Web Link</Th>
            <Th className="w-[22%]">Action</Th>
            <Th className="w-40">Status</Th>
          </tr>
        </THead>
        <TBody>
          {waitlists.map(w => (
            <tr key={w.id} className="table-row">
              <Td>{w.logoUrl ? <img src={w.logoUrl} className="w-10 h-10 rounded-lg" /> : <div className="w-10 h-10 rounded-lg bg-white/10" />}</Td>
              <Td className="font-medium">{w.name}</Td>
              <Td><a target="_blank" href={w.linkUrl} className="btn inline-block">Open</a></Td>
              <Td className="space-x-2">
                <button className="btn" onClick={() => setEditing(w)}>Edit</button>
                <button className="btn btn-danger" onClick={() => remove.mutate(w.id)}>Delete</button>
              </Td>
              <Td>
                <span className={`badge inline-block w-[8.5rem] text-center ${w.status ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/70'}`}>{w.status ? 'Active' : 'Inactive'}</span>
              </Td>
            </tr>
          ))}
        </TBody>
      </Table>
      </Reveal>

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Waitlist">
        <WaitlistForm onSubmit={payload => create.mutate(payload)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Waitlist">
        {editing && <WaitlistForm initial={editing} onSubmit={payload => update.mutate({ id: editing.id, payload })} />}
      </Modal>
    </section>
  );
}

function WaitlistForm({ initial, onSubmit }: { initial?: Partial<Waitlist>; onSubmit: (payload: Partial<Waitlist>) => void }) {
  const [name, setName] = useState(initial?.name || '');
  const [logoUrl, setLogoUrl] = useState(initial?.logoUrl || '');
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl || '');
  const [status, setStatus] = useState(!!initial?.status);
  return (
    <div className="grid gap-3">
      <label className="grid gap-1">
        <span className="text-white/70">Name</span>
        <input className="glass px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
      </label>
      <label className="grid gap-1">
        <span className="text-white/70">Logo URL</span>
        <input className="glass px-3 py-2" value={logoUrl || ''} onChange={e => setLogoUrl(e.target.value)} />
      </label>
      <label className="grid gap-1">
        <span className="text-white/70">Web Link</span>
        <input className="glass px-3 py-2" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
      </label>
      <label className="flex items-center gap-2 text-white/80">
        <input type="checkbox" checked={status} onChange={e => setStatus(e.target.checked)} /> Active
      </label>
      <div className="flex justify-end">
        <button className="glass px-4 py-2" onClick={() => onSubmit({ name, logoUrl, linkUrl, status })}>Save</button>
      </div>
    </div>
  );
}


