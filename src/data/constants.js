export const MOCK_CROPS = ["水稲", "きゅうり", "トマト", "なす", "いちご"];
export const MOCK_FIELDS = ["本田1号", "本田2号", "裏の畑", "ビニールハウスA"];
export const MOCK_WORKERS = ["山田太郎(自分)", "山田花子", "実習生A"];
export const MOCK_PESTICIDES = [
    { id: 1, name: "スタークル粒剤", category: "殺虫剤" },
    { id: 2, name: "コラトップ粒剤", category: "殺菌剤" },
    { id: 3, name: "ラウンドアップ", category: "除草剤" },
    { id: 4, name: "アミスター20フロアブル", category: "殺菌剤" },
];
export const MOCK_METHODS = ["動噴(手撒き)", "ブームスプレーヤー", "ドローン", "粒剤散布機", "無人ヘリ"];
export const MOCK_TARGETS = ["カメムシ類", "いもち病", "雑草", "うどんこ病", "予防散布", "その他"];

export const INITIAL_TIMELINE = [
    {
        id: 101,
        type: 'pesticide',
        user: "浅井農園",
        isFollowed: true,
        crop: "きゅうり",
        date: "今日 08:30",
        pesticide: "アミスター20フロアブル",
        dilution: "2000倍",
        mix: ["展着剤スカッシュ", "液肥メリット青"],
        method: "動噴",
        range: "全面",
        duration: "60分",
        comment: "うどんこ病予防。雨前なので展着剤強めで。",
        tags: ["#予防", "#雨前"],
        hasImage: true,
        likes: 12,
        hasLiked: false
    },
    {
        id: 102,
        type: 'tweet',
        user: "鈴木 健太",
        isFollowed: false,
        crop: "水稲",
        date: "今日 07:15",
        title: "朝の見回り",
        comment: "本田2号、水漏れ発見。今のうちに直しておきます。",
        tags: ["#水管理", "#つぶやき"],
        hasImage: true,
        likes: 5,
        hasLiked: true
    },
    {
        id: 103,
        type: 'official',
        user: "JA指導課",
        isFollowed: true,
        crop: "全般",
        date: "昨日 10:00",
        title: "【重要】ハスモンヨトウ警報",
        isOfficial: true,
        comment: "現在、管内でハスモンヨトウの被害が増加傾向です。早期発見に努めてください。",
        tags: ["#注意喚起", "#警報"],
        likes: 45,
        hasLiked: false
    }
];

export const INITIAL_MY_RECORDS = [
    { id: 1, date: "2023-06-01", type: "pesticide", crop: "水稲", detail: "コラトップ粒剤", amount: "10kg", field: "本田1号", status: "done", timeStart: "08:00", timeEnd: "09:30", range: "全面" },
    { id: 2, date: "2023-06-05", type: "work", crop: "きゅうり", detail: "誘引作業", amount: "3時間", field: "ビニールハウスA", status: "done", timeStart: "13:00", timeEnd: "16:00", range: "南側半分" },
    { id: 3, date: "2023-06-10", type: "fertilizer", crop: "トマト", detail: "有機配合肥料", amount: "20kg", field: "裏の畑", status: "done", timeStart: "06:00", timeEnd: "07:00", range: "全面" },
];

export const INITIAL_REVIEW_REQUESTS = [
    { id: 1, type: "request", date: "2023-06-01", pesticide: "コラトップ粒剤", crop: "水稲", question: "いもち病への効果はどうでしたか？", requester: "JA指導課", points: 50 },
    { id: 2, type: "request", date: "2023-06-10", pesticide: "有機配合肥料", crop: "トマト", question: "玉伸びへの影響は見られましたか？", requester: "メーカー開発部", points: 100 },
];

export const MOCK_THREADS = [
    { id: 1, author: "部会長", title: "来週の用水路清掃について", date: "昨日", content: "集合時間は8:00です。各自道具を持参してください。", replies: 5 },
    { id: 2, author: "青年部リーダー", title: "ドローン勉強会の参加者募集", date: "2日前", content: "7月に予定している勉強会ですが、参加希望者は...", replies: 12 },
];

export const WORK_TYPES = {
    "きゅうり": ["誘引", "玉磨き", "摘心", "葉かき", "収穫", "灌水", "消毒"],
    "トマト": ["芽かき", "誘引", "ホルモン処理", "葉かき", "収穫"],
    "水稲": ["耕起", "代掻き", "田植え", "中干し", "草刈り", "水管理", "稲刈り"],
    "なす": ["整枝", "誘引", "更新剪定", "収穫"],
    "いちご": ["ランナー切り", "葉かき", "収穫", "パック詰め"]
};

export const INITIAL_INVENTORY = [
    { id: 1, name: "スタークル粒剤", category: "農薬", quantity: 5, unit: "袋(3kg)" },
    { id: 2, name: "コラトップ粒剤", category: "農薬", quantity: 12, unit: "袋(3kg)" },
    { id: 3, name: "ラウンドアップ", category: "除草剤", quantity: 3, unit: "本(5L)" },
    { id: 4, name: "アミスター20フロアブル", category: "農薬", quantity: 8, unit: "本(500ml)" },
    { id: 5, name: "有機配合肥料", category: "肥料", quantity: 40, unit: "袋(20kg)" },
    { id: 6, name: "液肥メリット青", category: "液肥", quantity: 5, unit: "本(1kg)" },
    { id: 7, name: "展着剤スカッシュ", category: "展着剤", quantity: 10, unit: "本(500ml)" }
];

export const SPREADING_METHODS = ["動噴(手撒き)", "ブームスプレーヤー", "ドローン", "粒剤散布機", "無人ヘリ", "灌水チューブ", "スポット散布"];

export const USER_CROPS = ["きゅうり", "トマト", "水稲", "なす", "いちご", "ピーマン", "ネギ"];

export const MOCK_AI_TAGS = ["#病害虫予察", "#コスト削減", "#収量アップ", "#省力化", "#土壌改善", "#高温対策"];
