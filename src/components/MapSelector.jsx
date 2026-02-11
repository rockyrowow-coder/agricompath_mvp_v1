import React from 'react';
import { MapPin, Check } from 'lucide-react';

export function MapSelector({ fields, selectedField, selectedRange, onSelect }) {
    // Mock visual layout for fields
    // In a real app, this might be an SVG map or Google Maps integration
    // Here we use a grid representation

    const handleFieldClick = (field) => {
        // Default to '全面' when switching fields
        onSelect(field, '全面');
    };

    const handleRangeSelect = (range) => {
        onSelect(selectedField, range);
    };

    return (
        <div className="space-y-4">
            <div className={`bg-slate-100 p-4 rounded-xl border border-slate-200 transition-all ${selectedField ? 'bg-white' : ''}`}>
                <p className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">圃場を選択</p>
                <div className="grid grid-cols-2 gap-3">
                    {fields.map((field) => (
                        <button
                            key={field}
                            onClick={() => handleFieldClick(field)}
                            className={`relative h-20 rounded-xl border-2 transition-all flex flex-col items-center justify-center p-2 ${selectedField === field
                                ? 'bg-green-100 border-green-500 text-green-700 shadow-md transform scale-[1.02]'
                                : 'bg-white border-slate-200 text-slate-500 hover:border-green-300'
                                }`}
                        >
                            <MapPin size={20} className={`mb-1 ${selectedField === field ? 'text-green-600' : 'text-slate-300'}`} />
                            <span className="text-sm font-bold">{field}</span>
                            {selectedField === field && (
                                <div className="absolute top-2 right-2">
                                    <Check size={16} className="text-green-600" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {selectedField && (
                <div className="bg-white p-4 rounded-xl border border-slate-200 animate-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-slate-500 mb-3 text-center">実施範囲を選択 ({selectedField})</p>

                    {/* Granular Selection Grid */}
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
                        <div className="grid grid-cols-4 gap-2 mb-2">
                            {['A区画', 'B区画', 'C区画', 'D区画'].map(zone => (
                                <button key={zone} onClick={() => handleRangeSelect(zone)} className={`h-12 rounded border-2 text-[10px] font-bold transition-all ${selectedRange === zone ? 'bg-green-500 text-white border-green-600' : 'bg-white text-slate-400 border-slate-200'}`}>{zone}</button>
                            ))}
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                            {[...Array(12)].map((_, i) => (
                                <button key={`row-${i + 1}`} onClick={() => handleRangeSelect(`${i + 1}列目`)} className={`h-8 rounded border text-[9px] font-bold transition-all ${selectedRange === `${i + 1}列目` ? 'bg-green-500 text-white border-green-600' : 'bg-white text-slate-300 border-slate-100'}`}>
                                    {i + 1}列
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-2 border-t border-slate-100 pt-3">
                        {['全面', '外周', 'スポット'].map((range) => (
                            <button
                                key={range}
                                onClick={() => handleRangeSelect(range)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors ${selectedRange === range
                                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
