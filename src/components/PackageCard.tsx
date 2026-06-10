import { Package } from '../lib/types';
import { Package as PackageIcon, User, Send, Clock, CheckCircle2, ArrowRightCircle, Inbox } from 'lucide-react';

interface Props {
  pkg: Package;
  onPickup: (pkg: Package) => void;
}

export default function PackageCard({ pkg, onPickup }: Props) {
  const statusConfig = {
    masuk: { label: 'Masuk', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Inbox, dot: 'bg-blue-500' },
    diambil: { label: 'Diambil', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: ArrowRightCircle, dot: 'bg-amber-500' },
    done: { label: 'Done', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2, dot: 'bg-emerald-500' },
  };

  const status = statusConfig[pkg.status];
  const StatusIcon = status.icon;

  return (
    <div className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md group ${
      pkg.status === 'done' ? 'border-slate-200 opacity-70' : 'border-slate-200 hover:border-emerald-300'
    }`}>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              pkg.status === 'masuk' ? 'bg-blue-50' : pkg.status === 'diambil' ? 'bg-amber-50' : 'bg-emerald-50'
            }`}>
              <PackageIcon className={`w-5 h-5 ${
                pkg.status === 'masuk' ? 'text-blue-600' : pkg.status === 'diambil' ? 'text-amber-600' : 'text-emerald-600'
              }`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 truncate">{pkg.recipient_name}</h3>
              {pkg.recipient_room && <p className="text-xs text-slate-500">{pkg.recipient_room}</p>}
            </div>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border shrink-0 ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-2 text-slate-600">
            <Send className="w-3.5 h-3.5 text-slate-400" />
            <span>Dari: <span className="font-medium text-slate-800">{pkg.sender_name}</span></span>
            {pkg.sender_relation && <span className="text-slate-400">({pkg.sender_relation})</span>}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(pkg.received_at).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-slate-700"><span className="text-slate-500">Isi:</span> {pkg.contents}</p>
          {pkg.notes && <p className="text-xs text-slate-500 mt-1">Catatan: {pkg.notes}</p>}
        </div>

        {pkg.picked_up_by && (
          <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
            <User className="w-3.5 h-3.5 text-emerald-500" />
            <span>Diambil: <span className="font-medium text-slate-800">{pkg.picked_up_by}</span></span>
            {pkg.picker_relation && <span className="text-slate-400">({pkg.picker_relation})</span>}
            {pkg.picked_up_at && (
              <span className="text-slate-400 ml-auto text-xs">
                {new Date(pkg.picked_up_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        )}

        {pkg.status !== 'done' && (
          <button onClick={() => onPickup(pkg)}
            className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
              pkg.status === 'masuk'
                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}>
            {pkg.status === 'masuk' ? 'Catat Pengambilan' : 'Tandai Selesai'}
          </button>
        )}
      </div>
    </div>
  );
}
