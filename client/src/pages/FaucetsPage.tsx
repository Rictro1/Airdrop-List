import { useState } from 'react';
import Reveal from '../ui/animate/Reveal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Faucet, api } from '../lib/api';
import Modal from '../components/Modal';
import { Table, THead, TBody, Th, Td } from '../components/Table';

export default function FaucetsPage() {
  const [search, setSearch] = useState('');
  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState<Faucet | null>(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ['faucets', search],
    queryFn: async () => (await api.get<Faucet[]>('/api/faucets', { params: { q: search } })).data,
  });

  const create = useMutation({
    mutationFn: async (payload: Partial<Faucet>) => (await api.post('/api/faucets', payload)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faucets'] }); setOpenAdd(false); alert('Success add faucet'); }
  });
  const update = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: Partial<Faucet> }) => (await api.patch(`/api/faucets/${id}`, payload)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faucets'] }); setEditing(null); alert('Success edit faucet'); }
  });
  const remove = useMutation({
    mutationFn: async (id: number) => (await api.delete(`/api/faucets/${id}`)).data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['faucets'] }); alert('Success delete faucet'); }
  });

  const faucets = data || [];

  return (
    <section className="space-y-6">
      <Reveal className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search faucet..." className="input w-72" />
        <button className="btn btn-primary" onClick={() => setOpenAdd(true)}>Add Faucet</button>
      </Reveal>

      <Reveal>
      <Table>
        <THead>
          <tr>
            <Th className="w-20">Logo</Th>
            <Th className="w-[28%]">Airdrop Name</Th>
            <Th className="w-[22%]">Faucet Link</Th>
            <Th className="w-[22%]">Action</Th>
            <Th className="w-40">Status</Th>
          </tr>
        </THead>
        <TBody>
          {faucets.map(f => (
            <tr key={f.id} className="table-row">
              <Td>{f.logoUrl ? <img src={f.logoUrl} className="w-10 h-10 rounded-lg" /> : <div className="w-10 h-10 rounded-lg bg-white/10" />}</Td>
              <Td className="font-medium">{f.name}</Td>
              <Td><a target="_blank" href={f.linkUrl} className="btn inline-block">Open</a></Td>
              <Td className="space-x-2">
                <button className="btn" onClick={() => setEditing(f)}>Edit</button>
                <button className="btn btn-danger" onClick={() => remove.mutate(f.id)}>Delete</button>
              </Td>
              <Td>
                <span className={`badge inline-block w-[8.5rem] text-center ${f.status ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/70'}`}>{f.status ? 'Active' : 'Inactive'}</span>
              </Td>
            </tr>
          ))}
        </TBody>
      </Table>
      </Reveal>

      <Modal open={openAdd} onClose={() => setOpenAdd(false)} title="Add Faucet">
        <FaucetForm onSubmit={payload => create.mutate(payload)} />
      </Modal>
      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Faucet">
        {editing && <FaucetForm initial={editing} onSubmit={payload => update.mutate({ id: editing.id, payload })} />}
      </Modal>
    </section>
  );
}

function FaucetForm({ initial, onSubmit }: { initial?: Partial<Faucet>; onSubmit: (payload: Partial<Faucet>) => void }) {
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
        <span className="text-white/70">Faucet Link</span>
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


