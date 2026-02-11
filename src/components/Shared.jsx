import React from 'react';

export function RecordTypeBadge({ type }) {
    const styles = {
        pesticide: "bg-red-100 text-red-700 border-red-200",
        fertilizer: "bg-emerald-100 text-emerald-700 border-emerald-200",
        work: "bg-slate-100 text-slate-700 border-slate-200",
        harvest: "bg-orange-100 text-orange-700 border-orange-200",
        official: "bg-blue-100 text-blue-700 border-blue-200",
        tweet: "bg-green-100 text-green-700 border-green-200",
        accounting: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
    const labels = {
        pesticide: "農薬",
        fertilizer: "肥料",
        work: "作業",
        harvest: "収穫",
        official: "公式",
        tweet: "つぶやき",
        accounting: "経理"
    };
    return <span className={`text-xs px-2 py-1 rounded-md border font-bold ${styles[type] || styles.work}`}>{labels[type] || type}</span>;
}

export function NavItem({ icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center w-full h-full space-y-1 pb-2 transition-colors ${active ? 'text-green-600' : 'text-slate-400'}`}>
            {icon}
            <span className="text-[10px] font-bold">{label}</span>
        </button>
    );
}

export function MenuButton({ icon, label, color, position, onClick }) {
    return (
        <div className={`absolute ${position} flex flex-col items-center justify-center cursor-pointer group transtion-transform active:scale-95`} onClick={onClick}>
            <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center text-white shadow-xl shadow-black/20 transform transition-transform group-hover:scale-110 border-4 border-white ring-2 ring-slate-100 mb-2`}>{icon}</div>
            <span className="text-sm font-bold text-slate-700 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-sm">{label}</span>
        </div>
    );
}
