
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';

interface DiagnosisRecord {
    id: string;
    query: string;
    response: string;
    grounding_metadata: any;
    created_at: string;
}

const DiagnosisHistory = () => {
    const [history, setHistory] = useState<DiagnosisRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setError("Debes iniciar sesión para ver tu historial.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('diagnosis_history')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setHistory(data || []);
        } catch (err: any) {
            setError(err.message || 'Error al cargar el historial.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-100">
            <header className="flex items-center justify-between glass-panel px-8 py-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Historial</h2>
                </div>
                <Link className="px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-500" to="/">Volver</Link>
            </header>

            <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-500">Cargando historial...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">lock</span>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">{error}</h3>
                        <Link to="/login" className="text-primary hover:underline font-bold">Iniciar Sesión</Link>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700">
                        <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">history_edu</span>
                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">No hay diagnósticos guardados</h3>
                        <p className="text-slate-500 mb-6">Realiza un diagnóstico con IA para verlo aquí.</p>
                        <Link to="/diagnosis" className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all">
                            Nuevo Diagnóstico
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {history.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                            <span className="material-symbols-outlined">smart_toy</span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{formatDate(item.created_at)}</p>
                                            <h3 className="font-bold text-lg leading-tight mt-0.5 max-w-2xl text-slate-800 dark:text-white">{item.query}</h3>
                                        </div>
                                    </div>
                                </div>

                                <div className="pl-13 ml-13 border-l-2 border-slate-100 dark:border-slate-700 pl-4 py-2">
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap line-clamp-4 hover:line-clamp-none transition-all cursor-pointer">
                                        {item.response}
                                    </p>
                                </div>

                                <div className="mt-4 flex gap-2 justify-end">
                                    <button className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
                                        Ver Completo
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default DiagnosisHistory;
