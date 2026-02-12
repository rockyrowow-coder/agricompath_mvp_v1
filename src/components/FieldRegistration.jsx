import React, { useState } from 'react';
import { MapPin } from 'lucide-react';

export function FieldRegistration() {
    const [name, setName] = useState('');
    const [area, setArea] = useState('');
    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const handleGetLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLoadingLocation(false);
                    alert("位置情報を取得しました！");
                },
                (error) => {
                    console.error(error);
                    alert("位置情報の取得に失敗しました。");
                    setLoadingLocation(false);
                }
            );
        } else {
            alert("このブラウザは位置情報に対応していません。");
            setLoadingLocation(false);
        }
    };

    const handleRegisterField = () => {
        if (!name) return alert("圃場名を入力してください");
        alert(`圃場「${name}」を登録しました！\n面積: ${area}a\n位置: ${location ? '取得済み' : '未取得'}`);
        // In real app, save to Supabase 'fields' table
        setName('');
        setArea('');
        setLocation(null);
    };

    return (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">圃場名</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold" placeholder="例: 本田3号" />
            </div>
            <div className="flex space-x-3">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500">面積 (a)</label>
                    <input type="number" value={area} onChange={e => setArea(e.target.value)} className="w-full p-2 rounded-lg border border-slate-200 text-sm font-bold" placeholder="10" />
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500">位置情報</label>
                    <button onClick={handleGetLocation} className={`w-full p-2 rounded-lg border text-sm font-bold flex items-center justify-center space-x-1 ${location ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white border-slate-200 text-slate-600'}`}>
                        <MapPin size={14} />
                        <span>{loadingLocation ? '取得中...' : location ? '取得済' : '現在地'}</span>
                    </button>
                </div>
            </div>
            <button onClick={handleRegisterField} className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm font-bold mt-2">
                圃場を登録
            </button>
        </div>
    );
}
