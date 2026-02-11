import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

export function ReviewScreen({ requests, onAnswer }) {
    const [activeRequest, setActiveRequest] = useState(null);

    return (
        <div className="p-4 h-full pb-32 bg-slate-50 min-h-screen">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-2">あなたへの評価依頼 (レビュー)</h2>
                <p className="text-xs text-slate-500 leading-relaxed">回答するとポイントが貯まり、閲覧制限の緩和や特典が得られます。</p>
            </div>

            <div className="space-y-4">
                {requests.map(req => (
                    <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-indigo-500"></div>
                        <div className="pl-2">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded border border-indigo-100">{req.requester}より</span>
                                <span className="text-xs font-medium text-slate-400">{req.date}の記録</span>
                            </div>
                            <h3 className="text-base font-bold text-slate-800 mb-1">{req.pesticide} <span className="text-slate-500 font-medium text-sm">({req.crop})</span></h3>
                            <div className="bg-slate-50 rounded-xl p-4 mt-3 mb-4 border border-slate-100">
                                <p className="text-sm text-slate-700 font-bold flex items-start leading-relaxed"><HelpCircle size={18} className="text-indigo-500 mr-2 shrink-0 mt-0.5" />{req.question}</p>
                            </div>
                            {activeRequest === req.id ? (
                                <div className="animate-in fade-in slide-in-from-top-2 space-y-3">
                                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-medium" placeholder="ここに回答を入力..." rows={3}></textarea>
                                    <div className="flex space-x-3">
                                        <button onClick={() => { setActiveRequest(null); onAnswer(req.points); }} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-md active:scale-95 transition-transform">回答送信 (+{req.points}pt)</button>
                                        <button onClick={() => setActiveRequest(null)} className="py-3 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-xl shadow-sm">キャンセル</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setActiveRequest(req.id)} className="w-full py-3 border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50 text-indigo-600 text-sm font-bold rounded-xl transition-colors flex items-center justify-center">回答する (+{req.points}pt)</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
