import { useState } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { Package } from '../lib/types';
import { PackagePlus, X, User, Send, Box, Clock, FileText, Camera } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
}

export default function PackageForm({ onClose, onSaved }: Props) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    recipient_name: '',
    recipient_room: '',
    sender_name: '',
    sender_relation: '',
    contents: '',
    notes: '',
    received_at: new Date().toISOString().slice(0, 16),
    imageData: null as string | null,
  });

  function update(field: string, value: any) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        update('imageData', dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.recipient_name.trim() || !form.sender_name.trim() || !form.contents.trim()) return;
    setSaving(true);

    const { error } = await db.insertPackage({
      recipient_name: form.recipient_name.trim(),
      recipient_room: form.recipient_room.trim() || null,
      sender_name: form.sender_name.trim(),
      sender_relation: form.sender_relation.trim() || null,
      contents: form.contents.trim(),
      notes: form.notes.trim() || null,
      received_at: new Date(form.received_at).toISOString(),
      received_by: user?.id,
      status: 'masuk',
      image_data: form.imageData,
    });

    setSaving(false);
    if (!error) onSaved();
  }

  const fieldStyle = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-sm";
  const labelStyle = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 pt-[5vh] overflow-y-auto"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <PackagePlus className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Paket Masuk</h2>
              <p className="text-xs text-slate-500">Catat paket yang baru diterima</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelStyle}><User className="w-4 h-4 inline mr-1" /> Nama Penerima</label>
            <input type="text" value={form.recipient_name} onChange={e => update('recipient_name', e.target.value)}
              placeholder="Nama santri penerima" className={fieldStyle} required />
          </div>
          <div>
            <label className={labelStyle}>Kamar / Kelas</label>
            <input type="text" value={form.recipient_room} onChange={e => update('recipient_room', e.target.value)}
              placeholder="Contoh: Kamar 12 / Kelas 3A" className={fieldStyle} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelStyle}><Send className="w-4 h-4 inline mr-1" /> Nama Pengirim</label>
              <input type="text" value={form.sender_name} onChange={e => update('sender_name', e.target.value)}
                placeholder="Nama pengirim" className={fieldStyle} required />
            </div>
            <div>
              <label className={labelStyle}>Hubungan</label>
              <input type="text" value={form.sender_relation} onChange={e => update('sender_relation', e.target.value)}
                placeholder="Contoh: Orang tua" className={fieldStyle} />
            </div>
          </div>
          <div>
            <label className={labelStyle}><Box className="w-4 h-4 inline mr-1" /> Isi Paket</label>
            <textarea value={form.contents} onChange={e => update('contents', e.target.value)}
              placeholder="Deskripsi isi paket" className={fieldStyle} rows={3} required />
          </div>
          <div>
            <label className={labelStyle}><Clock className="w-4 h-4 inline mr-1" /> Waktu Diterima</label>
            <input type="datetime-local" value={form.received_at} onChange={e => update('received_at', e.target.value)}
              className={fieldStyle} required />
          </div>
          <div>
            <label className={labelStyle}><FileText className="w-4 h-4 inline mr-1" /> Catatan</label>
            <input type="text" value={form.notes} onChange={e => update('notes', e.target.value)}
              placeholder="Catatan tambahan (opsional)" className={fieldStyle} />
          </div>

          <div>
            <label className={labelStyle}><Camera className="w-4 h-4 inline mr-1" /> Foto Bukti Paket</label>
            {form.imageData ? (
              <div className="relative mb-2">
                <img src={form.imageData} alt="Preview" className="w-full h-48 object-cover rounded-xl border border-slate-200" />
                <button type="button" onClick={() => update('imageData', null)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 backdrop-blur-sm">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <input type="file" accept="image/*" capture="environment" onChange={handleCapture}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-500 hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-50 transition-colors">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-sm font-medium">Ambil Foto / Upload</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-all text-sm">
              Batal
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm">
              {saving ? 'Menyimpan...' : 'Simpan Paket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
