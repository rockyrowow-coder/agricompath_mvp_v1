import React, { useState } from 'react';
import { Sprout, MessageCircle, Bell, Settings, Camera, Home, ClipboardList, Star, CheckCircle2 } from 'lucide-react';
import { NavItem } from './components/Shared';
import { HomeScreen } from './components/HomeScreen';
import { TimelineScreen } from './components/TimelineScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { MyCultivationScreen } from './components/MyCultivationScreen';
import { RecordMenuOverlay, RecordModal, SettingsModal, CSVExportModal } from './components/Modals';
import { INITIAL_TIMELINE, INITIAL_MY_RECORDS, INITIAL_REVIEW_REQUESTS, INITIAL_INVENTORY } from './data/constants';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Modals & Overlays
  const [showRecordMenu, setShowRecordMenu] = useState(false);
  const [modalType, setModalType] = useState(null);

  // Data State
  const [userPoints, setUserPoints] = useState(1250);
  const [lastRecordTime, setLastRecordTime] = useState(null);
  const [timelineData, setTimelineData] = useState(INITIAL_TIMELINE);
  const [myRecords, setMyRecords] = useState(INITIAL_MY_RECORDS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY); // Added Inventory State
  const [notification, setNotification] = useState(null);

  const isUnlocked = () => {
    // 24-hour strict lock rule
    if (!lastRecordTime) return false;
    const oneDay = 24 * 60 * 60 * 1000;
    // eslint-disable-next-line
    return (Date.now() - lastRecordTime) < oneDay;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen onRecordClick={() => setShowRecordMenu(true)} isUnlocked={isUnlocked()} points={userPoints} />;
      case 'timeline': return <TimelineScreen isUnlocked={isUnlocked()} data={timelineData} onRecordClick={() => setShowRecordMenu(true)} points={userPoints} />;
      case 'reviews': return <ReviewScreen requests={INITIAL_REVIEW_REQUESTS} onAnswer={(pts) => setUserPoints(prev => prev + pts)} />;
      case 'my_cultivation': return <MyCultivationScreen records={myRecords} onExport={() => setModalType('csv')} inventory={inventory} />;
      default: return <HomeScreen onRecordClick={() => setShowRecordMenu(true)} isUnlocked={isUnlocked()} points={userPoints} />;
    }
  };

  const openRecordForm = (type) => {
    setModalType(type); // Fixed to use setModalType
    setShowRecordMenu(false);
  };

  const handleRecordSubmit = (newRecord) => {
    const timestamp = Date.now();

    // Deduct Inventory
    if ((modalType === 'pesticide' || modalType === 'fertilizer') && newRecord.pesticide) {
      setInventory(prev => prev.map(item => {
        if (item.name === newRecord.pesticide) {
          // Simple deduction: -1 unit per use. In a real app, parse newRecord.amount
          return { ...item, quantity: Math.max(0, item.quantity - 1) };
        }
        return item;
      }));
    }

    if (modalType !== 'tweet') {
      setLastRecordTime(timestamp);
      setUserPoints(prev => prev + 50);
    } else {
      setUserPoints(prev => prev + 10);
    }

    // Create Timeline Entry
    const timelineEntry = {
      id: timestamp,
      type: modalType, // Fixed to use modalType
      user: "あなた (自分)",
      isFollowed: true,
      crop: newRecord.crop || "ー",
      date: "たった今",
      pesticide: newRecord.pesticide,
      dilution: newRecord.dilution,
      mix: newRecord.mixes,
      method: newRecord.method,
      range: newRecord.range,
      duration: newRecord.duration,
      title: modalType === 'tweet' ? 'つぶやき' : (newRecord.pesticide || `${modalType === 'fertilizer' ? '施肥' : '作業'}`), // Fixed title logic
      comment: newRecord.memo,
      tags: ["#記録済み", ...(modalType === 'tweet' ? ["#つぶやき"] : [])],
      hasImage: true,
      likes: 0,
      hasLiked: false
    };

    // Create My Record Entry
    const myRecordEntry = {
      id: timestamp,
      date: newRecord.date || new Date().toISOString().split('T')[0],
      type: modalType, // Fixed to use modalType
      crop: newRecord.crop || "ー",
      detail: modalType === 'pesticide' || modalType === 'fertilizer' ? newRecord.pesticide :
        modalType === 'tweet' ? 'つぶやき' :
          modalType === 'accounting' ? newRecord.workType : // Use Category for Accounting
            newRecord.workType || newRecord.memo,
      amount: modalType === 'pesticide' ? `${newRecord.dilution}倍` :
        modalType === 'accounting' ? `¥${newRecord.amount}` : // Format Currency
          (newRecord.amount || '-'),
      field: newRecord.field || "-",
      timeStart: newRecord.timeStart,
      timeEnd: newRecord.timeEnd,
      range: newRecord.range,
      status: "done"
    };

    setTimelineData([timelineEntry, ...timelineData]);
    setMyRecords([myRecordEntry, ...myRecords]);

    setModalType(null); // Close modal

    setActiveTab('timeline');
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
        {renderContent()}
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
            <NavItem icon={<Home size={24} strokeWidth={activeTab === 'home' ? 2.5 : 2} />} label="ホーム" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon={<ClipboardList size={24} strokeWidth={activeTab === 'timeline' ? 2.5 : 2} />} label="タイムライン" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')} />
            <div className="w-16"></div>
            <NavItem icon={<Star size={24} strokeWidth={activeTab === 'reviews' ? 2.5 : 2} />} label="評価依頼" active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')} />
            <NavItem icon={<Sprout size={24} strokeWidth={activeTab === 'my_cultivation' ? 2.5 : 2} />} label="MY栽培" active={activeTab === 'my_cultivation'} onClick={() => setActiveTab('my_cultivation')} />
          </div>
        </nav>
      </div>

      {modalType && (
        modalType === 'csv' ? <CSVExportModal onClose={() => setModalType(null)} records={myRecords} /> :
          modalType === 'settings' ? <SettingsModal onClose={() => setModalType(null)} /> :
            <RecordModal type={modalType} onClose={() => setModalType(null)} onSubmit={handleRecordSubmit} inventory={inventory} />
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
