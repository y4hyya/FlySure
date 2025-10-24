'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { POLICY_ABI, ERC20_ABI, POLICY_CONTRACT_ADDRESS, PYUSD_TOKEN_ADDRESS } from '@/lib/abi';

export function CreatePolicyForm() {
  const { address } = useAccount();
  
  // Step management state
  const [step, setStep] = useState(1);
  const [flightCode, setFlightCode] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [pnrCode, setPnrCode] = useState('');
  const [delayThreshold, setDelayThreshold] = useState(120); // Default to 120
  const [premiumAmount, setPremiumAmount] = useState(10); // Default premium
  const [payoutAmount, setPayoutAmount] = useState(100); // Default payout
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Transaction state
  const [isApproving, setIsApproving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'creating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  // Calculate payout based on premium and delay threshold
  useEffect(() => {
    const multipliers = {
      30: 3,  // 3x payout for 30 min delay
      60: 6,  // 6x payout for 60 min delay
      120: 10 // 10x payout for 120 min delay
    };

    // Ensure delayThreshold is a valid key
    const multiplier = multipliers[delayThreshold as keyof typeof multipliers] || 10;
    const calculatedPayout = premiumAmount * multiplier;
    setPayoutAmount(calculatedPayout);
  }, [premiumAmount, delayThreshold]);

  // Define handleCreatePolicy
  const handleCreatePolicy = async () => {
    try {
      setTxStatus('creating');
      setIsCreating(true);
      setIsApproving(false);

      const premium = parseUnits(premiumAmount.toString(), 6);
      const payout = parseUnits(payoutAmount.toString(), 6);

      writeCreate({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'createPolicy',
        args: [
          flightCode,
          premium,
          payout,
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
    setFlightCode('');
    setIsCreating(false);
    setIsReviewModalOpen(false);
  }

  const handleApprove = async () => {
    if (!flightCode.trim()) {
      setErrorMessage('Please enter a flight code');
      return;
    }

    try {
      setTxStatus('approving');
      setIsApproving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const premium = parseUnits(premiumAmount.toString(), 6); // PYUSD has 6 decimals

      writeApprove({
        address: PYUSD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [POLICY_CONTRACT_ADDRESS, premium],
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
    <>
      <div className="w-full max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          🎫 Create Flight Insurance Policy
        </h2>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          <span className={`text-sm font-medium ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            Step 1: Flight
          </span>
          <span className={`text-sm font-medium ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            Step 2: Policy
          </span>
          <span className={`text-sm font-medium ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
            Step 3: Review
          </span>
        </div>

        {/* Conditional Step Content */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Enter Your Flight Details</h2>
            
            {/* Flight Code Input */}
            <div className="mb-6">
              <label htmlFor="flightCode" className="block text-sm font-medium text-gray-700 mb-2">
                Flight Code (e.g., TK1984, VF2356)
              </label>
              <input
                type="text"
                id="flightCode"
                value={flightCode}
                onChange={(e) => setFlightCode(e.target.value.toUpperCase())}
                placeholder="TK1984"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-gray-900"
              />
            </div>

            {/* Departure Airport Input */}
            <div className="mb-6">
              <label htmlFor="departureAirport" className="block text-sm font-medium text-gray-700 mb-2">
                Departure Airport (e.g., IST, SAW)
              </label>
              <input
                type="text"
                id="departureAirport"
                value={departureAirport}
                onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
                placeholder="IST"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-gray-900"
              />
            </div>

            {/* PNR Code Input */}
            <div className="mb-6">
              <label htmlFor="pnrCode" className="block text-sm font-medium text-gray-700 mb-2">
                PNR Code
              </label>
              <input
                type="text"
                id="pnrCode"
                value={pnrCode}
                onChange={(e) => setPnrCode(e.target.value.toUpperCase())}
                placeholder="A4T5P2"
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm text-gray-900"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your 6-digit PNR code found on your ticket.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                We will use this information to verify your flight's status.
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Customize Your Policy</h2>

            {/* 1. Delay Threshold Selection */}
            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-800 mb-4">
                Payout Trigger (Delay Threshold)
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[30, 60, 120].map((time) => (
                  <button
                    key={time}
                    onClick={() => setDelayThreshold(time)}
                    className={`p-6 border rounded-lg text-center transition-all ${
                      delayThreshold === time 
                      ? 'bg-blue-600 text-white border-blue-700 shadow-lg' 
                      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'
                    }`}
                  >
                    <span className="block text-2xl font-bold">{time}</span>
                    <span className="block text-sm">Minutes</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Premium Amount Input */}
            <div className="mb-8">
              <label htmlFor="premium" className="block text-lg font-medium text-gray-800 mb-4">
                Your Premium (Max $100 PYUSD)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  id="premium"
                  min="1"
                  max="100"
                  value={premiumAmount}
                  onChange={(e) => setPremiumAmount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-2xl font-bold text-blue-600 w-24 text-right">
                  {premiumAmount} PYUSD
                </span>
              </div>
            </div>

            {/* 3. Calculated Payout Display */}
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Calculated Payout
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                If your flight is delayed by {delayThreshold} minutes or more, you will receive:
              </p>
              <div className="p-6 bg-green-50 rounded-lg text-center">
                <span className="text-4xl font-bold text-green-700">
                  {payoutAmount} PYUSD
                </span>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Your Policy</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Flight Code:</span>
                  <span className="font-medium text-gray-900">{flightCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PNR Code:</span>
                  <span className="font-medium text-gray-900">{pnrCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Departure Airport:</span>
                  <span className="font-medium text-gray-900">{departureAirport || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delay Threshold:</span>
                  <span className="font-medium text-gray-900">{delayThreshold} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span className="font-medium text-blue-600">{premiumAmount} PYUSD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payout:</span>
                  <span className="font-medium text-green-600">{payoutAmount} PYUSD</span>
                </div>
              </div>
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
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button 
              onClick={() => setStep(step - 1)} 
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
            >
              Back
            </button>
          )}
          {step === 1 && (
            <button 
              onClick={() => setStep(2)} 
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!flightCode.trim()}
            >
              Next
            </button>
          )}
          {step === 2 && (
            <button 
              onClick={() => setStep(3)} 
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium ml-auto"
            >
              Review Policy
            </button>
          )}
          {step === 3 && (
            <button
              onClick={handleBuyPolicy}
              disabled={isApproving || isCreating}
              className={`px-6 py-3 rounded-md font-semibold text-white transition-all ml-auto ${
                isApproving || isCreating
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg'
              }`}
            >
              {isApproving
                ? '⏳ Approving PYUSD...'
                : isCreating
                ? '⏳ Creating Policy...'
                : '🎫 Buy Policy'}
            </button>
          )}
        </div>

        {/* Additional Info */}
        {step === 3 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>
              Make sure you have at least {premiumAmount} PYUSD in your wallet.
            </p>
            <a
              href="https://faucet.paxos.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Get testnet PYUSD →
            </a>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full mx-4">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Review Your Policy</h2>
            
            {/* Summary List */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Flight Code:</span>
                <span className="font-bold text-gray-900">{flightCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PNR Code:</span>
                <span className="font-bold text-gray-900">{pnrCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Departure Airport:</span>
                <span className="font-bold text-gray-900">{departureAirport}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delay Threshold:</span>
                <span className="font-bold text-gray-900">{delayThreshold} minutes</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span className="font-medium">Your Premium:</span>
                <span className="font-bold text-xl">{premiumAmount} PYUSD</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span className="font-medium">Your Payout:</span>
                <span className="font-bold text-xl">{payoutAmount} PYUSD</span>
              </div>
            </div>

            {/* Disclaimers */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 mb-8">
              <p>
                By proceeding, you agree to pay the {premiumAmount} PYUSD premium. 
                This transaction requires TWO approvals: 
                1. Approve PYUSD spend
                2. Confirm Create Policy
              </p>
              <p className="mt-2">
                Payout is processed automatically if the oracle confirms the delay.
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => { setIsReviewModalOpen(false); setStep(2); }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyPolicy}
                disabled={isApproving || isCreating}
                className={`px-6 py-3 rounded-md font-semibold text-white transition-all ${
                  isApproving || isCreating
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isApproving
                  ? '⏳ Approving...'
                  : isCreating
                  ? '⏳ Creating...'
                  : 'Confirm & Buy Policy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
