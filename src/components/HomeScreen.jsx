import React, { useState } from 'react';
import { Trophy, AlertCircle, MessageCircle, ArrowRight, UserCheck, Plus, History, Calendar, ChevronRight } from 'lucide-react';
import { MOCK_THREADS } from '../data/constants';

export function HomeScreen({ points, onNavigate, lastYearRecord }) {
    const [tab, setTab] = useState('summary');

    return (
        <div className="h-full flex flex-col bg-slate-50 overflow-hidden">
            {/* Top Status Bar (Compact) */}
            <div className="bg-white px-4 py-3 border-b border-slate-200 shadow-sm flex justify-between items-center shrink-0 z-10">
                <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 border border-yellow-200">
                        <Trophy size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 leading-none">ランク</p>
                        <p className="text-sm font-extrabold text-slate-800 leading-none">ゴールド <span className="text-xs text-indigo-600">({points}pt)</span></p>
                    </div>
                </div>
                <div className="flex space-x-1">
                    <button onClick={() => setTab('summary')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${tab === 'summary' ? 'bg-green-100 text-green-700' : 'text-slate-400 hover:bg-slate-100'}`}>ダッシュボード</button>
                    <button onClick={() => setTab('notifications')} className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${tab === 'notifications' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:bg-slate-100'}`}>お知らせ</button>
                </div>
            </div>

            {/* Main Content Area (No Scroll / Minimal Scroll) */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {tab === 'summary' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                        {/* 1. Alert Banner (If critical) */}
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start space-x-3 shadow-sm">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h3 className="text-sm font-bold text-red-800">【警報】アザミウマ発生注意</h3>
                                <p className="text-xs font-bold text-red-600/80 mt-0.5">守山管内で増加中。早期防除を。</p>
                            </div>
                        </div>

                        {/* 2. "1 Year Ago" Widget (Hero) */}
                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <History size={64} />
                            </div>
                            <h3 className="text-xs font-bold text-slate-400 flex items-center mb-2">
                                <Calendar size={12} className="mr-1" /> 昨年の今頃 (2025/6/11)
                            </h3>
                            {lastYearRecord ? (
                                <div className="relative z-10">
                                    <div className="flex items-baseline space-x-2 mb-1">
                                        <span className="text-lg font-extrabold text-slate-800">{lastYearRecord.detail}</span>
                                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{lastYearRecord.crop}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-600 mb-2">"{lastYearRecord.memo || 'コメントなし'}"</p>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                            {lastYearRecord.pesticide || "作業記録"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-slate-400 text-xs font-bold">
                                    昨年の記録はありません
                                </div>
                            )}
                            <div className="mt-3 border-t border-slate-100 pt-2 flex justify-between items-center cursor-pointer hover:bg-slate-50 rounded-lg -mx-2 px-2 transition-colors" onClick={() => onNavigate('my_cultivation')}>
                                <span className="text-xs font-bold text-indigo-600">過去の記録をすべて見る</span>
                                <ChevronRight size={14} className="text-indigo-400" />
                            </div>
                        </div>

                        {/* 3. Big Navigation Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => onNavigate('record')} className="bg-green-600 hover:bg-green-500 text-white rounded-2xl p-4 shadow-md shadow-green-100 flex flex-col items-center justify-center space-y-1 transition-transform active:scale-95 h-28">
                                <Plus size={32} />
                                <span className="text-lg font-extrabold">記録する</span>
                                <span className="text-[10px] font-medium opacity-80">日報・防除・施肥</span>
                            </button>
                            <div className="space-y-3 flex flex-col">
                                <button onClick={() => onNavigate('timeline')} className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center justify-between shadow-sm transition-colors">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-blue-50 p-1.5 rounded-lg text-blue-600"><MessageCircle size={18} /></div>
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-slate-700">みんなの記録</span>
                                            <span className="block text-[10px] text-slate-400">地域の動きを見る</span>
                                        </div>
                                    </div>
                                </button>
                                <button onClick={() => onNavigate('my_cultivation')} className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl px-4 flex items-center justify-between shadow-sm transition-colors">
                                    <div className="flex items-center space-x-2">
                                        <div className="bg-orange-50 p-1.5 rounded-lg text-orange-600"><History size={18} /></div>
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-slate-700">MY栽培</span>
                                            <span className="block text-[10px] text-slate-400">自分の履歴・分析</span>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'notifications' && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-right-2">
                        {MOCK_THREADS.map(thread => (
                            <div key={thread.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{thread.author}</span>
                                    <span className="text-[10px] font-medium text-slate-400">{thread.date}</span>
                                </div>
                                <h3 className="text-sm font-bold text-slate-800 mb-1">{thread.title}</h3>
                                <p className="text-xs text-slate-600 line-clamp-2 mb-2 leading-relaxed">{thread.content}</p>
                                <button className="text-indigo-600 text-xs font-bold flex items-center">
                                    詳細を見る <ChevronRight size={12} />
                                </button>
                            </div>
                        ))}
                        {/* Official Reminders */}
                        <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                            <h4 className="text-xs font-bold text-blue-800 mb-2 flex items-center"><AlertCircle size={12} className="mr-1" /> 提出リマインド</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100">
                                    <span className="text-xs font-bold text-slate-700">防除日誌 (5月分)</span>
                                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">明日まで</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
