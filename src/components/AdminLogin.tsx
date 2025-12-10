import { useState } from 'react';
import { ArrowLeft, Lock, User } from 'lucide-react';

type AdminLoginProps = {
  onLogin: (username: string, password: string) => boolean;
  navigateTo: (page: string) => void;
};

export default function AdminLogin({ onLogin, navigateTo }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 md:mb-8 text-sm md:text-base"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
          <span>Về trang chủ</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="bg-purple-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Lock className="w-7 h-7 md:w-8 md:h-8 text-purple-600" />
            </div>
            <h2 className="text-purple-600 text-xl md:text-2xl">Đăng nhập Admin</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm md:text-base">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm md:text-base"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm md:text-base">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-2.5 md:py-3 rounded-lg hover:bg-purple-700 transition text-sm md:text-base"
            >
              Đăng nhập
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}