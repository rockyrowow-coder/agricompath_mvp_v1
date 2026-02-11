import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, ImageIcon, Plus, Lock, Trophy, Filter, Search, MapPin, Sprout, Activity } from 'lucide-react';
import { RecordTypeBadge } from './Shared';

export function TimelineScreen({ isUnlocked, data, onRecordClick }) {
    const [activeTab, setActiveTab] = useState("recommended"); // 'recommended', 'following', 'department'
    const [activeSubTab, setActiveSubTab] = useState("records"); // 'records', 'tweets'
    const [filterOpen, setFilterOpen] = useState(false);

    // Filter States
    const [filterRegion, setFilterRegion] = useState("all");
    const [filterCrop, setFilterCrop] = useState("all");
    const [filterType, setFilterType] = useState("all");

    const getFilteredData = (tab, subTab) => {
        return data.filter(item => {
            // Main Tab Logic
            if (tab === 'department') {
                if (!item.isOfficial) return false;
            } else if (tab === 'following') {
                if (!item.isFollowed || item.isOfficial) return false;
            } else if (tab === 'recommended') {
                if (item.isFollowed || item.isOfficial) return false;
            }

            // Sub Tab Logic (except for specific logic like Department might show all)
            // Department might want to separate too, but let's apply to all for consistency
            if (subTab === 'tweets' && item.type !== 'tweet') return false;
            if (subTab === 'records' && item.type === 'tweet') return false;

            // Advanced Filters
            if (filterRegion !== "all" && item.region !== filterRegion) return false;
            if (filterCrop !== "all" && item.crop !== filterCrop) return false;
            if (filterType !== "all" && item.type !== filterType) return false;

            return true;
        });
    };

    const displayData = getFilteredData(activeTab, activeSubTab);

    // Mock Trending Data (Just picking some items for display)
    const trendingData = data.filter(i => i.likes > 10).slice(0, 3);
    const newRecordsCount = 12;

    return (
        <div className="bg-slate-50 min-h-full pb-24">
            {/* Header / Tabs */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-20 border-b border-slate-200 shadow-sm">
                <div className="flex px-2 pt-2 pb-0 space-x-1 overflow-x-auto no-scrollbar">
                    {['recommended', 'following', 'department'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[30%] pb-3 text-sm font-bold border-b-2 transition-colors text-center whitespace-nowrap ${activeTab === tab ? 'text-green-600 border-green-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        >
                            {tab === 'recommended' ? 'おすすめ' : tab === 'following' ? 'フォロー中' : '部会・公式'}
                        </button>
                    ))}
                </div>

                {/* Sub Tabs & Filter Bar */}
                <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
                    <div className="flex bg-slate-200/50 rounded-lg p-1">
                        <button onClick={() => setActiveSubTab('records')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeSubTab === 'records' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>営農記録</button>
                        <button onClick={() => setActiveSubTab('tweets')} className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeSubTab === 'tweets' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>つぶやき</button>
                    </div>

                    <button onClick={() => setFilterOpen(!filterOpen)} className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterOpen ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-500'}`}>
                        <Filter size={14} /> <span>絞り込み</span>
                    </button>
                </div>

                {/* Filter Panel */}
                {filterOpen && (
                    <div className="bg-white p-4 border-b border-slate-200 animate-in slide-in-from-top-2 space-y-3 shadow-inner">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">詳細検索</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 flex items-center"><MapPin size={10} className="mr-1" /> 地域</label>
                                <select className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-700" value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
                                    <option value="all">全地域</option>
                                    <option value="east">東部</option>
                                    <option value="west">西部</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 flex items-center"><Sprout size={10} className="mr-1" /> 作物</label>
                                <select className="w-full text-sm bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold text-slate-700" value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)}>
                                    <option value="all">全作物</option>
                                    <option value="rice">水稲</option>
                                    <option value="wheat">小麦</option>
                                    <option value="soy">大豆</option>
                                </select>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <label className="text-[10px] font-bold text-slate-500 flex items-center"><Activity size={10} className="mr-1" /> 記録種類</label>
                                <div className="flex space-x-2 overflow-x-auto pb-1">
                                    {['all', 'pesticide', 'fertilizer', 'work', 'harvest'].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setFilterType(t)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterType === t ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}
                                        >
                                            {t === 'all' ? '全て' : t === 'pesticide' ? '防除' : t === 'fertilizer' ? '施肥' : t === 'work' ? '作業' : '収穫'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-6">
                {/* Trending Section (Visible on Recommended Tab) */}
                {activeTab === 'recommended' && (
                    <div className="mb-2">
                        <h3 className="text-xs font-bold text-slate-500 mb-2 flex items-center"><Activity size={14} className="mr-1 text-orange-500" /> トレンド・話題</h3>
                        <div className="flex space-x-3 overflow-x-auto pb-4 -mx-4 px-4 no-scrollbar">
                            {trendingData.map(item => (
                                <div key={item.id} className="min-w-[240px] bg-white rounded-xl p-3 border border-slate-200 shadow-sm flex-shrink-0">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{item.user.charAt(0)}</div>
                                        <div><p className="text-xs font-bold text-slate-800">{item.user}</p><p className="text-[10px] text-slate-400">{item.date}</p></div>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 line-clamp-2 mb-2">{item.comment || item.detail}</p>
                                    <div className="flex items-center text-orange-500 text-[10px] font-bold"><ThumbsUp size={12} className="mr-1" /> {item.likes}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* FOMO Banner */}
                {!isUnlocked && activeSubTab === 'records' && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-0.5 shadow-lg animate-pulse mb-6">
                        <div className="bg-white rounded-[10px] p-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-extrabold text-orange-600 flex items-center">
                                    <Activity size={18} className="mr-2 animate-bounce" />
                                    現在、地域で活発に作業中！
                                </h3>
                                <p className="text-xs font-bold text-slate-600 mt-1">
                                    本日、<span className="text-lg text-red-500 font-extrabold mx-1">{newRecordsCount}件</span>の新しい記録が共有されています。
                                </p>
                            </div>
                            <button onClick={onRecordClick} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-md transition-transform active:scale-95 whitespace-nowrap">
                                記録して<br />閲覧する
                            </button>
                        </div>
                    </div>
                )}

                {displayData.map((item) => (
                    <TimelineCard
                        key={item.id}
                        data={item}
                        isLocked={!isUnlocked && activeSubTab === 'records' && !item.isOfficial}
                    />
                ))}

                {displayData.length === 0 && (
                    <div className="text-center py-10 text-slate-400">
                        <p className="font-bold text-sm">該当する記録はありません</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function TimelineCard({ data, isLocked }) {
    const [liked, setLiked] = useState(data.hasLiked);
    const [likes, setLikes] = useState(data.likes);

    const toggleLike = () => {
        if (liked) { setLikes(likes - 1); setLiked(false); }
        else { setLikes(likes + 1); setLiked(true); }
    };

    // Official Post (Thread style)
    if (data.isOfficial) {
        return (
            <div className="bg-white border-l-4 border-l-blue-500 border border-t-slate-200 border-r-slate-200 border-b-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-full"><MessageCircle size={20} className="text-blue-600" /></div>
                    <div>
                        <span className="bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded font-bold mr-2">重要連絡</span>
                        <span className="font-bold text-slate-800 block">{data.title}</span>
                    </div>
                    <span className="text-xs text-slate-400 ml-auto whitespace-nowrap">{data.date}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{data.comment}</p>
                </div>
                <div className="flex items-center justify-between">
                    <button className="text-blue-600 text-xs font-bold hover:underline">スレッドを表示 (3件の返信)</button>
                    <button onClick={toggleLike} className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-colors ${liked ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>
                        <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} /> <span className="text-xs font-bold">{likes}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            {/* Header: Always visible to induce FOMO */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-500 border border-slate-200 shadow-sm">
                        {data.user.charAt(0)}
                    </div>
                    <div>
                        <p className="text-base font-bold text-slate-800">{data.user}</p>
                        <p className="text-xs text-slate-500 font-bold flex items-center mt-0.5">
                            <Sprout size={12} className="mr-1" /> {data.crop}
                            <span className="mx-1.5">•</span>
                            {data.date}
                        </p>
                    </div>
                </div>
                <RecordTypeBadge type={data.type} />
            </div>

            {/* Content Area */}
            <div className="relative">
                {isLocked ? (
                    // FOMO UI: Blurred Content with Overlay
                    <div className="relative rounded-xl overflow-hidden border border-slate-100 bg-slate-50/50">
                        {/* Fake Burred Content */}
                        <div className="filter blur-md p-4 space-y-4 opacity-60 select-none">
                            <div className="h-6 w-3/4 bg-slate-300 rounded"></div>
                            <div className="h-20 w-full bg-slate-200 rounded"></div>
                            <div className="flex space-x-2">
                                <div className="h-8 w-16 bg-slate-300 rounded-full"></div>
                                <div className="h-8 w-16 bg-slate-300 rounded-full"></div>
                            </div>
                        </div>

                        {/* Lock Overlay */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/20 backdrop-blur-sm p-4 text-center">
                            <div className="bg-slate-900/80 text-white p-3 rounded-full mb-3 shadow-lg animate-bounce">
                                <Lock size={24} />
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-700 shadow-sm mb-1">詳細はロックされています</h4>
                            <p className="text-[10px] font-bold text-slate-500 bg-white/80 px-3 py-1 rounded-full backdrop-blur">
                                {data.type === 'pesticide' ? '使用した農薬・希釈倍率' : '作業の詳細メモ'} が隠されています
                            </p>
                        </div>
                    </div>
                ) : (
                    // Unlocked Content
                    <>
                        {data.type === 'pesticide' ? (
                            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100 mb-4 shadow-sm">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-2 border-dashed">
                                    <span className="text-xs font-bold text-slate-500">使用薬剤</span>
                                    <span className="text-base font-extrabold text-slate-800">{data.pesticide}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] text-slate-400 block mb-0.5">希釈倍率</span>
                                        <span className="text-sm font-bold text-slate-700">{data.dilution}倍</span>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] text-slate-400 block mb-0.5">散布範囲</span>
                                        <span className="text-sm font-bold text-slate-700">{data.range}</span>
                                    </div>
                                </div>
                                {data.mix && data.mix.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {data.mix.map((m, i) => (
                                            <span key={i} className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-1 rounded-full font-bold">
                                                + {m}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (data.type !== 'tweet' &&
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 shadow-sm">
                                <h4 className="text-sm font-extrabold text-slate-800 mb-1">{data.title || data.detail}</h4>
                                {data.amount && <p className="text-xs text-slate-500 font-bold">使用量: {data.amount}</p>}
                            </div>
                        )}

                        <p className="text-sm text-slate-700 leading-relaxed mb-4 p-2 bg-slate-50/50 rounded-lg whitespace-pre-wrap font-medium">
                            {data.comment || "コメントなし"}
                        </p>

                        {data.hasImage && (
                            <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 h-48 bg-slate-100 flex items-center justify-center relative group cursor-pointer">
                                <ImageIcon size={32} className="text-slate-400" />
                                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">2枚</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <div className="flex space-x-3">
                    <button onClick={toggleLike} className={`flex items-center space-x-1.5 px-4 py-2 rounded-full transition-all active:scale-95 ${liked ? 'text-green-600 bg-green-50 ring-2 ring-green-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <ThumbsUp size={18} fill={liked ? "currentColor" : "none"} className={liked ? "animate-bounce" : ""} />
                        <span className="text-xs font-bold">{likes}</span>
                    </button>
                    <button className="flex items-center space-x-1.5 px-4 py-2 rounded-full text-slate-500 hover:bg-slate-50 transition-colors">
                        <MessageCircle size={18} /> <span className="text-xs font-bold">コメント</span>
                    </button>
                </div>
                <div className="flex space-x-1">
                    {data.tags && data.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded font-bold">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
