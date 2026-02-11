import React, { useState } from 'react';
import { ThumbsUp, MessageCircle, ImageIcon, Plus, Lock, Trophy, Filter, Search, MapPin, Sprout, Activity, History } from 'lucide-react';
import { RecordTypeBadge } from './Shared';

export function TimelineScreen({ isUnlocked, data, myRecords, onRecordClick }) {
    const [activeTab, setActiveTab] = useState("recommended"); // 'recommended', 'following', 'department', 'my_past'
    const [activeSubTab, setActiveSubTab] = useState("records"); // 'records', 'tweets'
    const [filterOpen, setFilterOpen] = useState(false);

    // Filter States
    const [filterRegion, setFilterRegion] = useState("all");
    const [filterCrop, setFilterCrop] = useState("all");
    const [filterType, setFilterType] = useState("all");

    // Helper to normalize myRecords to timeline format
    const normalizedMyRecords = (myRecords || []).map(r => ({
        id: `my-${r.id}`,
        type: r.type,
        user: "自分",
        isFollowed: false,
        crop: r.crop,
        date: r.date, // Format might need adjustment if not "YYYY-MM-DD"
        pesticide: r.pesticide,
        dilution: r.amount ? r.amount.replace('倍', '') : '', // rough extract
        method: "-",
        range: r.range,
        comment: r.memo || (r.type === 'work' ? r.workType : r.detail),
        tags: [],
        likes: 0,
        hasLiked: false,
        isMine: true
    }));

    const getFilteredData = (tab, subTab) => {
        let sourceData = data;

        if (tab === 'my_past') {
            sourceData = normalizedMyRecords;
        }

        return sourceData.filter(item => {
            // Main Tab Logic
            if (tab === 'department') {
                if (!item.isOfficial) return false;
            } else if (tab === 'following') {
                if (!item.isFollowed || item.isOfficial) return false;
            } else if (tab === 'recommended') {
                if (item.isFollowed || item.isOfficial || item.isMine) return false;
            } else if (tab === 'my_past') {
                if (!item.isMine) return false;
            }

            // Sub Tab Logic (except for specific logic like Department might show all)
            // Department might want to separate too, but let's apply to all for consistency
            // My Past usually shows all records
            if (tab !== 'my_past') {
                if (subTab === 'tweets' && item.type !== 'tweet') return false;
                if (subTab === 'records' && item.type === 'tweet') return false;
            }

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
    const newRecordsCount = 18; // Mock for Moriyama area

    return (
        <div className="bg-slate-50 min-h-full pb-24">
            {/* Header / Tabs */}
            <div className="sticky top-0 bg-white/95 backdrop-blur z-20 border-b border-slate-200 shadow-sm">
                <div className="flex px-2 pt-2 pb-0 space-x-1 overflow-x-auto no-scrollbar">
                    {['recommended', 'following', 'department', 'my_past'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[22%] pb-3 text-xs font-bold border-b-2 transition-colors text-center whitespace-nowrap ${activeTab === tab ? 'text-green-600 border-green-500' : 'text-slate-400 border-transparent hover:text-slate-600'}`}
                        >
                            {tab === 'recommended' ? 'おすすめ' : tab === 'following' ? 'フォロー中' : tab === 'department' ? '部会・公式' : 'MY過去'}
                        </button>
                    ))}
                </div>

                {/* Sub Tabs & Filter Bar (Hide for pure timeline view if needed, but keeping for utility) */}
                {activeTab !== 'my_past' && (
                    <div className="bg-slate-50 px-4 py-3 flex justify-between items-center border-b border-slate-100">
                        <div className="flex bg-slate-200/50 rounded-lg p-1">
                            <button onClick={() => setActiveSubTab('records')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeSubTab === 'records' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>営農記録</button>
                            <button onClick={() => setActiveSubTab('tweets')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeSubTab === 'tweets' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>つぶやき (β)</button>
                        </div>

                        <button onClick={() => setFilterOpen(!filterOpen)} className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${filterOpen ? 'bg-green-100 text-green-700' : 'bg-white border border-slate-200 text-slate-500'}`}>
                            <Filter size={12} /> <span>絞り込み</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="p-4 space-y-6">
                {/* Social Proof Banner (Only on records tab, when locked or meant to encourage) */}
                {activeSubTab === 'records' && activeTab !== 'my_past' && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-0.5 shadow-lg animate-pulse mb-6">
                        <div className="bg-white rounded-[10px] p-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-extrabold text-orange-600 flex items-center mb-1">
                                    <Activity size={14} className="mr-1 animate-bounce" />
                                    守山地域で活発に作業中！
                                </h3>
                                <p className="text-[10px] font-bold text-slate-600 leading-tight">
                                    本日、<span className="text-base text-red-500 font-extrabold mx-1">{newRecordsCount}件</span>の新しい記録が<br />共有されています。
                                </p>
                            </div>
                            {!isUnlocked && (
                                <button onClick={onRecordClick} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] px-3 py-2 rounded-lg shadow-md transition-transform active:scale-95 whitespace-nowrap">
                                    記録して<br />閲覧する
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {displayData.map((item) => (
                    <TimelineCard
                        key={item.id}
                        data={item}
                        // Lock Logic: Locked if NOT unlocked AND NOT My Past AND NOT Official
                        isLocked={!isUnlocked && activeTab !== 'my_past' && !item.isOfficial}
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
    const [likes, setLikes] = useState(data.likes || 0);

    const toggleLike = () => {
        if (liked) { setLikes(likes - 1); setLiked(false); }
        else { setLikes(likes + 1); setLiked(true); }
    };

    // Official Post (Thread style)
    if (data.isOfficial) {
        return (
            <div className="bg-white border-l-4 border-l-blue-500 border border-t-slate-200 border-r-slate-200 border-b-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center space-x-3 mb-3">
                    <div className="bg-blue-100 p-1.5 rounded-full"><MessageCircle size={16} className="text-blue-600" /></div>
                    <div>
                        <span className="bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded font-bold mr-2">重要連絡</span>
                        <span className="font-bold text-slate-800 text-sm block">{data.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 ml-auto whitespace-nowrap">{data.date}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{data.comment}</p>
                </div>
                <div className="flex items-center justify-between">
                    <button className="text-blue-600 text-[10px] font-bold hover:underline">スレッドを表示</button>
                    <button onClick={toggleLike} className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-colors ${liked ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>
                        <ThumbsUp size={14} fill={liked ? "currentColor" : "none"} /> <span className="text-[10px] font-bold">{likes}</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-md">
            {/* Header: Always visible to induce FOMO */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 border border-slate-200 shadow-sm">
                        {data.user.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center">
                            <p className="text-sm font-bold text-slate-800 mr-2">{data.user}</p>
                            {/* If locked, maybe hide user name? No, user usually wants to know WHO is active */}
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold flex items-center mt-0.5">
                            <Sprout size={10} className="mr-1" /> {data.crop}
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
                        <div className="filter blur-md p-4 space-y-3 opacity-60 select-none pointer-events-none">
                            <div className="h-4 w-3/4 bg-slate-400 rounded"></div>
                            <div className="h-16 w-full bg-slate-300 rounded"></div>
                            <div className="flex space-x-2">
                                <div className="h-6 w-12 bg-slate-300 rounded-full"></div>
                                <div className="h-6 w-12 bg-slate-300 rounded-full"></div>
                            </div>
                        </div>

                        {/* Lock Overlay */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 backdrop-blur-sm p-4 text-center">
                            <div className="bg-slate-800 text-white p-2 rounded-full mb-2 shadow-lg animate-bounce">
                                <Lock size={20} />
                            </div>
                            <h4 className="text-sm font-extrabold text-slate-800 shadow-sm mb-1 bg-white/80 px-2 rounded">詳細はロック中</h4>
                            <p className="text-[10px] font-bold text-slate-600 bg-white/90 px-3 py-1 rounded-full backdrop-blur shadow-sm">
                                {data.type === 'pesticide' ? '使用した農薬・希釈倍率' : '作業の詳細メモ'} を見るには<br />1週間以内の記録が必要です
                            </p>
                        </div>
                    </div>
                ) : (
                    // Unlocked Content
                    <>
                        {data.type === 'pesticide' ? (
                            <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 mb-3 shadow-sm">
                                <div className="flex justify-between items-center border-b border-slate-200 pb-2 border-dashed">
                                    <span className="text-[10px] font-bold text-slate-500">使用薬剤</span>
                                    <span className="text-sm font-extrabold text-slate-800">{data.pesticide}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] text-slate-400 block mb-0.5">希釈倍率</span>
                                        <span className="text-xs font-bold text-slate-700">{data.dilution || '規定量'}{data.dilution && !data.dilution.includes('倍') && '倍'}</span>
                                    </div>
                                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                                        <span className="text-[10px] text-slate-400 block mb-0.5">散布範囲</span>
                                        <span className="text-xs font-bold text-slate-700">{data.range}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (data.type !== 'tweet' &&
                            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 shadow-sm">
                                <h4 className="text-sm font-extrabold text-slate-800 mb-1">{data.title || data.detail}</h4>
                                {data.amount && <p className="text-[10px] text-slate-500 font-bold">使用量: {data.amount}</p>}
                            </div>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed mb-3 p-2 bg-slate-50/50 rounded-lg whitespace-pre-wrap font-medium">
                            {data.comment || "コメントなし"}
                        </p>

                        {data.hasImage && (
                            <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 h-40 bg-slate-100 flex items-center justify-center relative group cursor-pointer">
                                <ImageIcon size={24} className="text-slate-400" />
                                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded">2枚</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-1">
                <div className="flex space-x-3">
                    <button onClick={toggleLike} className={`flex items-center space-x-1 px-3 py-1.5 rounded-full transition-all active:scale-95 ${liked ? 'text-green-600 bg-green-50 ring-1 ring-green-100' : 'text-slate-500 hover:bg-slate-50'}`}>
                        <ThumbsUp size={14} fill={liked ? "currentColor" : "none"} className={liked ? "animate-bounce" : ""} />
                        <span className="text-[10px] font-bold">{likes}</span>
                    </button>
                    {!data.isMine && (
                        <button className="flex items-center space-x-1 px-3 py-1.5 rounded-full text-slate-500 hover:bg-slate-50 transition-colors">
                            <MessageCircle size={14} /> <span className="text-[10px] font-bold">コメント</span>
                        </button>
                    )}
                </div>
                <div className="flex space-x-1">
                    {data.tags && data.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-bold">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
