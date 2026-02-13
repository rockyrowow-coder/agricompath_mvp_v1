import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Save, MapPin, Eraser, Layers, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Fix Leaflet Default Icon in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export function FieldMapScreen() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [fields, setFields] = useState([]);
    const [mode, setMode] = useState('view'); // view, draw, marker
    const [drawPoints, setDrawPoints] = useState([]);
    const [center, setCenter] = useState([35.1, 136.0]); // Default to Shiga approx
    const [loading, setLoading] = useState(false);

    // Fetch Fields
    useEffect(() => {
        const fetchFields = async () => {
            if (!user) return;
            const { data } = await supabase.from('fields').select('*');
            if (data) setFields(data);
        };
        fetchFields();
    }, [user]);

    // Save Field (Polygon)
    const handleSaveField = async () => {
        if (drawPoints.length < 3) return alert("3点以上指定してください");
        const name = prompt("圃場名を入力してください");
        if (!name) return;

        setLoading(true);
        const { data, error } = await supabase.from('fields').insert({
            user_id: user.id,
            name: name,
            type: 'field',
            polygon: drawPoints, // Storing as JSON
            area: calculateArea(drawPoints) + 'a' // Mock area calc
        }).select();

        if (error) {
            alert("保存エラー: " + error.message);
        } else {
            setFields([...fields, data[0]]);
            setDrawPoints([]);
            setMode('view');
        }
        setLoading(false);
    };

    // Calculate approx area in ares (mock)
    const calculateArea = (points) => {
        // Very rough "number of points" based estimation for demo
        return (points.length * 1.5).toFixed(1);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-start pointer-events-none">
                <button onClick={() => navigate(-1)} className="bg-white p-3 rounded-full shadow-lg pointer-events-auto hover:bg-slate-100">
                    <ArrowLeft size={24} className="text-slate-700" />
                </button>

                <div className="flex flex-col space-y-2 pointer-events-auto">
                    <div className="bg-white/90 backdrop-blur rounded-2xl p-2 shadow-lg flex space-x-1">
                        <button
                            onClick={() => setMode('view')}
                            className={`p-3 rounded-xl transition-colors ${mode === 'view' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Layers size={20} />
                        </button>
                        <button
                            onClick={() => setMode('draw')}
                            className={`p-3 rounded-xl transition-colors ${mode === 'draw' ? 'bg-green-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {mode === 'draw' && (
                        <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg animate-in slide-in-from-right-5 space-y-3">
                            <p className="text-xs font-bold text-slate-500">圃場登録モード</p>
                            <div className="flex space-x-2">
                                <button onClick={() => setDrawPoints([])} className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                    <Trash2 size={20} />
                                </button>
                                <button onClick={() => setDrawPoints(prev => prev.slice(0, -1))} className="p-2 bg-slate-100 rounded-lg text-slate-600">
                                    <Eraser size={20} />
                                </button>
                                <button onClick={handleSaveField} disabled={drawPoints.length < 3} className="flex-1 bg-green-600 disabled:bg-slate-300 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
                                    <Save size={18} />
                                    <span>保存</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold text-right">{drawPoints.length}点選択中</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="flex-1 z-0">
                <MapContainer center={center} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                    {/* Satellite Layer */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.google.com/intl/ja_jp/help/terms_maps.html">Google</a>'
                        url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    />

                    {/* Controls */}
                    <ZoomToLocation onLocationFound={pos => setCenter(pos)} />
                    <MapEvents mode={mode} onMapClick={e => {
                        if (mode === 'draw') {
                            setDrawPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
                        }
                    }} />

                    {/* Existing Fields */}
                    {fields.map(field => field.polygon && (
                        <Polygon
                            key={field.id}
                            positions={field.polygon}
                            pathOptions={{ color: 'white', weight: 2, fillOpacity: 0.2, dashArray: '5, 5' }}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-bold text-slate-800">{field.name}</h3>
                                    <p className="text-xs text-slate-500">{field.area}</p>
                                </div>
                            </Popup>
                        </Polygon>
                    ))}

                    {/* Drawing Polygon */}
                    {drawPoints.length > 0 && (
                        <>
                            <Polygon positions={drawPoints} pathOptions={{ color: '#22c55e', weight: 3, fillOpacity: 0.4 }} />
                            {drawPoints.map((p, i) => (
                                <Marker key={i} position={p} />
                            ))}
                        </>
                    )}

                    {/* Current Location Marker */}
                    <LocationMarker />
                </MapContainer>
            </div>
        </div>
    );
}

// Sub-components for Map Logic

function MapEvents({ mode, onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick(e);
        },
    });
    return null;
}

function LocationMarker() {
    const [position, setPosition] = useState(null);
    const map = useMap();

    useEffect(() => {
        map.locate().on("locationfound", function (e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        });
    }, [map]);

    return position === null ? null : (
        <Marker position={position}>
            <Popup>現在地</Popup>
        </Marker>
    );
}

function ZoomToLocation({ onLocationFound }) {
    // Only verify location once on mount
    const map = useMap();
    useEffect(() => {
        // Mock location for demo if geolocation fails or just to center on Shiga
        // map.flyTo([35.1, 136.0], 14);
    }, [map]);
    return null;
}
