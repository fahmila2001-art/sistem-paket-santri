import { useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import { useAuth } from '../lib/auth';
import { Package as PackageT } from '../lib/types';
import PackageForm from '../components/PackageForm';
import PackageCard from '../components/PackageCard';
import PickupModal from '../components/PickupModal';
import RecapPage from './RecapPage';
import { PackagePlus, LogOut, Search, Inbox, ArrowRightCircle, CheckCircle2, BarChart3, Shield, Filter, X, Package as PkgIcon } from 'lucide-react';

export default function DashboardPage() {
  const { profile, signOut } = useAuth();
  const [packages, setPackages] = useState<PackageT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pickupPkg, setPickupPkg] = useState<PackageT | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRecap, setShowRecap] = useState(false);

  const fetchPackages = useCallback(async () => {
    const data = await db.getPackages();
    data.sort((a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime());
    setPackages(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const filtered = packages.filter(p => {
    const matchSearch = !search ||
      p.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      p.sender_name.toLowerCase().includes(search.toLowerCase()) ||
      p.contents.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const masuk = packages.filter(p => p.status === 'masuk').length;
  const diambil = packages.filter(p => p.status === 'diambil').length;
  const done = packages.filter(p => p.status === 'done').length;

  if (showRecap) return <RecapPage onBack={() => setShowRecap(false)} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <Shield className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-slate-900">Sistem Paket Santri</h1>
              <p className="text-xs text-slate-500">Pondok Pesantren</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowRecap(true)}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Rekap</span>
            </button>
            <div className="hidden sm:block text-right mr-2">
              <p className="text-sm font-medium text-slate-800">{profile?.full_name}</p>
              <p className="text-xs text-slate-500">Satpam</p>
            </div>
            <button onClick={signOut} className="p-2 hover:bg-red-50 rounded-xl transition-colors group" title="Keluar">
              <LogOut className="w-5 h-5 text-slate-400 group-hover:text-red-500" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => setStatusFilter(statusFilter === 'masuk' ? 'all' : 'masuk')}
            className={`rounded-xl p-4 text-center transition-all border ${
              statusFilter === 'masuk' ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200' : 'bg-white border-slate-200 hover:border-blue-200'
            }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Inbox className={`w-5 h-5 ${statusFilter === 'masuk' ? 'text-blue-600' : 'text-blue-500'}`} />
              <span className={`text-2xl font-bold ${statusFilter === 'masuk' ? 'text-blue-700' : 'text-slate-900'}`}>{masuk}</span>
            </div>
            <p className={`text-xs font-medium ${statusFilter === 'masuk' ? 'text-blue-600' : 'text-slate-500'}`}>Masuk</p>
          </button>
          <button onClick={() => setStatusFilter(statusFilter === 'diambil' ? 'all' : 'diambil')}
            className={`rounded-xl p-4 text-center transition-all border ${
              statusFilter === 'diambil' ? 'bg-amber-50 border-amber-200 ring-2 ring-amber-200' : 'bg-white border-slate-200 hover:border-amber-200'
            }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <ArrowRightCircle className={`w-5 h-5 ${statusFilter === 'diambil' ? 'text-amber-600' : 'text-amber-500'}`} />
              <span className={`text-2xl font-bold ${statusFilter === 'diambil' ? 'text-amber-700' : 'text-slate-900'}`}>{diambil}</span>
            </div>
            <p className={`text-xs font-medium ${statusFilter === 'diambil' ? 'text-amber-600' : 'text-slate-500'}`}>Diambil</p>
          </button>
          <button onClick={() => setStatusFilter(statusFilter === 'done' ? 'all' : 'done')}
            className={`rounded-xl p-4 text-center transition-all border ${
              statusFilter === 'done' ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-200' : 'bg-white border-slate-200 hover:border-emerald-200'
            }`}>
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle2 className={`w-5 h-5 ${statusFilter === 'done' ? 'text-emerald-600' : 'text-emerald-500'}`} />
              <span className={`text-2xl font-bold ${statusFilter === 'done' ? 'text-emerald-700' : 'text-slate-900'}`}>{done}</span>
            </div>
            <p className={`text-xs font-medium ${statusFilter === 'done' ? 'text-emerald-600' : 'text-slate-500'}`}>Done</p>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama, pengirim, isi..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {statusFilter !== 'all' && (
            <button onClick={() => setStatusFilter('all')}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm hover:bg-slate-200 transition-colors">
              <Filter className="w-4 h-4" /> Reset
            </button>
          )}
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30">
            <PackagePlus className="w-4 h-4" />
            <span className="hidden sm:inline">Paket Baru</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Memuat data paket...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PkgIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">{packages.length === 0 ? 'Belum ada paket tercatat' : 'Tidak ada paket yang cocok'}</p>
            <p className="text-slate-400 text-sm mt-1">
              {packages.length === 0 ? 'Klik "Paket Baru" untuk mulai mencatat' : 'Coba ubah filter atau pencarian'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(pkg => (
              <PackageCard key={pkg.id} pkg={pkg} onPickup={setPickupPkg} />
            ))}
          </div>
        )}
      </main>

      {showForm && <PackageForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); fetchPackages(); }} />}
      {pickupPkg && <PickupModal pkg={pickupPkg} onClose={() => setPickupPkg(null)} onSaved={() => { setPickupPkg(null); fetchPackages(); }} />}
    </div>
  );
}
