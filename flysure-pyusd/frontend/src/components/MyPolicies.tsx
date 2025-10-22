'use client';

import { useAccount, useReadContract } from 'wagmi';
import { POLICY_ABI, POLICY_CONTRACT_ADDRESS } from '@/lib/abi';
import { formatUnits } from 'viem';

export function MyPolicies() {
  const { address } = useAccount();

  // Get policy IDs for the user
  const { data: policyIds, isLoading: isLoadingIds, refetch } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'getPolicyIdsForUser',
    args: address ? [address] : undefined,
  }) as { data: bigint[] | undefined; isLoading: boolean; refetch: () => void };

  if (isLoadingIds) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 My Policies</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <span className="ml-4 text-gray-600">Loading your policies...</span>
        </div>
      </div>
    );
  }

  if (!policyIds || policyIds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 My Policies</h2>
        <div className="py-12">
          <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 text-lg mb-2">No policies found</p>
          <p className="text-gray-500 text-sm">You haven't created any insurance policies yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">📋 My Policies</h2>
        <button
          onClick={() => refetch()}
          className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {policyIds.map((policyId) => (
          <PolicyCard key={policyId.toString()} policyId={policyId} />
        ))}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        Total Policies: {policyIds.length}
      </div>
    </div>
  );
}

type PolicyInfo = {
  policyId: bigint;
  policyHolder: string;
  flightId: string;
  premiumAmount: bigint;
  payoutAmount: bigint;
  delayThreshold: bigint;
  status: number;
};

function PolicyCard({ policyId }: { policyId: bigint }) {
  const { data: policy, isLoading } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'getPolicyDetails',
    args: [policyId],
  }) as { data: PolicyInfo | undefined; isLoading: boolean };

  if (isLoading) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!policy) {
    return null;
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-green-100 text-green-800 border-green-300';
      case 1: return 'bg-blue-100 text-blue-800 border-blue-300';
      case 2: return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '✅ ACTIVE';
      case 1: return '💰 PAID';
      case 2: return '⏰ EXPIRED';
      default: return 'UNKNOWN';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return '🛫';
      case 1: return '✅';
      case 2: return '❌';
      default: return '❓';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getStatusIcon(policy.status)}</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Policy #{policyId.toString()}
            </h3>
            <p className="text-sm text-gray-500">Flight: {policy.flightId}</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(policy.status)}`}>
          {getStatusText(policy.status)}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Premium Paid</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatUnits(policy.premiumAmount, 6)} PYUSD
          </p>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Payout Amount</p>
          <p className="text-sm font-semibold text-green-600">
            {formatUnits(policy.payoutAmount, 6)} PYUSD
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Delay Threshold</p>
          <p className="text-sm font-semibold text-gray-900">
            {policy.delayThreshold.toString()} min
          </p>
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Policy ID</p>
          <p className="text-sm font-semibold text-gray-900 font-mono">
            #{policyId.toString()}
          </p>
        </div>
      </div>

      {policy.status === 0 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            ℹ️ This policy is active. If your flight is delayed ≥{policy.delayThreshold.toString()} minutes, 
            you'll receive {formatUnits(policy.payoutAmount, 6)} PYUSD.
          </p>
        </div>
      )}

      {policy.status === 1 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            ✅ Payout of {formatUnits(policy.payoutAmount, 6)} PYUSD has been processed!
          </p>
        </div>
      )}

      {policy.status === 2 && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <p className="text-sm text-gray-800">
            This policy has expired without payout (flight delay was below threshold).
          </p>
        </div>
      )}
    </div>
  );
}

