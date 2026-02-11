export const MOCK_CROPS = ["アールス(守山)", "マリア(守山)", "水稲(コシヒカリ)", "水稲(キヌヒカリ)"];
export const MOCK_FIELDS = ["本田1号(メロン)", "本田2号(メロン)", "育苗ハウス", "水田A", "水田B"];
export const MOCK_WORKERS = ["自分", "奥さん", "パートさん"];

// Moriyama Melon Specific Pesticides/Fertilizers
export const MOCK_PESTICIDES = [
    { id: 1, name: "ダコニール1000", category: "殺菌剤" },
    { id: 2, name: "スコア顆粒水和剤", category: "殺菌剤" },
    { id: 3, name: "アミスター20フロアブル", category: "殺菌剤" },
    { id: 4, name: "ベルクート水和剤", category: "殺菌剤" },
    { id: 5, name: "スタークル粒剤", category: "殺虫剤" },
    { id: 6, name: "アファーム乳剤", category: "殺虫剤" },
    { id: 7, name: "コテツフロアブル", category: "殺虫剤" },
    { id: 8, name: "ラウンドアップ", category: "除草剤" },
];

export const MOCK_METHODS = ["動噴(手撒き)", "ブームスプレーヤー", "ダクト散布", "ドローン", "粒剤散布機"];
export const MOCK_TARGETS = ["つる枯病", "うどんこ病", "べと病", "アブラムシ類", "ハダニ類", "予防散布", "その他"];

// Timeline Data (Updated for Moriyama Context)
export const INITIAL_TIMELINE = [
    {
        id: 101,
        type: 'pesticide',
        user: "田中農園(守山)",
        isFollowed: true,
        crop: "アールス(守山)",
        date: "今日 08:30",
        pesticide: "ダコニール1000",
        dilution: "1000倍",
        mix: ["展着剤スカッシュ"],
        method: "動噴",
        range: "全ハウス",
        duration: "90分",
        comment: "雨前の予防散布。つる枯れ注意。",
        tags: ["#予防", "#つる枯病"],
        hasImage: true,
        likes: 24,
        hasLiked: false
    },
    {
        id: 102,
        type: 'work',
        user: "鈴木 健太",
        isFollowed: false,
        crop: "水稲(コシヒカリ)",
        date: "今日 07:15",
        title: "水管理",
        comment: "中干し開始。溝切りも完了。",
        tags: ["#中干し", "#水管理"],
        hasImage: false,
        likes: 8,
        hasLiked: true
    },
    {
        id: 103,
        type: 'official',
        user: "JAレーク滋賀",
        isFollowed: true,
        crop: "全般",
        date: "昨日 10:00",
        title: "【重要】アザミウマ警報",
        isOfficial: true,
        comment: "守山管内でアザミウマ類の発生が増加しています。ハウス周辺の除草と早期防除を徹底してください。",
        tags: ["#注意喚起", "#警報"],
        likes: 56,
        hasLiked: false
    }
];

// My Records incl. "1 Year Ago" candidates
export const INITIAL_MY_RECORDS = [
    // Today/Recent
    { id: 1, date: "2024-06-15", type: "work", crop: "アールス(守山)", detail: "玉磨き", amount: "2時間", field: "本田1号", status: "done", timeStart: "10:00", timeEnd: "12:00", range: "全量" },

    // 1 Year Ago (Mock for Demo - assuming current date is ~June 2024 in demo context, or generic lookback)
    // We will dynamic check in App.jsx, but here is static data representing "Last Year"
    { id: 901, date: "2023-06-12", type: "pesticide", crop: "アールス(守山)", detail: "アミスター20フロアブル", amount: "2000倍", field: "本田1号", status: "done", timeStart: "08:00", timeEnd: "09:00", range: "全面", memo: "うどんこ病が出始めたので早めに。" },
    { id: 902, date: "2023-06-10", type: "work", crop: "水稲(コシヒカリ)", detail: "中干し開始", amount: "-", field: "水田A", status: "done", timeStart: "08:00", timeEnd: "08:30", range: "-", memo: "昨年より2日早い。" },
];

export const INITIAL_REVIEW_REQUESTS = [
    { id: 1, type: "request", date: "2024-06-01", pesticide: "ベルクート水和剤", crop: "アールス(守山)", question: "薬害の発生はありませんでしたか？", requester: "JAレーク滋賀", points: 50 },
];

export const MOCK_THREADS = [
    { id: 1, author: "部会長", title: "出荷目揃え会について", date: "昨日", content: "明日の目揃え会は13:00からです。サンプルを持参してください。", replies: 15 },
    { id: 2, author: "青年部", title: "スマート農業実演会", date: "2日前", content: "自動操舵トラクターの実演会を行います...", replies: 8 },
];

export const WORK_TYPES = {
    "アールス(守山)": ["定植", "整枝", "交配", "摘果", "玉磨き", "防除", "灌水", "収穫"],
    "マリア(守山)": ["定植", "整枝", "交配", "摘果", "玉磨き", "防除", "灌水", "収穫"],
    "水稲(コシヒカリ)": ["耕起", "代掻き", "田植え", "中干し", "草刈り", "水管理", "稲刈り"],
    "水稲(キヌヒカリ)": ["耕起", "代掻き", "田植え", "中干し", "草刈り", "水管理", "稲刈り"],
};

export const INITIAL_INVENTORY = [
    { id: 1, name: "ダコニール1000", category: "農薬", quantity: 3, unit: "本(500ml)" },
    { id: 2, name: "スコア顆粒水和剤", category: "農薬", quantity: 5, unit: "袋(250g)" },
    { id: 3, name: "キングスター", category: "肥料", quantity: 20, unit: "袋(20kg)" },
    { id: 4, name: "液肥メリット", category: "液肥", quantity: 2, unit: "本(20kg)" },
];

export const SPREADING_METHODS = ["動噴(手撒き)", "ブームスプレーヤー", "ダクト散布", "ドローン", "粒剤散布機"];

export const USER_CROPS = ["アールス(守山)", "マリア(守山)", "水稲(コシヒカリ)"];

export const MOCK_AI_TAGS = ["#つる枯病予察", "#糖度アップ", "#日持ち向上", "#省力化", "#秀品率向上"];


// --- ARCHITECTURE REFACTOR: New Admin Mock Data ---

export const MOCK_ADMIN_STATS = {
    pestControlRate: 78, // %
    alertLevel: 'active', // 'normal', 'warning', 'active'
    alertRegion: '守山東部',
    alertTarget: 'アザミウマ'
};

export const MOCK_MEMBERS = [
    { id: 101, name: "田中 義雄", region: "西部", lastSubmission: "昨日", status: "ok" },
    { id: 102, name: "佐藤 健一", region: "西部", lastSubmission: "2日前", status: "ok" },
    { id: 103, name: "山本 浩二", region: "東部", lastSubmission: "5日前", status: "warning" },
    { id: 104, name: "鈴木 大介", region: "東部", lastSubmission: "10日前", status: "alert" },
    { id: 105, name: "高橋 誠流", region: "北部", lastSubmission: "昨日", status: "ok" },
];

export const MOCK_GROUPS = [
    { id: 'all', name: '全生産者' },
    { id: 'east', name: '東部エリア' },
    { id: 'west', name: '西部エリア' },
    { id: 'melon', name: 'メロン部会' },
    { id: 'rice', name: '水稲部会' },
];

// --- Phase 5: JA Lake Shiga & Safety ---

export const JA_DOMAIN = 'lakeshiga.jas.or.jp';

// Extensive Pesticid List (Mocking a real DB)
export const MOCK_PESTICIDES_EXTENDED = [
    { id: 1, name: "ダコニール1000", category: "殺菌剤", target: "広範囲" },
    { id: 2, name: "スコア顆粒水和剤", category: "殺菌剤", target: "うどんこ病" },
    { id: 3, name: "アミスター20フロアブル", category: "殺菌剤", target: "べと病・炭疽病" },
    { id: 4, name: "ベルクート水和剤", category: "殺菌剤", target: "つる枯病" },
    { id: 5, name: "スタークル粒剤", category: "殺虫剤", target: "アブラムシ" },
    { id: 6, name: "アファーム乳剤", category: "殺虫剤", target: "オオタバコガ" },
    { id: 7, name: "コテツフロアブル", category: "殺虫剤", target: "ダニ・アザミウマ" },
    { id: 8, name: "モスピラン水溶剤", category: "殺虫剤", target: "アブラムシ" },
    { id: 9, name: "ロブラール水和剤", category: "殺菌剤", target: "灰星病" },
    { id: 10, name: "トップジンM水和剤", category: "殺菌剤", target: "炭疽病" },
    { id: 11, name: "DDVP乳剤", category: "殺虫剤", target: "アブラムシ" },
    { id: 12, name: "マッチ乳剤", category: "殺虫剤", target: "ヨトウムシ" },
    { id: 13, name: "ラウンドアップ", category: "除草剤", target: "雑草" },
    { id: 14, name: "バスタ液剤", category: "除草剤", target: "雑草" },
];

// Mixing Rules: Key is a pesticide name, Value is list of incompatible names
export const INCOMPATIBLE_MIXES = {
    "ダコニール1000": ["アミスター20フロアブル", "ボルドー液"], // Example incompatibilities (Mock)
    "アミスター20フロアブル": ["ダコニール1000"],
    "ベルクート水和剤": ["石灰硫黄合剤"],
    "アファーム乳剤": ["ボルドー液"]
};
