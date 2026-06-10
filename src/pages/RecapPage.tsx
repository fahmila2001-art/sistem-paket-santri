import { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Package } from '../lib/types';
import { BarChart3, Calendar, ArrowLeft, Download, TrendingUp, Package as PackageIcon, CheckCircle2, Inbox, ArrowRightCircle } from 'lucide-react';

export default function RecapPage({ onBack }: { onBack: () => void }) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchRecap();
  }, [selectedMonth]);

  async function fetchRecap() {
    setLoading(true);
    const [year, month] = selectedMonth.split('-').map(Number);
    const start = new Date(year, month - 1, 1).toISOString();
    const end = new Date(year, month, 1).toISOString();

    const allPackages = await db.getPackages();
    const data = allPackages.filter(p => {
      const d = new Date(p.received_at).getTime();
      return d >= new Date(start).getTime() && d < new Date(end).getTime();
    }).sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());

    setPackages(data || []);
    setLoading(false);
  }

  const masuk = packages.filter(p => p.status === 'masuk').length;
  const diambil = packages.filter(p => p.status === 'diambil').length;
  const done = packages.filter(p => p.status === 'done').length;

  const monthLabel = new Date(selectedMonth + '-01').toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  function exportCSV() {
    const headers = ['No', 'Penerima', 'Kamar', 'Pengirim', 'Hubungan', 'Isi', 'Waktu Diterima', 'Status', 'Diambil Oleh', 'Hubungan Pengambil', 'Waktu Diambil'];
    const rows = packages.map((p, i) => [
      i + 1,
      p.recipient_name,
      p.recipient_room || '-',
      p.sender_name,
      p.sender_relation || '-',
      `"${p.contents}"`,
      new Date(p.received_at).toLocaleString('id-ID'),
      p.status,
      p.picked_up_by || '-',
      p.picker_relation || '-',
      p.picked_up_at ? new Date(p.picked_up_at).toLocaleString('id-ID') : '-',
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap-paket-${selectedMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <h1 className="text-lg font-bold text-slate-900">Rekap Laporan</h1>
            </div>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-all shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
          <span className="text-sm text-slate-500">{monthLabel}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <PackageIcon className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{packages.length}</p>
                <p className="text-xs text-slate-500">Total Paket</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-blue-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{masuk}</p>
                <p className="text-xs text-blue-500">Belum Diambil</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-amber-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <ArrowRightCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{diambil}</p>
                <p className="text-xs text-amber-500">Sudah Diambil</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{done}</p>
                <p className="text-xs text-emerald-500">Selesai</p>
              </div>
            </div>
          </div>
        </div>

        {packages.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Progres</h3>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden flex">
              {done > 0 && <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(done / packages.length) * 100}%` }} />}
              {diambil > 0 && <div className="bg-amber-400 h-full transition-all" style={{ width: `${(diambil / packages.length) * 100}%` }} />}
              {masuk > 0 && <div className="bg-blue-400 h-full transition-all" style={{ width: `${(masuk / packages.length) * 100}%` }} />}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Selesai ({done})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400" /> Diambil ({diambil})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-400" /> Masuk ({masuk})</span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-400">Memuat data...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Belum ada paket di bulan {monthLabel}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">No</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Penerima</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Pengirim</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Isi</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Diterima</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Diambil Oleh</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Waktu Ambil</th>
                    <th className="text-left px-4 py-3 text-slate-600 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((p, i) => (
                    <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{p.recipient_name}</div>
                        {p.recipient_room && <div className="text-xs text-slate-400">{p.recipient_room}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-800">{p.sender_name}</div>
                        {p.sender_relation && <div className="text-xs text-slate-400">{p.sender_relation}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-700 max-w-[200px] truncate">{p.contents}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {new Date(p.received_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{p.picked_up_by || '-'}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {p.picked_up_at ? new Date(p.picked_up_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          p.status === 'masuk' ? 'bg-blue-50 text-blue-700' :
                          p.status === 'diambil' ? 'bg-amber-50 text-amber-700' :
                          'bg-emerald-50 text-emerald-700'
                        }`}>
                          {p.status === 'masuk' ? 'Masuk' : p.status === 'diambil' ? 'Diambil' : 'Done'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
