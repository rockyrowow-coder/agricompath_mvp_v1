import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Megaphone, LogOut, Bell, CheckCircle2, AlertTriangle, Send } from 'lucide-react';
import { MOCK_ADMIN_STATS, MOCK_MEMBERS, MOCK_GROUPS } from '../data/constants';

export default function AdminApp() {
    const { signOut } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, members, broadcast

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
            {/* Admin Header */}
            <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 z-10 shadow-sm shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg">
                        <LayoutDashboard size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-800">JA 守山 管理画面</h1>
                        <p className="text-xs text-slate-500 font-bold">西部指導センター</p>
                    </div>
                </div>
                <button onClick={signOut} className="flex items-center space-x-2 text-slate-500 hover:text-red-500 transition-colors font-bold text-sm">
                    <LogOut size={18} />
                    <span>ログアウト</span>
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Nav (Desktop/Tablet friendly) */}
                <nav className="w-64 bg-white border-r border-slate-200 p-4 space-y-2 hidden md:block">
                    <NavButton icon={<LayoutDashboard size={20} />} label="ダッシュボード" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavButton icon={<Users size={20} />} label="部会員管理" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
                    <NavButton icon={<Megaphone size={20} />} label="一斉送信" active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} />
                </nav>

                {/* Mobile Nav (Bottom) */}
                <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-3 z-30">
                    <MobileNavButton icon={<LayoutDashboard size={24} />} label="ダッシュボード" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <MobileNavButton icon={<Users size={24} />} label="部会員" active={activeTab === 'members'} onClick={() => setActiveTab('members')} />
                    <MobileNavButton icon={<Megaphone size={24} />} label="送信" active={activeTab === 'broadcast'} onClick={() => setActiveTab('broadcast')} />
                </div>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
                    {activeTab === 'dashboard' && <AdminDashboard />}
                    {activeTab === 'members' && <MemberManagement />}
                    {activeTab === 'broadcast' && <BroadcastTool />}
                </main>
            </div>
        </div>
    );
}

import { supabase } from '../lib/supabase';

function AdminDashboard() {
    const [stats, setStats] = useState(MOCK_ADMIN_STATS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRealStats = async () => {
            try {
                // Fetch count of records from today
                const today = new Date().toISOString().split('T')[0];
                const { count, error } = await supabase
                    .from('records')
                    .select('*', { count: 'exact', head: true })
                    .gte('date', today);

                if (error) throw error;

                // Calculate specific pest control rate (mock logic for demo using real count)
                // In a real app, this would be complex logic based on total farmers vs submitted records
                setStats(prev => ({
                    ...prev,
                    pestControlRate: Math.min(100, (count || 0) * 10) // Mocking rate calculation
                }));
            } catch (e) {
                console.error("Error fetching admin stats:", e);
            } finally {
                setLoading(false);
            }
        };

        fetchRealStats();

        // Real-time subscription
        const subscription = supabase
            .channel('admin-dashboard')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'records' }, payload => {
                fetchRealStats();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">地域の状況 (Real-time Configured)</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alert Status Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className={`absolute top-0 right-0 p-4 opacity-10 ${stats.alertLevel === 'active' ? 'text-red-500' : 'text-green-500'}`}>
                        <AlertTriangle size={100} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-500 mb-2">現在の防除警報</h3>
                    <div className="flex items-center space-x-4">
                        <div className={`p-4 rounded-full ${stats.alertLevel === 'active' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <p className="text-3xl font-extrabold text-slate-800">{stats.alertTarget}</p>
                            <p className={`text-sm font-bold ${stats.alertLevel === 'active' ? 'text-red-500' : 'text-green-500'}`}>
                                {stats.alertRegion}で警報発令中
                            </p>
                        </div>
                    </div>
                </div>

                {/* Prevention Rate Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-500 mb-2">守山エリアの防除実施率</h3>
                    <div className="flex items-end space-x-2">
                        <span className="text-5xl font-extrabold text-slate-800">{loading ? '-' : stats.pestControlRate}</span>
                        <span className="text-xl font-bold text-slate-400 mb-2">%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full mt-4 overflow-hidden">
                        <div className="bg-blue-500 h-full rounded-full transition-all duration-1000" style={{ width: `${stats.pestControlRate}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2 text-right">目標: 85%</p>
                </div>
            </div>

            {/* Quick Actions (Mock) */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-blue-800 mb-2">指導員メモ</h3>
                <p className="text-sm text-blue-700">明日は東部エリアの巡回予定日です。鈴木さんの圃場の確認を行ってください。</p>
            </div>
        </div>
    );
}

function MemberManagement() {
    const [members, setMembers] = useState(MOCK_MEMBERS);

    const handleRemind = (id) => {
        alert("LINEで催促通知を送信しました");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center px-1">
                <h2 className="text-2xl font-bold text-slate-800">部会員リスト</h2>
                <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{members.length}名</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="p-4 text-xs font-bold text-slate-500">氏名</th>
                            <th className="p-4 text-xs font-bold text-slate-500">地域</th>
                            <th className="p-4 text-xs font-bold text-slate-500">最終提出</th>
                            <th className="p-4 text-xs font-bold text-slate-500">状態</th>
                            <th className="p-4 text-xs font-bold text-slate-500 text-right">アクション</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {members.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-bold text-slate-800">{m.name}</td>
                                <td className="p-4 text-sm text-slate-600">{m.region}</td>
                                <td className="p-4 text-sm text-slate-600">{m.lastSubmission}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${m.status === 'ok' ? 'bg-green-100 text-green-700' :
                                        m.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>
                                        {m.status === 'ok' ? '提出済' : m.status === 'warning' ? '未提出(3日)' : '未提出(7日+)'}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    {m.status !== 'ok' && (
                                        <button onClick={() => handleRemind(m.id)} className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow transition-transform active:scale-95">
                                            催促 (LINE)
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BroadcastTool() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [target, setTarget] = useState('all');
    const [sendLine, setSendLine] = useState(true);

    const handleSend = () => {
        if (!title || !body) return alert("タイトルと本文を入力してください");
        alert(`送信完了！\n対象: ${target}\nLINE通知: ${sendLine ? 'あり' : 'なし'}`);
        setTitle('');
        setBody('');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-2xl font-bold text-slate-800">一斉送信・連絡作成</h2>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">タイトル</label>
                    <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="例: 台風接近に伴う対策について"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">本文</label>
                    <textarea
                        value={body}
                        onChange={e => setBody(e.target.value)}
                        placeholder="詳細な連絡事項を入力..."
                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">送信先グループ</label>
                        <select
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-800"
                        >
                            <option value="all">全生産者</option>
                            <option value="east">東部エリア</option>
                            <option value="west">西部エリア</option>
                            <option value="melon">メロン部会</option>
                            <option value="rice">水稲部会</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-3 bg-green-50 p-3 rounded-xl border border-green-100">
                        <input
                            type="checkbox"
                            id="line-check"
                            checked={sendLine}
                            onChange={e => setSendLine(e.target.checked)}
                            className="w-5 h-5 text-green-600 rounded focus:ring-green-500 cursor-pointer"
                        />
                        <label htmlFor="line-check" className="font-bold text-green-800 cursor-pointer select-none">
                            LINEにも通知を送る
                        </label>
                    </div>
                </div>

                <button onClick={handleSend} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 transition-transform active:scale-95">
                    <Send size={20} />
                    <span>メッセージを送信</span>
                </button>
            </div>
        </div>
    );
}

function NavButton({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}

function MobileNavButton({ icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center space-y-1 ${active ? 'text-blue-600' : 'text-slate-400'}`}>
            {icon}
            <span className="text-[10px] font-bold">{label}</span>
        </button>
    );
}
