import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sprout } from 'lucide-react';
import { JA_DOMAIN } from '../data/constants';

export function LoginScreen() {
    const [loginMode, setLoginMode] = useState('farmer'); // 'farmer' or 'admin'
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
            // Domain Restriction Logic for Admin
            let emailToUse = email;
            if (loginMode === 'admin') {
                if (!email.includes('@')) {
                    emailToUse = `${email}@${JA_DOMAIN}`;
                } else if (!email.endsWith(`@${JA_DOMAIN}`)) {
                    throw new Error(`管理者ログインは @${JA_DOMAIN} のメールアドレスのみ有効です`);
                }
            }

            if (isSignUp) {
                const { error } = await signUp({ email: emailToUse, password });
                if (error) throw error;
                alert('登録確認メールを送信しました！');
            } else {
                const { error } = await signIn({ email: emailToUse, password });
                if (error) throw error;

                // Persist Role
                localStorage.setItem('agri_user_role', loginMode);
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
            <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Mode Tabs */}
                <div className="flex border-b border-slate-100">
                    <button
                        onClick={() => setLoginMode('farmer')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${loginMode === 'farmer' ? 'bg-green-50 text-green-600 border-b-2 border-green-500' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        生産者ログイン
                    </button>
                    <button
                        onClick={() => setLoginMode('admin')}
                        className={`flex-1 py-4 text-sm font-bold transition-colors ${loginMode === 'admin' ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        管理者ログイン
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-tr flex items-center justify-center shadow-lg ${loginMode === 'farmer' ? 'from-green-400 to-green-600 shadow-green-200' : 'from-blue-400 to-blue-600 shadow-blue-200'}`}>
                            <Sprout size={32} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-extrabold text-center text-slate-800 mb-2">Agri Compath</h2>
                    <p className="text-sm text-center text-slate-400 font-bold mb-8">
                        {isSignUp ? 'アカウント作成' : (loginMode === 'farmer' ? '生産者としてログイン' : 'JA・指導員としてログイン')}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 ml-1">
                                {loginMode === 'farmer' ? 'JA組合員番号 (またはメールアドレス)' : '管理者ID (またはメールアドレス)'}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 focus:ring-2 outline-none ${loginMode === 'farmer' ? 'focus:ring-green-100 focus:border-green-500' : 'focus:ring-blue-100 focus:border-blue-500'}`}
                                placeholder={loginMode === 'farmer' ? '12345678' : 'admin.user'}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 ml-1">パスワード</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-4 font-bold text-slate-800 focus:ring-2 outline-none ${loginMode === 'farmer' ? 'focus:ring-green-100 focus:border-green-500' : 'focus:ring-blue-100 focus:border-blue-500'}`}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 mt-4 ${loginMode === 'farmer' ? 'bg-green-600 hover:bg-green-500 shadow-green-100' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-100'}`}
                        >
                            {loading ? '処理中...' : (isSignUp ? '登録して始める' : 'ログイン')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className={`text-xs font-bold transition-colors ${loginMode === 'farmer' ? 'text-slate-400 hover:text-green-600' : 'text-slate-400 hover:text-blue-600'}`}
                        >
                            {isSignUp ? 'すでにアカウントをお持ちの方はこちら' : 'アカウントをお持ちでない方はこちら'}
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <p className="text-xs text-center font-bold text-slate-400 mb-4">または</p>
                        <button type="button" className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white font-bold py-3 rounded-xl shadow-md transition-transform active:scale-95 flex items-center justify-center space-x-2">
                            <span>LINEでログイン</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
