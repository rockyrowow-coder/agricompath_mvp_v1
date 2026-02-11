import React, { useState } from 'react';
import { MessageCircle, User, FileText, ExternalLink, Bot, ChevronRight, Bell } from 'lucide-react';

export function ContactScreen() {
    const [activeTab, setActiveTab] = useState('group'); // 'group', 'individual', 'survey'

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header / Tabs */}
            <div className="bg-white px-4 pt-4 pb-2 border-b border-slate-200 sticky top-0 z-10">
                <h2 className="text-xl font-extrabold text-slate-800 mb-4">連絡・連携</h2>
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
                    <TabButton label="部会連携" active={activeTab === 'group'} onClick={() => setActiveTab('group')} icon={<MessageCircle size={16} />} />
                    <TabButton label="個別連絡" active={activeTab === 'individual'} onClick={() => setActiveTab('individual')} icon={<User size={16} />} />
                    <TabButton label="資材調査" active={activeTab === 'survey'} onClick={() => setActiveTab('survey')} icon={<FileText size={16} />} />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* AI Summary Widget (Always visible or contextual) */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10 text-indigo-500">
                        <Bot size={64} />
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                        <Bot size={18} className="text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">AI要約 (直近3日間)</span>
                    </div>
                    <ul className="space-y-2 text-sm font-bold text-slate-700 relative z-10">
                        <li className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></span>
                            <span>台風接近に伴い、明日の午前中までに排水対策を完了してください。(部会)</span>
                        </li>
                        <li className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></span>
                            <span>次回の集荷日は10月15日(金)に変更になりました。(部会)</span>
                        </li>
                    </ul>
                </div>

                {/* Content based on Tab */}
                {activeTab === 'group' && <GroupMessages />}
                {activeTab === 'individual' && <IndividualMessages />}
                {activeTab === 'survey' && <SurveySection />}
            </div>
        </div>
    );
}

function TabButton({ label, active, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${active ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function GroupMessages() {
    const groups = [
        { id: 1, name: "守山メロン部会 (全体)", lastMsg: "【重要】次回の出荷規準について資料を更新しました。", time: "10:30", important: true },
        { id: 2, name: "第3ブロック連絡網", lastMsg: "明日の現地検討会は予定通り行います。", time: "昨日", important: false },
    ];

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-xs font-bold text-slate-400 ml-1">参加中のグループ</h3>
            {groups.map(g => (
                <div key={g.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                {g.name[0]}
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{g.name}</h4>
                                <p className="text-[10px] text-slate-400">JAレーク滋賀</p>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{g.time}</span>
                    </div>

                    <div className={`p-3 rounded-xl text-sm font-bold ${g.important ? 'bg-red-50 text-red-800 border border-red-100' : 'bg-slate-50 text-slate-600'}`}>
                        {g.important && <span className="inline-block bg-red-500 text-white text-[10px] px-1.5 rounded mr-2 mb-1">重要</span>}
                        {g.lastMsg}
                    </div>

                    <button className="w-full py-2.5 border border-[#06C755] text-[#06C755] font-bold text-xs rounded-xl hover:bg-green-50 flex items-center justify-center space-x-2 transition-transform active:scale-95">
                        <MessageCircle size={16} />
                        <span>LINEグループを開く</span>
                        <ExternalLink size={12} />
                    </button>
                </div>
            ))}
        </div>
    );
}

function IndividualMessages() {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-400 ml-1">指導員・担当者との連絡</h3>
                <button className="text-xs font-bold text-blue-600">全て既読にする</button>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="flex justify-between">
                            <span className="text-sm font-bold text-slate-800">鈴木 指導員 (西部センター)</span>
                            <span className="text-[10px] text-slate-400">今日 09:15</span>
                        </div>
                        <div className="bg-blue-50 p-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl text-sm font-bold text-slate-700">
                            田村さん、先日の土壌診断の結果が出ましたので、添付しておきます。次回の肥料設計の参考にしてください。
                        </div>
                        <div className="flex justify-end space-x-2 mt-2">
                            <button className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">返信不要</button>
                            <button className="text-xs font-bold text-white bg-blue-600 px-3 py-1.5 rounded-full flex items-center space-x-1">
                                <span>LINEで返信する</span>
                                <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SurveySection() {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <h3 className="text-xs font-bold text-slate-400 ml-1">回答が必要な調査</h3>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-orange-500"></div>
                <div className="flex justify-between items-start mb-2">
                    <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded">未回答</span>
                    <span className="text-[10px] font-bold text-slate-400">締切: 10/20</span>
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-1">来年度の作付面積調査</h4>
                <p className="text-xs text-slate-500 mb-4">次年度の種子確保のため、作付予定面積をお知らせください。</p>
                <button className="w-full bg-slate-800 text-white font-bold py-3 rounded-xl text-sm shadow-md active:scale-95 transition-transform">
                    回答画面へ進む
                </button>
            </div>

            <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 flex items-center justify-between opacity-70">
                <div>
                    <h4 className="text-sm font-bold text-slate-600">肥料予約注文書</h4>
                    <span className="text-[10px] font-bold text-slate-400">回答済み (9/15)</span>
                </div>
                <CheckCircle2 size={20} className="text-slate-400" />
            </div>
        </div>
    );
}

import { CheckCircle2 } from 'lucide-react';
