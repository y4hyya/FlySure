'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { POLICY_ABI, ERC20_ABI, POLICY_CONTRACT_ADDRESS, PYUSD_TOKEN_ADDRESS } from '@/lib/abi';

export function CreatePolicyForm() {
  const { address } = useAccount();
  const [flightId, setFlightId] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'creating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fixed values
  const premium = '10'; // 10 PYUSD
  const payout = '100'; // 100 PYUSD
  const delayThreshold = 120; // 120 minutes

  // Wagmi hooks for contract writes
  const { writeContract: writeApprove, data: approveHash } = useWriteContract();
  const { writeContract: writeCreate, data: createHash } = useWriteContract();

  // Wait for approve transaction
  const { isLoading: isApproveLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({
    hash: approveHash,
  });

  // Wait for create transaction
  const { isLoading: isCreateLoading, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({
    hash: createHash,
  });

  // Define handleCreatePolicy first
  const handleCreatePolicy = async () => {
    try {
      setTxStatus('creating');
      setIsCreating(true);
      setIsApproving(false);

      const premiumAmount = parseUnits(premium, 6);
      const payoutAmount = parseUnits(payout, 6);

      writeCreate({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'createPolicy',
        args: [
          flightId,
          premiumAmount,
          payoutAmount,
          BigInt(delayThreshold),
        ],
      });
    } catch (error: any) {
      console.error('Create policy error:', error);
      setErrorMessage(`Policy creation failed: ${error.message || 'Unknown error'}`);
      setTxStatus('error');
      setIsCreating(false);
    }
  };

  // Handle approve success
  if (isApproveSuccess && txStatus === 'approving') {
    setTxStatus('approved');
    handleCreatePolicy();
  }

  // Handle create success
  if (isCreateSuccess && txStatus === 'creating') {
    setTxStatus('success');
    setSuccessMessage(`✅ Policy created successfully! Transaction: ${createHash}`);
    setFlightId('');
    setIsCreating(false);
  }

  const handleApprove = async () => {
    if (!flightId.trim()) {
      setErrorMessage('Please enter a flight ID');
      return;
    }

    try {
      setTxStatus('approving');
      setIsApproving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const premiumAmount = parseUnits(premium, 6); // PYUSD has 6 decimals

      writeApprove({
        address: PYUSD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [POLICY_CONTRACT_ADDRESS, premiumAmount],
      });
    } catch (error: any) {
      console.error('Approve error:', error);
      setErrorMessage(`Approval failed: ${error.message || 'Unknown error'}`);
      setTxStatus('error');
      setIsApproving(false);
    }
  };

  const handleBuyPolicy = () => {
    handleApprove();
  };

  const resetForm = () => {
    setTxStatus('idle');
    setErrorMessage('');
    setSuccessMessage('');
    setIsApproving(false);
    setIsCreating(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        🎫 Create Flight Insurance Policy
      </h2>

      <div className="space-y-6">
        {/* Flight ID Input */}
        <div>
          <label htmlFor="flightId" className="block text-sm font-medium text-gray-700 mb-2">
            Flight ID *
          </label>
          <input
            id="flightId"
            type="text"
            value={flightId}
            onChange={(e) => setFlightId(e.target.value)}
            placeholder="e.g., IST-BER-20251025"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isApproving || isCreating}
          />
          <p className="mt-1 text-sm text-gray-500">
            Format: ORIGIN-DESTINATION-YYYYMMDD
          </p>
        </div>

        {/* Premium Display */}
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Premium Amount:</span>
            <span className="text-lg font-bold text-indigo-600">{premium} PYUSD</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Payout Amount:</span>
            <span className="text-lg font-bold text-green-600">{payout} PYUSD</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Delay Threshold:</span>
            <span className="text-lg font-bold text-gray-700">{delayThreshold} minutes</span>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">ℹ️ How it works:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Pay {premium} PYUSD premium to insure your flight</li>
            <li>• If delayed ≥ {delayThreshold} minutes, receive {payout} PYUSD</li>
            <li>• Two transactions required: Approve + Create Policy</li>
          </ul>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-700">❌ {errorMessage}</p>
            <button
              onClick={resetForm}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-sm text-green-700">{successMessage}</p>
            <a
              href={`https://sepolia.etherscan.io/tx/${createHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-green-600 hover:text-green-800 underline inline-block"
            >
              View on Etherscan →
            </a>
          </div>
        )}

        {/* Transaction Status */}
        {(isApproving || isCreating) && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <div>
                {isApproving && (
                  <p className="text-sm font-medium text-indigo-900">
                    Step 1/2: Approving PYUSD...
                    {isApproveLoading && ' (Waiting for confirmation...)'}
                  </p>
                )}
                {isCreating && (
                  <p className="text-sm font-medium text-indigo-900">
                    Step 2/2: Creating policy...
                    {isCreateLoading && ' (Waiting for confirmation...)'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Buy Policy Button */}
        <button
          onClick={handleBuyPolicy}
          disabled={!flightId.trim() || isApproving || isCreating}
          className={`w-full py-4 px-6 rounded-md font-semibold text-white transition-all ${
            !flightId.trim() || isApproving || isCreating
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg'
          }`}
        >
          {isApproving
            ? '⏳ Approving PYUSD...'
            : isCreating
            ? '⏳ Creating Policy...'
            : '🎫 Buy Policy'}
        </button>

        {/* Additional Info */}
        <div className="text-center text-sm text-gray-500">
          <p>
            Make sure you have at least {premium} PYUSD in your wallet.
          </p>
          <a
            href="https://faucet.paxos.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            Get testnet PYUSD →
          </a>
        </div>
      </div>
    </div>
  );
}

