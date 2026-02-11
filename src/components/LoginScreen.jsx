import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sprout } from 'lucide-react';

export function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isSignUp) {
                const { error } = await signUp({ email, password });
                if (error) throw error;
                alert('登録確認メールを送信しました！');
            } else {
                const { error } = await signIn({ email, password });
                if (error) throw error;
                navigate('/');
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center p-6">
            <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-200">
                        <Sprout size={32} className="text-white" />
                    </div>
                </div>
                <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-2">Agri Compath</h2>
                <p className="text-sm text-center text-slate-400 font-bold mb-8">{isSignUp ? 'アカウント作成' : 'ログイン'}</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">メールアドレス</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 ml-1">パスワード</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 focus:ring-2 focus:ring-green-100 focus:border-green-500 outline-none"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transition-transform active:scale-95 mt-4"
                    >
                        {loading ? '処理中...' : (isSignUp ? '登録して始める' : 'ログイン')}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-xs font-bold text-slate-400 hover:text-green-600 transition-colors"
                    >
                        {isSignUp ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントをお持ちでない方はこちら'}
                    </button>
                </div>
            </div>
        </div>
    );
}
