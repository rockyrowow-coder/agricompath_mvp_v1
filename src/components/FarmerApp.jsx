import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, MessageCircle, Bell, Settings, Camera, Home, ClipboardList, Star, CheckCircle2, LogOut, Users } from 'lucide-react';
import { NavItem } from './Shared';
import { HomeScreen } from './HomeScreen';
import { TimelineScreen } from './TimelineScreen';
import { ContactScreen } from './ContactScreen';
import { MyCultivationScreen } from './MyCultivationScreen';
import { CommunityScreen } from './CommunityScreen';
import { CommunityDetailScreen } from './CommunityDetailScreen';
import { RecordMenuOverlay, RecordModal, SettingsModal, CSVExportModal } from './Modals';
import { INITIAL_TIMELINE, INITIAL_MY_RECORDS, INITIAL_INVENTORY } from '../data/constants';

export default function FarmerApp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, signOut } = useAuth(); // Use context logout

    // Modals & Overlays
    const [showRecordMenu, setShowRecordMenu] = useState(false);
    const [modalType, setModalType] = useState(null);

    // Data State - Supabase Integrated
    const [userPoints, setUserPoints] = useState(1250);
    const [lastRecordTime, setLastRecordTime] = useState(null);
    const [timelineData, setTimelineData] = useState(INITIAL_TIMELINE);
    const [myRecords, setMyRecords] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [userSettings, setUserSettings] = useState({
        ja_id: '',
        line_info: '',
        custom_crops: [],
        custom_methods: []
    });
    const [notification, setNotification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joinedCommunities, setJoinedCommunities] = useState([]);

    // Fetch data from Supabase
    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Records
                const { data: recordsData, error: recordsError } = await supabase
                    .from('records')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('date', { ascending: false })
                    .order('created_at', { ascending: false });

                if (recordsError) throw recordsError;

                if (recordsData) {
                    const formattedRecords = recordsData.map(r => ({
                        id: r.id,
                        date: r.date,
                        type: r.type,
                        crop: r.crop,
                        detail: r.detail,
                        amount: r.amount,
                        field: r.field,
                        timeStart: r.time_start,
                        timeEnd: r.time_end,
                        range: r.range,
                        pesticide: r.pesticide,
                        workType: r.work_type,
                        memo: r.memo,
                        status: "done"
                    }));
                    setMyRecords(formattedRecords);

                    if (recordsData.length > 0) {
                        const latestRecord = recordsData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
                        if (latestRecord && latestRecord.created_at) {
                            setLastRecordTime(new Date(latestRecord.created_at).getTime());
                        }
                    }
                }

                // 2. Fetch Inventory
                const { data: inventoryData, error: inventoryError } = await supabase
                    .from('inventory')
                    .select('*')
                    .eq('user_id', user.id);

                if (inventoryError) throw inventoryError;

                if (inventoryData) {
                    setInventory(inventoryData.length > 0 ? inventoryData : INITIAL_INVENTORY);
                }

                // 3. Fetch User Settings
                const { data: settingsData, error: settingsError } = await supabase
                    .from('user_settings')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (settingsData) {
                    setUserSettings({
                        ja_id: settingsData.ja_id || '',
                        line_info: settingsData.line_info || '',
                        custom_crops: settingsData.custom_crops || [],
                        custom_methods: settingsData.custom_methods || []
                    });
                }

                // 4. Fetch Joined Communities & Community Timeline
                const { data: membersData, error: membersError } = await supabase
                    .from('community_members')
                    .select('community_id, communities(id, name)')
                    .eq('user_id', user.id);

                if (membersError) throw membersError;

                let communityTimelineItems = [];

                if (membersData) {
                    const communities = membersData.map(m => m.communities);
                    setJoinedCommunities(communities);
                    const communityIds = membersData.map(m => m.community_id);

                    if (communityIds.length > 0) {
                        // 4a. Fetch Community Posts
                        const { data: postsData } = await supabase
                            .from('community_posts')
                            .select('*, communities(name), users(email)') // simplified user info
                            .in('community_id', communityIds)
                            .order('created_at', { ascending: false })
                            .limit(20);

                        if (postsData) {
                            communityTimelineItems = [...communityTimelineItems, ...postsData.map(p => ({
                                id: `post-${p.id}`,
                                date: new Date(p.created_at).toISOString().split('T')[0],
                                type: 'post',
                                title: p.communities?.name || 'コミュニティ',
                                comment: p.content, // Map content to comment
                                user: p.communities?.name || 'コミュニティ', // Use community name as user/source
                                isFollowed: true, // Show in Following tab
                                author: 'メンバー',
                                community: p.communities?.name,
                                timestamp: new Date(p.created_at)
                            }))];
                        }

                        // 4b. Fetch Shared Records (via record_shares)
                        const { data: sharesData } = await supabase
                            .from('record_shares')
                            .select('records(*), communities(name)')
                            .in('community_id', communityIds)
                            .order('shared_at', { ascending: false })
                            .limit(20);

                        if (sharesData) {
                            const sharedRecords = sharesData
                                .map(s => s.records)
                                .filter(r => r && r.user_id !== user.id)
                                .map(r => ({
                                    id: `shared-${r.id}`,
                                    date: r.date,
                                    type: r.type, // Keep original type (work, pesticide, etc)
                                    title: r.crop,
                                    comment: r.memo || (r.type === 'work' ? r.work_type : r.detail), // Map memo/detail to comment
                                    amount: r.amount,
                                    pesticide: r.pesticide,
                                    user: 'コミュニティメンバー', // Generic name
                                    isFollowed: true, // Show in Following tab
                                    community: 'コミュニティ共有',
                                    timestamp: new Date(r.created_at)
                                }));
                            communityTimelineItems = [...communityTimelineItems, ...sharedRecords];
                        }
                    }
                }

                // Merge with INITIAL_TIMELINE or replace it? 
                // Creating a mixed timeline
                setTimelineData([...INITIAL_TIMELINE, ...communityTimelineItems].sort((a, b) => new Date(b.date) - new Date(a.date)));

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Determine active tab based on path
    const getActiveTab = (pathname) => {
        if (pathname === '/') return 'home';
        if (pathname === '/timeline') return 'timeline';
        if (pathname.startsWith('/community')) return 'community';
        if (pathname === '/contact') return 'contact';
        if (pathname === '/cultivation') return 'my_cultivation';
        return 'home';
    };

    const activeTab = getActiveTab(location.pathname);

    const isUnlocked = () => {
        if (!lastRecordTime) return false;
        const sevenDays = 7 * 24 * 60 * 60 * 1000;
        return (Date.now() - lastRecordTime) < sevenDays;
    };

    const getOneYearAgoRecord = () => {
        const today = new Date();
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);

        if (!myRecords || myRecords.length === 0) return null;

        const closest = myRecords.reduce((prev, curr) => {
            const prevDate = new Date(prev.date);
            const currDate = new Date(curr.date);
            const targetDate = lastYear;
            return (Math.abs(currDate - targetDate) < Math.abs(prevDate - targetDate) ? curr : prev);
        });

        const diffTime = Math.abs(new Date(closest.date) - lastYear);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 60) return closest;
        return null;
    };

    const lastYearRecord = getOneYearAgoRecord();

    const openRecordForm = (type) => {
        setModalType(type);
        setShowRecordMenu(false);
    };

    const handleRecordSubmit = async (submissionData) => {
        const { isPublic, sharedCommunities, ...newRecord } = submissionData;

        const recordPayload = {
            user_id: user?.id,
            date: newRecord.date || new Date().toISOString().split('T')[0],
            type: modalType,
            crop: newRecord.crop || "ー",
            detail: modalType === 'pesticide' || modalType === 'fertilizer' ? newRecord.pesticide :
                modalType === 'tweet' ? 'つぶやき' :
                    modalType === 'accounting' ? newRecord.workType :
                        newRecord.workType || newRecord.memo,
            amount: modalType === 'pesticide' ? `${newRecord.dilution}倍` :
                modalType === 'accounting' ? `¥${newRecord.amount}` :
                    (newRecord.amount || '-'),
            field: newRecord.field || "-",
            time_start: newRecord.timeStart,
            time_end: newRecord.timeEnd,
            range: newRecord.range,
            pesticide: newRecord.pesticide,
            work_type: newRecord.workType,
            memo: newRecord.memo,
            is_public: !!isPublic
        };

        if (!user) {
            alert('ログアウト状態のため、記録を保存できません。再ログインしてください。');
            return;
        }

        // Ensure numeric fields are correctly formatted if needed, though Supabase handles text fine often.
        // For safety, we keep as is but ensure `amount` is not undefined.

        if (user) {
            const { data, error } = await supabase
                .from('records')
                .insert([recordPayload])
                .select();

            if (error) {
                console.error('Error inserting record:', error);
                // Detailed Error for Debugging
                alert(`記録の保存に失敗しました。\nCode: ${error.code}\nMessage: ${error.message}\nDetails: ${error.details}`);
                return;
            }

            if (data && data[0]) {
                const returnedRecord = data[0];
                const myRecordEntry = {
                    id: returnedRecord.id,
                    date: returnedRecord.date,
                    type: returnedRecord.type,
                    crop: returnedRecord.crop,
                    detail: returnedRecord.detail,
                    amount: returnedRecord.amount,
                    field: returnedRecord.field,
                    timeStart: returnedRecord.time_start,
                    timeEnd: returnedRecord.time_end,
                    range: returnedRecord.range,
                    pesticide: returnedRecord.pesticide,
                    workType: returnedRecord.work_type,
                    memo: returnedRecord.memo,
                    status: "done"
                };
                setMyRecords([myRecordEntry, ...myRecords]);
                setLastRecordTime(Date.now());

                // Handle Community Sharing
                if (sharedCommunities && sharedCommunities.length > 0) {
                    const sharePayload = sharedCommunities.map(communityId => ({
                        record_id: returnedRecord.id,
                        community_id: communityId
                    }));

                    const { error: shareError } = await supabase
                        .from('record_shares')
                        .insert(sharePayload);

                    if (shareError) {
                        console.error("Error sharing record:", shareError);
                    }
                }
            }
        }

        if ((modalType === 'pesticide' || modalType === 'fertilizer') && newRecord.pesticide) {
            const targetItem = inventory.find(i => i.name === newRecord.pesticide);
            if (targetItem) {
                const newQuantity = Math.max(0, targetItem.quantity - 1);

                // Update Local State
                setInventory(prev => prev.map(item => {
                    if (item.id === targetItem.id) {
                        return { ...item, quantity: newQuantity };
                    }
                    return item;
                }));

                // Update Supabase
                const { error: invError } = await supabase
                    .from('inventory')
                    .update({ quantity: newQuantity })
                    .eq('id', targetItem.id);

                if (invError) {
                    console.error("Error updating inventory:", invError);
                    // Optionally revert local state or alert, but for MVP logging is ok
                }
            }
        }

        setUserPoints(prev => prev + (modalType !== 'tweet' ? 50 : 10));
        setModalType(null);
        navigate('/timeline');
        setNotification(`記録完了！ +${modalType !== 'tweet' ? 50 : 10}pt`);
        setTimeout(() => setNotification(null), 4000);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden border-x border-slate-200 shadow-2xl relative">
            {/* Header */}
            <header className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 z-10 shadow-sm shrink-0">
                <div className="flex items-center space-x-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                        <Sprout size={20} className="text-white" />
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-slate-800">Agri Compath</h1>
                </div>
                <div className="flex items-center space-x-3.5">
                    <button className="bg-[#06C755] hover:bg-[#05b34c] text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center space-x-1 shadow-md shadow-green-100 transition-colors">
                        <MessageCircle size={14} fill="white" className="text-white" />
                        <span>LINE</span>
                    </button>
                    <div className="relative cursor-pointer transition-transform active:scale-90">
                        <Bell size={24} className="text-slate-400 hover:text-slate-600" />
                        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                    </div>
                    <button onClick={() => setModalType('settings')} className="transition-transform active:scale-90">
                        <Settings size={24} className="text-slate-400 hover:text-slate-600" />
                    </button>
                    <button onClick={signOut} className="transition-transform active:scale-90 ml-2 text-slate-400 hover:text-red-500">
                        <LogOut size={24} />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide bg-slate-50">
                <Routes>
                    {/* Note: Root path inside FarmerApp is effectively /farmer/* usually, but here App.jsx handles base. 
                If App.jsx renders FarmerApp on '/', then paths are relative to root. */}
                    <Route path="/" element={<HomeScreen onRecordClick={() => setShowRecordMenu(true)} isUnlocked={isUnlocked()} points={userPoints} lastYearRecord={lastYearRecord} onNavigate={(path) => {
                        if (path === 'record') setShowRecordMenu(true);
                        else navigate('/' + path);
                    }} />} />
                    <Route path="/timeline" element={<TimelineScreen isUnlocked={isUnlocked()} data={timelineData} myRecords={myRecords} onRecordClick={() => setShowRecordMenu(true)} points={userPoints} />} />
                    <Route path="/contact" element={<ContactScreen />} />
                    <Route path="/community" element={<CommunityScreen />} />
                    <Route path="/community/:id" element={<CommunityDetailScreen />} />
                    <Route path="/cultivation" element={<MyCultivationScreen records={myRecords} onExport={() => setModalType('csv')} inventory={inventory} />} />
                </Routes>
            </main>

            {/* Central Record Menu Overlay */}
            {showRecordMenu && (
                <RecordMenuOverlay
                    onClose={() => setShowRecordMenu(false)}
                    onSelect={openRecordForm}
                />
            )}

            {/* Bottom Navigation */}
            <div className="absolute bottom-0 w-full z-20 pointer-events-none">
                <div className="flex justify-center mb-[-28px] pointer-events-auto relative z-30">
                    <button
                        onClick={() => setShowRecordMenu(true)}
                        className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl shadow-green-200 flex items-center justify-center border-4 border-slate-50 transition-transform active:scale-90 group hover:shadow-2xl hover:shadow-green-300"
                    >
                        <Camera size={30} className="text-white group-hover:scale-110 transition-transform" />
                    </button>
                </div>
                <nav className="bg-white/95 backdrop-blur border-t border-slate-100 pb-safe pt-2 pointer-events-auto rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                    <div className="flex justify-between items-end h-16 px-4">
                        <NavItem icon={<Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />} label="ホーム" active={activeTab === 'home'} onClick={() => navigate('/')} />
                        <NavItem icon={<ClipboardList size={24} strokeWidth={activeTab === 'timeline' ? 2.5 : 2} />} label="タイムライン" active={activeTab === 'timeline'} onClick={() => navigate('/timeline')} />
                        <div className="w-16"></div>
                        <NavItem icon={<Users size={24} strokeWidth={activeTab === 'community' ? 2.5 : 2} />} label="コミュニティ" active={activeTab === 'community'} onClick={() => navigate('/community')} />
                        <NavItem icon={<Sprout size={24} strokeWidth={activeTab === 'my_cultivation' ? 2.5 : 2} />} label="MY栽培" active={activeTab === 'my_cultivation'} onClick={() => navigate('/cultivation')} />
                    </div>
                </nav>
            </div>

            {modalType && (
                modalType === 'csv' ? <CSVExportModal onClose={() => setModalType(null)} records={myRecords} /> :
                    modalType === 'settings' ? <SettingsModal onClose={() => setModalType(null)} settings={userSettings} onUpdate={setUserSettings} /> :
                        <RecordModal type={modalType} onClose={() => setModalType(null)} onSubmit={handleRecordSubmit} inventory={inventory} settings={userSettings} communities={joinedCommunities} />
            )}

            {notification && (
                <div className="absolute top-20 left-4 right-4 bg-slate-800 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center animate-in fade-in slide-in-from-top-4 z-50">
                    <CheckCircle2 size={24} className="mr-3 text-green-400" />
                    <span className="text-base font-bold">{notification}</span>
                </div>
            )}
        </div>
    );
}
