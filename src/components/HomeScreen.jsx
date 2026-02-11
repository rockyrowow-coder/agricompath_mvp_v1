import React, { useState } from 'react';
import { Trophy, AlertCircle, MessageCircle, ArrowRight, UserCheck, Plus } from 'lucide-react';
import { MOCK_THREADS } from '../data/constants';

export function HomeScreen({ points }) {
    const [tab, setTab] = useState('summary');

    return (
        <div className="space-y-4 bg-slate-50 min-h-full pb-24">
            {/* Top Tab Switcher */}
            <div className="bg-white border-b border-slate-200 px-4 pt-2 shadow-sm sticky top-0 z-10">
                <div className="flex space-x-6">
                    <button onClick={() => setTab('summary')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'summary' ? 'text-green-600 border-green-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>サマリー</button>
                    <button onClick={() => setTab('group')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'group' ? 'text-green-600 border-green-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>東部会</button>
                    <button onClick={() => setTab('official')} className={`pb-3 text-sm font-bold border-b-2 transition-colors ${tab === 'official' ? 'text-green-600 border-green-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>指導員連携</button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {tab === 'summary' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Gamification Status */}
                        <div className="bg-gradient-to-r from-indigo-50 to-white border border-indigo-100 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">現在の貢献ランク</p>
                                <div className="flex items-end space-x-2">
                                    <span className="text-3xl font-extrabold text-slate-800">ゴールド</span>
                                    <span className="text-sm font-bold text-indigo-600 pb-1.5">({points}pt)</span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-400 mt-1">次のランクまであと250pt</p>
                            </div>
                            <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 border border-yellow-200 shadow-sm">
                                <Trophy size={28} />
                            </div>
                        </div>

                        {/* Alert Banner */}
                        <div className="bg-red-50 border-l-4 border-l-red-500 border-t border-r border-b border-red-100 rounded-xl p-4 flex items-start space-x-3 shadow-sm">
                            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h3 className="text-sm font-bold text-red-800">【警報】ハスモンヨトウ発生</h3>
                                <p className="text-xs font-medium text-red-600/80 mt-1 leading-relaxed">JA管内で被害が拡大しています。<br />早期の防除をお願いします。</p>
                            </div>
                        </div>

                        {/* Schedule / Comparison */}
                        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-slate-700 flex items-center"><span className="w-1 h-4 bg-green-500 rounded mr-2"></span>栽培タスク予実 (水稲)</h3>
                            <div className="relative pl-6 border-l-2 border-slate-100 ml-1 py-1">
                                <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-lg">中干し開始</h4>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">昨年: 6月10日</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200 mb-1 inline-block">今年の予定</span>
                                        <span className="block text-xl font-bold text-slate-800">6月12日</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'group' && (
                    <div className="space-y-4 animate-in fade-in">
                        {MOCK_THREADS.map(thread => (
                            <div key={thread.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm transition-all hover:shadow-md active:scale-[0.99]">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">{thread.author}</span>
                                    <span className="text-xs font-medium text-slate-400">{thread.date}</span>
                                </div>
                                <h3 className="text-base font-bold text-slate-800 mb-2">{thread.title}</h3>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">{thread.content}</p>
                                <div className="flex items-center space-x-4 border-t border-slate-100 pt-3">
                                    <button className="flex items-center space-x-1 text-slate-500 text-xs font-bold hover:text-green-600 transition-colors">
                                        <MessageCircle size={16} /> <span>{thread.replies}件の返信</span>
                                    </button>
                                    <button className="flex items-center space-x-1 text-slate-500 text-xs font-bold hover:text-green-600 transition-colors ml-auto">
                                        <span>スレッドを見る</span> <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button className="w-full py-4 bg-white hover:bg-slate-50 border-2 border-slate-200 border-dashed rounded-2xl text-slate-500 text-sm font-bold flex items-center justify-center transition-colors">
                            <Plus size={18} className="mr-2" /> 新しい話題を作成
                        </button>
                    </div>
                )}

                {tab === 'official' && (
                    <div className="space-y-6 animate-in fade-in">
                        {/* Reminders - Larger UI */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                            <h3 className="text-base font-bold text-slate-700 mb-5 flex items-center"><span className="w-1.5 h-5 bg-blue-500 rounded-full mr-3"></span>提出物リマインド</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100 shadow-sm">
                                    <div>
                                        <p className="text-base font-bold text-slate-800">6月分防除日誌</p>
                                        <p className="text-sm font-bold text-red-500 mt-1">期限: <span className="underline decoration-2 underline-offset-2">明日まで</span></p>
                                    </div>
                                    <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-red-200 transition-transform active:scale-95">提出する</button>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-200 shadow-sm opacity-60">
                                    <div>
                                        <p className="text-base font-bold text-slate-800">カメムシ防除計画書</p>
                                        <p className="text-sm font-bold text-yellow-600 mt-1">期限: 7月10日</p>
                                    </div>
                                    <button className="bg-slate-100 text-slate-500 px-6 py-3 rounded-xl text-sm font-bold pointer-events-none">作成中</button>
                                </div>
                            </div>
                        </div>

                        {/* Threaded Official Contact */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-5">
                                <h3 className="text-base font-bold text-slate-700 flex items-center"><span className="w-1.5 h-5 bg-indigo-500 rounded-full mr-3"></span>指導員連携スレッド</h3>
                                <button className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                                    + 新規相談
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Thread Item 1 */}
                                <div className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative group">
                                    <div className="absolute right-5 top-5 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse shadow-sm">未読 1件</div>
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded">栽培相談</span>
                                            <span className="text-xs text-slate-400 font-bold">最終更新: 10分前</span>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">本田1号の葉色診断について</h4>
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-3">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <UserCheck size={16} className="text-blue-500" />
                                            <span className="text-xs font-bold text-slate-600">鈴木指導員</span>
                                        </div>
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium line-clamp-2">
                                            先日の診断結果ですが、少し窒素過多の傾向があります。穂肥の量を調整してください。返信をお待ちしています。
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between text-indigo-600 text-sm font-bold">
                                        <span className="flex items-center text-slate-400 text-xs"><MessageCircle size={14} className="mr-1" /> 4件のやり取り</span>
                                        <span className="group-hover:translate-x-1 transition-transform">スレッドを開く &gt;</span>
                                    </div>
                                </div>

                                {/* Thread Item 2 */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer opacity-80 hover:opacity-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded">事務連絡</span>
                                            <span className="text-xs text-slate-400 font-bold">最終更新: 3日前</span>
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-indigo-600 transition-colors">次回の部会集会の日程変更</h4>
                                    <p className="text-sm text-slate-500 line-clamp-1 mb-3 font-medium">
                                        了解しました。7/15に参加させていただきます。
                                    </p>
                                    <div className="flex items-center justify-between text-indigo-600 text-sm font-bold border-t border-slate-100 pt-3">
                                        <span className="flex items-center text-slate-400 text-xs"><MessageCircle size={14} className="mr-1" /> 2件のやり取り</span>
                                        <span className="text-slate-400">完了済み</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
