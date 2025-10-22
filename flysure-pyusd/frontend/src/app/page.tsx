'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { CreatePolicyForm } from '@/components/CreatePolicyForm';
import { MyPolicies } from '@/components/MyPolicies';
import { POLICY_ABI, POLICY_CONTRACT_ADDRESS } from '@/lib/abi';
import Link from 'next/link';

type View = 'home' | 'create' | 'policies';

export default function Home() {
  const { isConnected, address } = useAccount();
  const [currentView, setCurrentView] = useState<View>('home');

  // Check if user is contract owner
  const { data: contractOwner } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'owner',
  }) as { data: string | undefined };

  const isOwner = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button 
              onClick={() => setCurrentView('home')}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <h1 className="text-2xl font-bold text-indigo-600">✈️ FlySure</h1>
              <span className="ml-2 text-sm text-gray-500">PYUSD Insurance</span>
            </button>
            <div className="flex items-center gap-4">
              {isConnected && isOwner && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <span>👨‍💼</span>
                  <span>Admin Panel</span>
                </Link>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {currentView === 'home' && (
          <>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Decentralized Flight Insurance
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Protect your flights with blockchain-powered insurance. Pay premiums and receive payouts in PYUSD stablecoin.
              </p>
            </div>

            {isConnected ? (
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                    Welcome! 👋
                  </h3>
                  <p className="text-gray-600">
                    Connected Address: <span className="font-mono text-sm">{address}</span>
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      🎫 Create Policy
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Purchase flight insurance by paying a premium in PYUSD.
                    </p>
                    <button 
                      onClick={() => setCurrentView('create')}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Create New Policy
                    </button>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      📋 My Policies
                    </h4>
                    <p className="text-gray-600 mb-4">
                      View and manage your existing insurance policies.
                    </p>
                    <button 
                      onClick={() => setCurrentView('policies')}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                    >
                      View My Policies
                    </button>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">ℹ️ How it works:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Pay a premium in PYUSD to insure your flight</li>
                    <li>• If your flight is delayed beyond the threshold, you receive a payout</li>
                    <li>• All transactions are on-chain and transparent</li>
                    <li>• Running on Sepolia testnet</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 max-w-2xl mx-auto text-center">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                  Connect Your Wallet
                </h3>
                <p className="text-gray-600 mb-6">
                  Please connect your wallet to access FlySure insurance platform
                </p>
                <div className="flex justify-center">
                  <ConnectButton />
                </div>
              </div>
            )}
          </>
        )}

        {currentView === 'create' && isConnected && (
          <div>
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <CreatePolicyForm />
          </div>
        )}

        {currentView === 'policies' && isConnected && (
          <div>
            <button
              onClick={() => setCurrentView('home')}
              className="mb-6 flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
            <MyPolicies />
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Sepolia Testnet</span>
            </div>
            <div className="flex items-center gap-2">
              <span>💵</span>
              <span>Powered by PYUSD</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
