'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { POLICY_ABI, POLICY_CONTRACT_ADDRESS } from '@/lib/abi';
import Link from 'next/link';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [policyId, setPolicyId] = useState('');
  const [actualDelay, setActualDelay] = useState('');
  const [isSettingOracle, setIsSettingOracle] = useState(false);
  const [isTriggeringPayout, setIsTriggeringPayout] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Read contract owner
  const { data: contractOwner, isLoading: isLoadingOwner } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'owner',
  }) as { data: string | undefined; isLoading: boolean };

  // Read current oracle address
  const { data: oracleAddress, isLoading: isLoadingOracle, refetch: refetchOracle } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'oracleAddress',
  }) as { data: string | undefined; isLoading: boolean; refetch: () => void };

  // Check if connected user is the owner
  const isOwner = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();
  const isOracle = address && oracleAddress && address.toLowerCase() === oracleAddress.toLowerCase();

  // Write contract hooks
  const { writeContract: writeSetOracle, data: setOracleHash } = useWriteContract();
  const { writeContract: writeTriggerPayout, data: triggerPayoutHash } = useWriteContract();

  // Transaction receipts
  const { isLoading: isSetOracleLoading, isSuccess: isSetOracleSuccess } = useWaitForTransactionReceipt({ 
    hash: setOracleHash 
  });
  const { isLoading: isTriggerPayoutLoading, isSuccess: isTriggerPayoutSuccess } = useWaitForTransactionReceipt({ 
    hash: triggerPayoutHash 
  });

  // Handle setting oracle address
  const handleSetOracle = async () => {
    if (!address) {
      setErrorMessage('Please connect your wallet');
      return;
    }

    try {
      setIsSettingOracle(true);
      setErrorMessage('');
      setSuccessMessage('');

      writeSetOracle({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'setOracleAddress',
        args: [address],
      });
    } catch (error: any) {
      console.error('Set oracle error:', error);
      setErrorMessage(`Failed to set oracle: ${error.message || 'Unknown error'}`);
      setIsSettingOracle(false);
    }
  };

  // Handle triggering payout
  const handleTriggerPayout = async () => {
    if (!policyId || !actualDelay) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    try {
      setIsTriggeringPayout(true);
      setErrorMessage('');
      setSuccessMessage('');

      const policyIdBigInt = BigInt(policyId);
      const delayBigInt = BigInt(actualDelay);

      writeTriggerPayout({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'triggerPayout',
        args: [policyIdBigInt, delayBigInt],
      });
    } catch (error: any) {
      console.error('Trigger payout error:', error);
      setErrorMessage(`Failed to trigger payout: ${error.message || 'Unknown error'}`);
      setIsTriggeringPayout(false);
    }
  };

  // Effect for set oracle success
  useEffect(() => {
    if (isSetOracleSuccess) {
      setSuccessMessage('✅ Oracle address set successfully!');
      setIsSettingOracle(false);
      refetchOracle();
    }
  }, [isSetOracleSuccess, refetchOracle]);

  // Effect for trigger payout success
  useEffect(() => {
    if (isTriggerPayoutSuccess) {
      setSuccessMessage(`✅ Payout triggered successfully for Policy #${policyId}!`);
      setIsTriggeringPayout(false);
      setPolicyId('');
      setActualDelay('');
    }
  }, [isTriggerPayoutSuccess, policyId]);

  // Loading state
  if (isLoadingOwner || isLoadingOracle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel</h1>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access the admin panel.
          </p>
          <Link 
            href="/"
            className="inline-block bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Not owner
  if (!isOwner) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            Only the contract owner can access this page.
          </p>
          <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
            <p className="text-xs text-gray-500 mb-2">Your Address:</p>
            <p className="text-xs font-mono text-gray-900 break-all">{address}</p>
            <p className="text-xs text-gray-500 mt-3 mb-2">Owner Address:</p>
            <p className="text-xs font-mono text-gray-900 break-all">{contractOwner}</p>
          </div>
          <Link 
            href="/"
            className="inline-block bg-purple-600 text-white py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Owner view
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-2">Contract Owner</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <p className="text-sm font-mono text-green-600">You</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-2">Oracle Status</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{isOracle ? '✅' : '⚠️'}</span>
              <p className="text-sm font-semibold">{isOracle ? 'You are Oracle' : 'Not Set'}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-500 mb-2">Contract Address</p>
            <p className="text-xs font-mono text-gray-900 truncate">{POLICY_CONTRACT_ADDRESS}</p>
          </div>
        </div>

        {/* Oracle Setup Section */}
        {!isOracle && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="text-3xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 mb-2">
                  Oracle Not Set
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  You need to set yourself as the oracle to trigger payouts. This is required for the demo.
                </p>
                <button
                  onClick={handleSetOracle}
                  disabled={isSettingOracle || isSetOracleLoading}
                  className="bg-yellow-600 text-white py-2 px-6 rounded-md hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSettingOracle || isSetOracleLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Setting Oracle...
                    </span>
                  ) : (
                    'Set Me as Oracle'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Trigger Payout Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🎯</span>
            <h2 className="text-2xl font-bold text-gray-900">Trigger Policy Payout</h2>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Demo Instructions:</strong> Enter the Policy ID and the actual flight delay in minutes. 
              If the delay meets or exceeds the policy's threshold, the payout will be processed automatically.
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy ID
              </label>
              <input
                type="number"
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                placeholder="Enter policy ID (e.g., 1)"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={!isOracle}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Actual Delay (minutes)
              </label>
              <input
                type="number"
                value={actualDelay}
                onChange={(e) => setActualDelay(e.target.value)}
                placeholder="Enter delay in minutes (e.g., 150)"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                disabled={!isOracle}
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: If the delay is ≥ the policy's threshold (e.g., 120 min), the payout will be triggered.
              </p>
            </div>

            <button
              onClick={handleTriggerPayout}
              disabled={!isOracle || isTriggeringPayout || isTriggerPayoutLoading || !policyId || !actualDelay}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isTriggeringPayout || isTriggerPayoutLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Processing Transaction...
                </span>
              ) : (
                '🎯 Trigger Payout'
              )}
            </button>

            {!isOracle && (
              <p className="text-sm text-red-600 text-center">
                ⚠️ You must set yourself as oracle before triggering payouts
              </p>
            )}
          </div>
        </div>

        {/* Demo Flow Section */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-8 mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📹 Demo Video Flow</h3>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span><strong>As User:</strong> Connect wallet, approve PYUSD, and buy an insurance policy</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span><strong>As User:</strong> View the policy in "My Policies" - status should be ACTIVE</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span><strong>As Admin:</strong> Come to this page, set yourself as oracle (if needed)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span><strong>As Admin:</strong> Enter the Policy ID and a delay ≥ threshold (e.g., 150 min)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
              <span><strong>As Admin:</strong> Click "Trigger Payout" and confirm the transaction</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
              <span><strong>As User:</strong> Return to "My Policies" - status changes to PAID 🎉</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">7</span>
              <span><strong>As User:</strong> Check MetaMask - PYUSD balance increased by payout amount! 💰</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  );
}

