import React, { useState } from 'react';
import { X, Camera, ClipboardList, Beaker } from 'lucide-react';
import { MenuButton } from './Shared';

export function RecordMenuOverlay({ onClose, onSelect }) {
    const [mode, setMode] = useState('initial');

    if (mode === 'initial') {
        return (
            <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-200 px-6">
                <button onClick={onClose} className="absolute top-8 right-8 text-white p-2 hover:bg-white/10 rounded-full"><X size={32} /></button>
                <h2 className="text-2xl font-bold text-white mb-10 drop-shadow-md">何を作成しますか？</h2>
                <div className="grid gap-6 w-full max-w-sm">
                    <button onClick={() => onSelect('tweet')} className="group flex flex-col items-center justify-center bg-white hover:bg-green-50 p-8 rounded-3xl shadow-xl transition-all transform hover:scale-[1.02] border-4 border-transparent hover:border-green-500">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 border border-green-200 group-hover:bg-green-500 group-hover:text-white transition-colors">
                            <Camera size={36} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">つぶやき (写真)</h3>
                        <p className="text-sm font-medium text-slate-400 mt-2 text-center">現場の写真を気軽にシェア。</p>
                    </button>

                    <button onClick={() => setMode('detail')} className="group flex flex-col items-center justify-center bg-white hover:bg-blue-50 p-8 rounded-3xl shadow-xl transition-all transform hover:scale-[1.02] border-4 border-transparent hover:border-blue-500">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600 border border-blue-200 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                            <ClipboardList size={36} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">営農記録 (通常)</h3>
                        <p className="text-sm font-medium text-slate-400 mt-2 text-center">詳細な作業内容を記録します。</p>
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-full max-w-xs aspect-square">
                <button onClick={onClose} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-400 shadow-xl z-10 hover:text-slate-600 transition-colors"><X size={32} /></button>
                {/* Menu Buttons positioned around center */}
                {/* Using lighter colors for menu buttons to fit light theme but keeping them distinct */}
                <MenuButton icon={<Beaker size={28} />} label="農薬記録" color="bg-red-500" position="top-0 left-1/2 -translate-x-1/2 -translate-y-full" onClick={() => onSelect('pesticide')} />
                <MenuButton icon={<React.Fragment>🌱</React.Fragment>} label="肥料記録" color="bg-emerald-500" position="top-1/4 right-0 translate-x-1/4 -translate-y-1/2" onClick={() => onSelect('fertilizer')} />
                <MenuButton icon={<React.Fragment>🌾</React.Fragment>} label="収穫記録" color="bg-orange-500" position="bottom-1/4 right-0 translate-x-1/4 translate-y-1/2" onClick={() => onSelect('harvest')} />
                <MenuButton icon={<React.Fragment>📦</React.Fragment>} label="出荷記録" color="bg-blue-500" position="bottom-0 left-1/2 -translate-x-1/2 translate-y-full" onClick={() => onSelect('shipment')} />
                <MenuButton icon={<React.Fragment>🚜</React.Fragment>} label="作業記録" color="bg-slate-600" position="bottom-1/4 left-0 -translate-x-1/4 translate-y-1/2" onClick={() => onSelect('work')} />
                <MenuButton icon={<React.Fragment>💰</React.Fragment>} label="経理記録" color="bg-yellow-500" position="top-1/4 left-0 -translate-x-1/4 -translate-y-1/2" onClick={() => onSelect('accounting')} />

                <button onClick={() => setMode('initial')} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm font-bold underline hover:text-white">戻る</button>
            </div>
        </div>
    );
}
