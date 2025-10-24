'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreatePolicyForm } from '@/components/CreatePolicyForm';
import Link from 'next/link';

export default function CreatePolicyPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>

        {isConnected ? (
          <CreatePolicyForm />
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
              Please connect your wallet to create a flight insurance policy
            </p>
            <div className="flex justify-center">
              <ConnectButton />
            </div>
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

