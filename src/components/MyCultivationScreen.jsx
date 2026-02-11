import React, { useState } from 'react';
import { Download, Layout, CalendarDays, Map as MapIcon, BarChart3, Sprout, Package, Receipt, FileText, Search, Filter, Plus, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { RecordTypeBadge } from './Shared';
import { MOCK_AI_TAGS } from '../data/constants';

// MaterialRegisterModal component (assuming it's defined elsewhere or needs to be added here)
const MaterialRegisterModal = ({ onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [category, setCategory] = useState('縺昴・莉・); // Default category

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !quantity || !unit || !category) {
            alert('蜈ｨ縺ｦ縺ｮ鬆・岼繧貞・蜉帙＠縺ｦ縺上□縺輔＞縲・);
            return;
        }
        onSubmit({ name, quantity, unit, category });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-800">雉・攝繧堤匳骭ｲ</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-bold text-slate-700 mb-1">雉・攝蜷・/label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-medium"
                            placeholder="萓・ 谿ｺ陌ｫ蜑､縲∝喧謌占ぇ譁・
                            required
                        />
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label htmlFor="quantity" className="block text-sm font-bold text-slate-700 mb-1">謨ｰ驥・/label>
                            <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-medium"
                                placeholder="萓・ 10"
                                min="0"
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <label htmlFor="unit" className="block text-sm font-bold text-slate-700 mb-1">蜊倅ｽ・/label>
                            <input
                                type="text"
                                id="unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-medium"
                                placeholder="萓・ 陲九´縲〔g"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="category" className="block text-sm font-bold text-slate-700 mb-1">繧ｫ繝・ざ繝ｪ</label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 text-sm font-medium appearance-none"
                            required
                        >
                            <option value="霎ｲ阮ｬ">霎ｲ阮ｬ</option>
                            <option value="閧･譁・>閧･譁・/option>
                            <option value="遞ｮ蟄・>遞ｮ蟄・/option>
                            <option value="雉・攝">雉・攝</option>
                            <option value="縺昴・莉・>縺昴・莉・/option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-base hover:bg-green-500 transition-colors flex items-center justify-center space-x-2"
                    >
                        <CheckCircle2 size={20} />
                        <span>逋ｻ骭ｲ縺吶ｋ</span>
                    </button>
                </form>
            </div>
        </div>
    );
};


export function MyCultivationScreen({ records, onExport, inventory }) {
    const [viewMode, setViewMode] = useState('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCrop, setFilterCrop] = useState('蜈ｨ縺ｦ'); // New state variable
    const [showRegisterModal, setShowRegisterModal] = useState(false); // New state variable
    const { user } = useAuth(); // New hook

    // We need a way to refresh inventory after adding, but props are passed from App.
    // Ideally App should pass a refresh function, but for MVP we might just rely on re-mount or window reload if simple.
    // Or better, we handle the insert here and maybe Optimistically update if we had setInventory passed.
    // For now, we'll just insert to DB and alert user to refresh or if we can trigger a state update.
    // Actually, App.jsx fetches inventory. If we insert here, App won't know unless we tell it.
    // Let's just insert to DB and show success. The next load will have it. 

    const handleRegisterMaterial = async (newMaterial) => {
        if (!user) return;
        
        try {
            const { error } = await supabase
                .from('inventory')
                .insert([{
                    user_id: user.id,
                    name: newMaterial.name,
                    quantity: parseInt(newMaterial.quantity),
                    unit: newMaterial.unit,
                    category: newMaterial.category
                }]);

            if (error) throw error;
            
            setShowRegisterModal(false);
            alert("雉・攝繧堤匳骭ｲ縺励∪縺励◆縲ょ渚譏縺吶ｋ縺ｫ縺ｯ繝ｪ繝ｭ繝ｼ繝峨＠縺ｦ縺上□縺輔＞縲・); 
            // In a full app, we'd call a prop like onInventoryUpdate()
        } catch(e) {
            console.error("Error adding material:", e);
            alert("逋ｻ骭ｲ縺ｫ螟ｱ謨励＠縺ｾ縺励◆");
        }
    };

    const filteredRecords = records.filter(record => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (record.detail && record.detail.toLowerCase().includes(term)) ||
            (record.crop && record.crop.toLowerCase().includes(term)) ||
            (record.memo && record.memo.toLowerCase().includes(term)) ||
            (record.pesticide && record.pesticide.toLowerCase().includes(term)) ||
            (record.workType && record.workType.toLowerCase().includes(term)) ||
            (record.target && record.target.toLowerCase().includes(term));

        const matchesType = filterType === 'all' || record.type === filterType;
        return matchesSearch && matchesType;
    });

    const handleTagClick = (tag) => {
        // Remove # for search or keep it? Let's just set the text.
        setSearchTerm(tag.replace('#', ''));
    };

    return (
        <div className="p-4 space-y-4 pb-32 bg-slate-50 min-h-screen">
            <div className="flex flex-col space-y-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm sticky top-0 z-10 transition-all">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">MY譬ｽ蝓ｹ險倬鹸</h2>
                        <p className="text-xs font-medium text-slate-400">閾ｪ蛻・・蜈ｨ繝・・繧ｿ繧堤ｮ｡逅・/p>
                    </div>
                    <button onClick={onExport} className="flex items-center space-x-2 bg-green-600 text-white hover:bg-green-500 px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-green-100 transition-transform active:scale-95">
                        <Download size={16} /> <span>CSV蜃ｺ蜉・/span>
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="菴懃黄繝ｻ雉・攝繝ｻ菴懈･ｭ蜷阪〒讀懃ｴ｢..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500"
                            />
                        </div>
                        <div className="relative">
                            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 appearance-none"
                            >
                                <option value="all">蜈ｨ縺ｦ</option>
                                <option value="pesticide">髦ｲ髯､</option>
                                <option value="fertilizer">譁ｽ閧･</option>
                                <option value="work">菴懈･ｭ</option>
                                <option value="harvest">蜿守ｩｫ</option>
                                <option value="accounting">邨檎炊</option>
                            </select>
                        </div>
                    </div>
                    {/* AI Suggested Tags */}
                    <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar">
                        <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded flex-shrink-0">
                            <span className="text-purple-500">笨ｨ AI蛻・梵:</span>
                        </div>
                        {MOCK_AI_TAGS.map(tag => (
                            <button key={tag} onClick={() => handleTagClick(tag)} className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-1 rounded whitespace-nowrap hover:bg-slate-50 hover:border-green-300 transition-colors">
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <button onClick={() => setViewMode('list')} className={`flex - 1 min - w - [80px] flex items - center justify - center space - x - 1.5 py - 2.5 rounded - lg text - xs font - bold transition - all ${ viewMode === 'list' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50' } `}><Layout size={16} /> <span>繝ｪ繧ｹ繝・/span></button>
                <button onClick={() => setViewMode('gantt')} className={`flex - 1 min - w - [80px] flex items - center justify - center space - x - 1.5 py - 2.5 rounded - lg text - xs font - bold transition - all ${ viewMode === 'gantt' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50' } `}><BarChart3 size={16} /> <span>蟾･遞玖｡ｨ</span></button>
                <button onClick={() => setViewMode('inventory')} className={`flex - 1 min - w - [80px] flex items - center justify - center space - x - 1.5 py - 2.5 rounded - lg text - xs font - bold transition - all ${ viewMode === 'inventory' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50' } `}><Package size={16} /> <span>雉・攝蝨ｨ蠎ｫ</span></button>
                <button onClick={() => setViewMode('accounting')} className={`flex - 1 min - w - [80px] flex items - center justify - center space - x - 1.5 py - 2.5 rounded - lg text - xs font - bold transition - all ${ viewMode === 'accounting' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50' } `}><Receipt size={16} /> <span>邨檎炊</span></button>
                <button onClick={() => setViewMode('calendar')} className={`flex - 1 min - w - [80px] flex items - center justify - center space - x - 1.5 py - 2.5 rounded - lg text - xs font - bold transition - all ${ viewMode === 'calendar' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50' } `}><CalendarDays size={16} /> <span>髦ｲ髯､證ｦ</span></button>
                <button onClick={() => setViewMode('map')} className={`flex - 1 min - w - [80px] flex items - center justify - center space - x - 1.5 py - 2.5 rounded - lg text - xs font - bold transition - all ${ viewMode === 'map' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-400 hover:bg-slate-50' } `}><MapIcon size={16} /> <span>繝槭ャ繝・/span></button>
            </div>

            {viewMode === 'list' && (
                <div className="space-y-3 animate-in fade-in">
                    {filteredRecords.map(record => (
                        <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-mono font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{record.date}</span>
                                <RecordTypeBadge type={record.type} />
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-base font-bold text-slate-800">{record.detail || record.workType || "蜷咲ｧｰ譛ｪ險ｭ螳・}</span>
                                {record.type === 'accounting' && <span className="text-lg font-bold text-slate-800">{record.amount}</span>}
                                {record.type === 'harvest' && <span className="text-lg font-bold text-orange-600">{record.amount}</span>}
                            </div>
                            <div className="flex items-center text-xs text-slate-500 font-bold space-x-2">
                                <span className="flex items-center"><Sprout size={12} className="mr-1" /> {record.crop}</span>
                                <div>窶｢</div>
                                <span>{record.timeStart ? `${ record.timeStart } ~` : ''} {record.range}</span>
                            </div>
                            {/* Specific details for new fields */}
                            {(record.pesticide || record.workType) && (
                                <div className="text-xs text-slate-400 bg-slate-50 p-2 rounded relative">
                                    {record.pesticide && <div>雉・攝: {record.pesticide}</div>}
                                    {record.workType && <div>菴懈･ｭ: {record.workType} {record.amount ? `(${ record.amount })` : ''}</div>}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredRecords.length === 0 && (
                        <div className="text-center py-10 text-slate-400 font-bold text-sm">隧ｲ蠖薙☆繧玖ｨ倬鹸縺後≠繧翫∪縺帙ｓ</div>
                    )}
                </div>
            )}

            {viewMode === 'gantt' && (
                <GanttView records={filteredRecords} />
            )}

            {viewMode === 'inventory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                    {inventory && inventory.map(item => (
                        <div key={item.id} className={`bg - white p - 5 rounded - 2xl border ${ item.quantity <= 1 ? 'border-red-200 bg-red-50' : 'border-slate-200' } shadow - sm flex flex - col justify - between h - full`}>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text - xs font - bold px - 2 py - 1 rounded - md ${ item.category === '霎ｲ阮ｬ' ? 'bg-red-100 text-red-600' : item.category === '閧･譁・ ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600' } `}>{item.category}</span>
                                {item.quantity <= 1 && <span className="text-[10px] font-bold text-red-500 flex items-center bg-white px-2 py-0.5 rounded-full shadow-sm animate-pulse">蝨ｨ蠎ｫ蜒・ｰ・/span>}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">{item.name}</h3>
                                <p className="text-sm font-medium text-slate-500">1蜊倅ｽ・ {item.unit}</p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-end justify-between">
                                <span className="text-xs font-bold text-slate-400">迴ｾ蝨ｨ蠎ｫ</span>
                                <span className={`text - 2xl font - extrabold ${ item.quantity <= 1 ? 'text-red-500' : 'text-slate-800' } `}>{item.quantity} <span className="text-sm font-bold text-slate-500">蛟・/span></span>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => setShowRegisterModal(true)} className="col-span-1 md:col-span-2 py-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center justify-center space-x-2">
                        <Plus size={20} />
                        <span>譁ｰ縺励＞雉・攝繧堤匳骭ｲ</span>
                    </button>
                </div>
            )}

            {showRegisterModal && (
                <MaterialRegisterModal onClose={() => setShowRegisterModal(false)} onSubmit={handleRegisterMaterial} />
            )}

            {viewMode === 'accounting' && (
                <div className="space-y-4 animate-in fade-in">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">莉頑怦縺ｮ邨瑚ｲｻ蜷郁ｨ・(讎らｮ・</p>
                            <h3 className="text-2xl font-extrabold text-slate-800">ﾂ･12,450</h3>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                            <Receipt size={24} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        {filteredRecords.filter(r => r.type === 'accounting').length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm font-bold">縺ｾ縺邨檎炊險倬鹸縺後≠繧翫∪縺帙ｓ</div>
                        ) : (
                            filteredRecords.filter(r => r.type === 'accounting').map(record => (
                                <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800">{record.detail}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{record.date}</p>
                                            </div>
                                        </div>
                                        <span className="text-lg font-extrabold text-slate-800">{record.amount}</span>
                                    </div>
                                    <div className="bg-slate-50 rounded-lg h-32 flex items-center justify-center border-2 border-dashed border-slate-200">
                                        <span className="text-xs font-bold text-slate-400">繝ｬ繧ｷ繝ｼ繝育判蜒・/span>
                                    </div>
                                    {record.range !== "-" && <div className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded inline-block self-start">繝｡繝｢: {record.range}</div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {viewMode === 'map' && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in h-64 relative flex items-center justify-center shadow-inner">
                    <div className="absolute inset-0 bg-slate-100 opacity-50 patterned-bg"></div>
                    <p className="relative z-10 text-xs font-bold text-slate-400 bg-white/80 px-4 py-2 rounded-full backdrop-blur">菴懈･ｭ遽・峇繝・・繧ｿ縺ｫ蝓ｺ縺･縺上ヲ繝ｼ繝医・繝・・繧定｡ｨ遉ｺ莠亥ｮ・/p>
                </div>
            )}
        </div>
    );
}

function GanttView({ records }) {
    // Determine date range (past 14 days + future 7 days for demo)
    const today = new Date();
    const dates = [];
    for (let i = -14; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    // Group by crop
    const crops = [...new Set(records.map(r => r.crop))];

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-700">譬ｽ蝓ｹ蟾･遞九メ繝｣繝ｼ繝・/h3>
            </div>
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[800px] p-4">
                    {/* Header Dates */}
                    <div className="flex ml-24 mb-4">
                        {dates.map((date) => {
                            const d = new Date(date);
                            const isToday = d.toDateString() === new Date().toDateString();
                            return (
                                <div key={date} className={`flex - shrink - 0 w - 8 text - center text - [10px] font - bold ${ isToday ? 'text-green-600' : 'text-slate-400' } `}>
                                    {d.getDate()}
                                </div>
                            );
                        })}
                    </div>

                    {/* Rows */}
                    <div className="space-y-6">
                        {crops.map(crop => (
                            <div key={crop} className="relative">
                                {/* Row Label */}
                                <div className="absolute left-0 top-0 w-20 flex items-center space-x-1.5 pt-1">
                                    <div className="bg-green-100 p-1.5 rounded-lg"><Sprout size={14} className="text-green-600" /></div>
                                    <span className="text-xs font-bold text-slate-700 truncate">{crop}</span>
                                </div>

                                {/* Timeline Lane */}
                                <div className="ml-24 flex relative h-8 items-center bg-slate-50 rounded-full">
                                    {/* Grid Lines */}
                                    {dates.map((date) => (
                                        <div key={date} className="flex-shrink-0 w-8 h-full border-r border-slate-200/50"></div>
                                    ))}

                                    {/* Record Bars */}
                                    {records.filter(r => r.crop === crop).map(record => {
                                        const recordDate = record.date;
                                        const dateIndex = dates.indexOf(recordDate);
                                        if (dateIndex === -1) return null;

                                        let colorClass = "bg-slate-400";
                                        if (record.type === 'pesticide') colorClass = "bg-red-400";
                                        if (record.type === 'fertilizer') colorClass = "bg-green-500";
                                        if (record.type === 'harvest') colorClass = "bg-orange-400";
                                        if (record.type === 'work') colorClass = "bg-blue-400"; // Added color for work

                                        return (
                                            <div
                                                key={record.id}
                                                className={`absolute h - 6 rounded - md shadow - sm border border - white / 20 ${ colorClass } group cursor - pointer hover: z - 10 hover: scale - 110 transition - transform`}
                                                style={{ left: `${ dateIndex * 32 + 2 } px`, width: '28px' }}
                                            >
                                                {/* Tooltip */}
                                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 bg-slate-800 text-white text-[10px] p-2 rounded-lg font-bold z-20 shadow-xl pointer-events-none">
                                                    {record.detail || record.workType || "菴懈･ｭ"}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="border-t border-slate-100 p-3 flex justify-center space-x-4">
                <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-red-400"></span><span className="text-[10px] font-bold text-slate-500">髦ｲ髯､</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-green-500"></span><span className="text-[10px] font-bold text-slate-500">譁ｽ閧･</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-orange-400"></span><span className="text-[10px] font-bold text-slate-500">蜿守ｩｫ</span></div>
                <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded bg-blue-400"></span><span className="text-[10px] font-bold text-slate-500">菴懈･ｭ</span></div>
            </div>
        </div>
    );
}
