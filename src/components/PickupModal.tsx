import { useState } from 'react';
import { db } from '../lib/db';
import { Package } from '../lib/types';
import { X, UserCheck, Clock } from 'lucide-react';

interface Props {
  pkg: Package;
  onClose: () => void;
  onSaved: () => void;
}

export default function PickupModal({ pkg, onClose, onSaved }: Props) {
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState<'pemilik' | 'orang_lain'>('pemilik');
  const [pickerName, setPickerName] = useState('');
  const [pickerRelation, setPickerRelation] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const now = new Date().toISOString();
    const updates: Partial<Package> = {
      status: 'diambil',
      picked_up_at: now,
      pickup_method: method,
    };

    if (method === 'pemilik') {
      updates.picked_up_by = pkg.recipient_name;
      updates.picker_name = null;
      updates.picker_relation = null;
    } else {
      if (!pickerName.trim()) { setSaving(false); return; }
      updates.picked_up_by = pickerName.trim();
      updates.picker_name = pickerName.trim();
      updates.picker_relation = pickerRelation.trim() || null;
    }

    const { error } = await db.updatePackage(pkg.id, updates);
    setSaving(false);
    if (!error) onSaved();
  }

  async function markDone() {
    setSaving(true);
    const { error } = await db.updatePackage(pkg.id, { status: 'done' });
    setSaving(false);
    if (!error) onSaved();
  }

  const fieldStyle = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-[5vh] overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pengambilan Paket</h2>
              <p className="text-xs text-slate-500">Untuk: {pkg.recipient_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-slate-50 rounded-xl p-4 mb-5 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Pengirim</span><span className="text-slate-800 font-medium">{pkg.sender_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Isi</span><span className="text-slate-800 font-medium max-w-[200px] truncate">{pkg.contents}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Diterima</span><span className="text-slate-800 font-medium">{new Date(pkg.received_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
          </div>

          {pkg.status === 'masuk' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Diambil oleh</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setMethod('pemilik')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                      method === 'pemilik' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                    Pemilik Sendiri
                  </button>
                  <button type="button" onClick={() => setMethod('orang_lain')}
                    className={`py-3 px-4 rounded-xl text-sm font-medium transition-all border ${
                      method === 'orang_lain' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}>
                    Orang Lain
                  </button>
                </div>
              </div>

              {method === 'orang_lain' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Pengambil</label>
                    <input type="text" value={pickerName} onChange={e => setPickerName(e.target.value)}
                      placeholder="Nama yang mengambilkan" className={fieldStyle} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Hubungan dengan Penerima</label>
                    <input type="text" value={pickerRelation} onChange={e => setPickerRelation(e.target.value)}
                      placeholder="Contoh: Teman sekamar" className={fieldStyle} />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose}
                  className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm">
                  {saving ? 'Menyimpan...' : 'Konfirmasi Diambil'}
                </button>
              </div>
            </form>
          )}

          {pkg.status === 'diambil' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm">
                <p className="text-emerald-800 font-medium">Paket sudah diambil</p>
                <p className="text-emerald-600 mt-1">
                  Diambil oleh: {pkg.picked_up_by} {pkg.pickup_method === 'orang_lain' && pkg.picker_relation ? `(${pkg.picker_relation})` : ''}
                </p>
                <p className="text-emerald-600">
                  <Clock className="w-3.5 h-3.5 inline mr-1" />
                  {pkg.picked_up_at ? new Date(pkg.picked_up_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                </p>
              </div>
              <button onClick={markDone} disabled={saving}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
                {saving ? 'Memproses...' : 'Tandai Selesai (Done)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
