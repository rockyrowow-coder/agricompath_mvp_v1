import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

export function MapSelector({ fieldName }) {
    if (!fieldName) return null;

    return (
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2 flex items-center space-x-2">
            <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <MapPin size={18} />
            </div>
            <div>
                <p className="text-xs font-bold text-slate-500">位置情報 (デモ)</p>
                <p className="font-bold text-slate-800 text-sm">{fieldName} 付近</p>
            </div>
        </div>
    );
}
