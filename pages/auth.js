// pages/auth.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

export default function Auth() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleMockLogin = (provider) => {
    // Simulate authentication
    const mockUser = {
      username: `User_${provider}`,
      email: `user@${provider.toLowerCase()}.com`,
      token: `mock-token-${provider}`,
    };
    localStorage.setItem('user', JSON.stringify(mockUser));
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-primary mb-6 text-center">
          Welcome to Healthcare Chat
        </h1>
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}
        <div className="space-y-4">
          <button
            onClick={() => handleMockLogin('Google')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Continue with Google"
          >
            <Image src="/google-icon.png" alt="Google" width={24} height={24} />
            Continue with Google
          </button>
          <button
            onClick={() => handleMockLogin('Microsoft')}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Continue with Microsoft"
          >
            <Image src="/microsoft-icon.png" alt="Microsoft" width={24} height={24} />
            Continue with Microsoft
          </button>
        </div>
        <p className="text-xs text-gray-500 text-center mt-6">
          Prototype mode: Select a provider to continue.
        </p>
      </div>
    </div>
  );
}