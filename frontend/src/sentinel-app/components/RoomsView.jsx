import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { GlassCard } from '@/components/ui/glass-card';
import { Users, Plus, Shield, ArrowRight, Tag } from 'lucide-react';

const API_BASE = "/api/v1/rooms";

const RoomsView = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRoomName, setNewRoomName] = useState("");

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const resp = await axios.get(`${API_BASE}/list`);
            setRooms(resp.data);
        } catch (err) {
            console.error("Failed to fetch rooms:", err);
            // Dynamic fallback for demo
            setRooms([
                { id: 1, name: "Intro to AI Security", shared_token: "room_a1b2c3", created_by: 1 },
                { id: 2, name: "Advanced LLM Prompting", shared_token: "room_f5g6h7", created_by: 1 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async () => {
        if (!newRoomName) return;
        try {
            await axios.post(`${API_BASE}/create`, {
                name: newRoomName,
                syllabus_id: 1,
                user_id: 1
            });
            setNewRoomName("");
            fetchRooms();
        } catch (err) {
            console.error("Failed to create room:", err);
        }
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto h-full pb-10 animate-fade-in">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tighter uppercase italic">Syllabus Rooms</h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Multi-Tenant Knowledge Isolation</p>
                </div>
                <div className="flex items-center gap-3">
                    <input 
                        type="text" 
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder="New Room Name..."
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                    />
                    <button 
                        onClick={handleCreateRoom}
                        className="bg-primary text-black px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    >
                        <Plus size={16} /> Create
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms.map((room) => (
                    <GlassCard key={room.id} className="p-6 border-white/5 hover:border-primary/20 transition-all group">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-3 rounded-2xl bg-primary/5 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all">
                                <Users size={20} />
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                                <Tag size={10} className="text-slate-400" />
                                <span className="text-[10px] font-mono font-bold text-slate-300 uppercase">{room.shared_token}</span>
                            </div>
                        </div>
                        
                        <h4 className="text-white font-bold text-lg mb-2">{room.name}</h4>
                        <p className="text-slate-500 text-xs leading-relaxed mb-6">
                            Isolated vector space for {room.name}. Contributors can join using the shared token.
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-green-500" />
                                <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Active</span>
                            </div>
                            <button className="text-primary flex items-center gap-1 text-[10px] font-black uppercase tracking-widest hover:gap-2 transition-all">
                                Enter Room <ArrowRight size={12} />
                            </button>
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
};

export default RoomsView;
