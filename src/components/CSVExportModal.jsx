import React, { useState } from 'react';
import { X, CheckCircle2, Download } from 'lucide-react';

export function CSVExportModal({ onClose, records }) {
    const [selectedIds, setSelectedIds] = useState(records ? records.map(r => r.id) : []);

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const toggleAll = () => {
        if (selectedIds.length === records.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(records.map(r => r.id));
        }
    };

    const handleExport = () => {
        // Filter for JA Report (Pesticide & Fertilizer only)
        const dataToExport = records
            .filter(r => selectedIds.includes(r.id))
            .filter(r => r.type === 'pesticide' || r.type === 'fertilizer');

        if (dataToExport.length === 0) {
            alert("防除・施肥記録が選択されていません。");
            return;
        }

        const safe = (val) => {
            if (val === null || val === undefined) return "";
            const str = String(val);
            return str.includes(",") ? `"${str}"` : str;
        };

        // Define headers for the CSV
        const headers = ["日付", "圃場名", "作物", "資材名", "希釈倍率", "使用量", "散布方法"];

        // Map data to CSV rows
        const csvRows = dataToExport.map(r => {
            return [
                safe(r.date),
                safe(r.field),
                safe(r.crop),
                safe(r.pesticide || r.detail), // Pesticide name or Fertilizer name
                safe(r.dilution ? `${r.dilution}倍` : '-'),
                safe(r.amount),
                safe(r.method || '-')
            ].join(",");
        });

        const csvContent = [headers.join(","), ...csvRows].join("\n");

        // Download with BOM for Excel compatibility
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `JA_cultivation_report_${new Date().toISOString().slice(0, 10)}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center animate-in fade-in p-6">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">CSVデータ出力</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1">出力するデータを選択してください</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
                </div>

                <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center sticky top-0 z-10">
                    <button onClick={toggleAll} className="text-sm font-bold text-green-600 hover:text-green-700">
                        {selectedIds.length === records.length ? '全解除' : '全選択'}
                    </button>
                    <span className="text-sm font-bold text-slate-500">{selectedIds.length}件 選択中</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
                    {records && records.map(record => (
                        <div key={record.id} onClick={() => toggleSelect(record.id)} className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${selectedIds.includes(record.id) ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
                            <div className="flex items-center space-x-3">
                                <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${selectedIds.includes(record.id) ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                                    {selectedIds.includes(record.id) && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs font-mono font-bold text-slate-400">{record.date}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${record.type === 'pesticide' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>{record.type === 'pesticide' ? '防除' : record.type === 'fertilizer' ? '施肥' : '作業'}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-700 mt-0.5">{record.detail}</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{record.amount}</span>
                        </div>
                    ))}
                </div>

                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl">
                    <button onClick={handleExport} disabled={selectedIds.length === 0} className="w-full flex items-center justify-center space-x-2 bg-green-600 disabled:bg-slate-300 text-white hover:bg-green-500 py-3.5 rounded-xl font-bold shadow-lg shadow-green-100 transition-transform active:scale-95">
                        <Download size={20} />
                        <span>選択した{selectedIds.length}件を出力</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
