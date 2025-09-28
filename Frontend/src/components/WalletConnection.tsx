'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Wallet, LogOut } from 'lucide-react';

// Extend Window interface for HashPack
declare global {
  interface Window {
    hashconnect?: {
      init: (metadata: { name: string; description: string; icon: string }) => Promise<{ pairingString?: string }>;
      connectToLocalWallet: () => Promise<{ pairingString?: string }>;
      hcData: {
        pairingString?: string;
      };
    };
  }
}

export function WalletConnection() {
  const { 
    isConnected, 
    walletAddress, 
    setConnected, 
    setWalletAddress, 
    setPlayer,
    registerPlayer,
    loadPlayerData
  } = useGameStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      // Check if HashPack is available
      if (typeof window !== 'undefined' && window.hashconnect) {
        const hashconnect = window.hashconnect;
        
        // Initialize if not already done
        if (!hashconnect.hcData.pairingString) {
          await hashconnect.init({
            name: "Mindora Runner",
            description: "Educational GameFi Platform",
            icon: "/logo.png"
          });
        }

        // Connect wallet
        const connectData = await hashconnect.connectToLocalWallet();
        
        if (connectData.pairingString) {
          // Show QR code or pairing string
          const pairingString = connectData.pairingString;
          console.log('Pairing string:', pairingString);
          
          // For demo purposes, we'll simulate a successful connection
          // In production, you'd handle the actual pairing process
          setTimeout(async () => {
            const mockAddress = '0.0.123456';
            setWalletAddress(mockAddress);
            setConnected(true);
            
            // Try to load existing player data
            await loadPlayerData(mockAddress);

            // For demo purposes, skip registration for now
            // if (!player) {
            //   setShowRegistration(true);
            // }
            
            setIsConnecting(false);
          }, 2000);
        }
      } else {
        // Fallback for development
        const mockAddress = '0.0.123456';
        setWalletAddress(mockAddress);
        setConnected(true);
        
        // Try to load existing player data
        await loadPlayerData(mockAddress);

        // For demo purposes, skip registration for now
        // if (!player) {
        //   setShowRegistration(true);
        // }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setWalletAddress(null);
    setPlayer(null);
    setShowRegistration(false);
  };

  const handleRegister = async () => {
    if (!username.trim()) return;
    
    setIsRegistering(true);
    try {
      const success = await registerPlayer(username.trim());
      if (success) {
        setShowRegistration(false);
        setUsername('');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
    setIsRegistering(false);
  };

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-green-600 px-3 py-2 rounded-lg">
          <Wallet className="w-4 h-4" />
          <span className="text-sm font-mono">
            {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-4)}
          </span>
        </div>
        <button
          onClick={disconnectWallet}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Wallet className="w-4 h-4" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>

      {/* Registration Modal */}
      {showRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">Welcome to Mindora!</h2>
            <p className="text-gray-600 mb-4">Choose your username to start playing:</p>

            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />

            <div className="flex space-x-3">
              <button
                onClick={handleRegister}
                disabled={!username.trim() || isRegistering}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isRegistering ? 'Registering...' : 'Register'}
              </button>
              <button
                onClick={() => setShowRegistration(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

