import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { useAuth } from './contexts/AuthContext';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sprout, MessageCircle, Bell, Settings, Camera, Home, ClipboardList, Star, CheckCircle2 } from 'lucide-react';
import { NavItem } from './components/Shared';
import { HomeScreen } from './components/HomeScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { MyCultivationScreen } from './components/MyCultivationScreen';
import { LoginScreen } from './components/LoginScreen';
import { RecordMenuOverlay, RecordModal, SettingsModal, CSVExportModal } from './components/Modals';
import { INITIAL_TIMELINE, INITIAL_MY_RECORDS, INITIAL_REVIEW_REQUESTS, INITIAL_INVENTORY } from './data/constants';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Modals & Overlays
  const [showRecordMenu, setShowRecordMenu] = useState(false);
  const [modalType, setModalType] = useState(null);

  // Data State - Supabase Integrated
  const [userPoints, setUserPoints] = useState(1250); // Points might need a DB table if persistent across devices, but keeping local/session for MVP or future update
  const [lastRecordTime, setLastRecordTime] = useState(null);
  const [timelineData, setTimelineData] = useState(INITIAL_TIMELINE);
  const [myRecords, setMyRecords] = useState([]); // Start empty, fetch from DB
  const [inventory, setInventory] = useState([]); // Start empty, fetch from DB
  const [userSettings, setUserSettings] = useState({
    ja_id: '',
    line_info: '',
    custom_crops: [],
    custom_methods: []
  });
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

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

          // Update Unlock State based on latest record
          if (recordsData.length > 0) {
            // Find the most recent record timestamp
            // created_at is reliable for "when did they record it"
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
          setInventory(inventoryData);
        } else {
          // First time setup? Maybe allow falling back to INITIAL if empty, 
          // but strictly we should probably initialize DB using SQL or separate logic.
          // For MVP, if empty, we might use INITIAL_INVENTORY purely for display if we pushed it?
          // Let's stick to DB truth. If empty, it's empty.
          if (inventoryData.length === 0) setInventory(INITIAL_INVENTORY); // Fallback for demo if DB empty
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

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Keep Timeline Data as Static/Mixed for MVP (Department/Following are mock)
  // We could fetch real timeline if we had a table for it. 
  // For now, we mix in *our* records into a view, but the "Department" posts are static constants.



  // Determine active tab based on path
  const getActiveTab = (pathname) => {
    if (pathname === '/') return 'home';
    if (pathname === '/timeline') return 'timeline';
    if (pathname === '/reviews') return 'reviews';
    if (pathname === '/cultivation') return 'my_cultivation';
    return 'home';
  };

  const activeTab = getActiveTab(location.pathname);

  const isUnlocked = () => {
    if (!lastRecordTime) return false;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - lastRecordTime) < sevenDays;
  };

  // Helper to find "1 Year Ago" record
  const getOneYearAgoRecord = () => {
    // For MVP/Demo, our "Today" might be dynamic, but let's look for records approx 365 days ago.
    // If strict 365 days doesn't match, find closest within that month for demo purposes.
    // In a real app, we'd query DB for date range.
    // Here we check `myRecords` (which includes INITIAL_MY_RECORDS).

    // Mocking "Today" as 2024-06-12 for demo consistency if needed, but let's use real date.
    const today = new Date();
    const lastYear = new Date(today);
    lastYear.setFullYear(today.getFullYear() - 1);

    // Simple find: look for same month/year
    // For the specific user request "Last year this time", we'll grab from our mock data `INITIAL_MY_RECORDS`
    // which we updated in constants.js to have 2023-06 data.

    if (!myRecords || myRecords.length === 0) return null;

    // Sort by date desending just in case
    // Find closest to lastYear
    const closest = myRecords.reduce((prev, curr) => {
      const prevDate = new Date(prev.date);
      const currDate = new Date(curr.date);
      const targetDate = lastYear;

      return (Math.abs(currDate - targetDate) < Math.abs(prevDate - targetDate) ? curr : prev);
    });

    // Only return if it's actually from last year (tolerance of 30 days)
    const diffTime = Math.abs(new Date(closest.date) - lastYear);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 60) return closest; // Liberal window for demo content
    return null;
  };

  const lastYearRecord = getOneYearAgoRecord();

  const openRecordForm = (type) => {
    setModalType(type);
    setShowRecordMenu(false);
  };

  const handleRecordSubmit = async (newRecord) => {
    const timestamp = Date.now();

    // 1. Prepare payload for Supabase
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
      memo: newRecord.memo
    };

    // 2. Insert into Supabase
    if (user) {
      const { data, error } = await supabase
        .from('records')
        .insert([recordPayload])
        .select();

      if (error) {
        console.error('Error inserting record:', error);
        alert('記録の保存に失敗しました');
        return;
      }

      // 3. Optimistic Update (or use returned data)
      if (data && data[0]) {
        const returnedRecord = data[0];
        const myRecordEntry = {
          id: returnedRecord.id, // Use DB ID
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

        //Unlock timeline logic
        setLastRecordTime(Date.now());
      }
    } else {
      // Fallback for no user (demo mode?)
      // ... (demo logic if needed, or force login)
    }

    // Deduct Inventory (Client-side optimistic for now, should be DB trigger or separate API call)
    // For MVP, we won't strictly update DB inventory unless asked, but let's try to simple update if we can.
    // ... (Skipping complex inventory DB update for this MVP step to keep it simple, just UI update if fetched)
    if ((modalType === 'pesticide' || modalType === 'fertilizer') && newRecord.pesticide) {
      setInventory(prev => prev.map(item => {
        if (item.name === newRecord.pesticide) {
          return { ...item, quantity: Math.max(0, item.quantity - 1) };
        }
        return item;
      }));
    }

    if (modalType !== 'tweet') {
      setUserPoints(prev => prev + 50);
    } else {
      setUserPoints(prev => prev + 10);
    }

    setModalType(null);
    navigate('/timeline');
    setNotification(`記録完了！ +${modalType !== 'tweet' ? 50 : 10}pt`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden max-w-md mx-auto border-x border-slate-200 shadow-2xl relative">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 bg-white border-b border-slate-100 z-10 shadow-sm">
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
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide bg-slate-50">
        <Routes>
          <Route path="/" element={<HomeScreen onRecordClick={() => setShowRecordMenu(true)} isUnlocked={isUnlocked()} points={userPoints} lastYearRecord={lastYearRecord} onNavigate={(path) => {
            if (path === 'record') setShowRecordMenu(true);
            else navigate('/' + path);
          }} />}
          <Route path="/timeline" element={<TimelineScreen isUnlocked={isUnlocked()} data={timelineData} myRecords={myRecords} onRecordClick={() => setShowRecordMenu(true)} points={userPoints} />} />
          <Route path="/reviews" element={<ReviewScreen requests={INITIAL_REVIEW_REQUESTS} onAnswer={(pts) => setUserPoints(prev => prev + pts)} />} />
          <Route path="/cultivation" element={<MyCultivationScreen records={myRecords} onExport={() => setModalType('csv')} inventory={inventory} />} />
          <Route path="/login" element={<LoginScreen />} />
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
            <NavItem icon={<Star size={24} strokeWidth={activeTab === 'reviews' ? 2.5 : 2} />} label="評価依頼" active={activeTab === 'reviews'} onClick={() => navigate('/reviews')} />
            <NavItem icon={<Sprout size={24} strokeWidth={activeTab === 'my_cultivation' ? 2.5 : 2} />} label="MY栽培" active={activeTab === 'my_cultivation'} onClick={() => navigate('/cultivation')} />
          </div>
        </nav>
      </div>

      {modalType && (
        modalType === 'csv' ? <CSVExportModal onClose={() => setModalType(null)} records={myRecords} /> :
          modalType === 'settings' ? <SettingsModal onClose={() => setModalType(null)} settings={userSettings} onUpdate={setUserSettings} /> :
            <RecordModal type={modalType} onClose={() => setModalType(null)} onSubmit={handleRecordSubmit} inventory={inventory} settings={userSettings} />
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
