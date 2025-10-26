'use client';

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { POLICY_ABI, POLICY_CONTRACT_ADDRESS } from '@/lib/abi';
import { formatUnits } from 'viem';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { 
  FileText, 
  RefreshCw, 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  DollarSign,
  Plane,
  AlertCircle,
  Loader2
} from 'lucide-react';

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="bg-gray-900/50 border-gray-800 max-w-4xl mx-auto">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <BackgroundGradient className="rounded-full">
                <div className="p-4 bg-transparent">
                  <FileText className="h-16 w-16 text-white" />
                </div>
              </BackgroundGradient>
            </div>
            <CardTitle className="text-2xl text-white mb-2">My Policies</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
              <span className="ml-4 text-gray-300">Loading your policies...</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!policyIds || policyIds.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Card className="bg-gray-900/50 border-gray-800 max-w-4xl mx-auto">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <BackgroundGradient className="rounded-full">
                <div className="p-4 bg-transparent">
                  <FileText className="h-16 w-16 text-white" />
                </div>
              </BackgroundGradient>
            </div>
            <CardTitle className="text-2xl text-white mb-2">My Policies</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <div className="flex justify-center mb-6">
              <BackgroundGradient className="rounded-full">
                <div className="p-6 bg-transparent">
                  <Shield className="h-24 w-24 text-white/50" />
                </div>
              </BackgroundGradient>
            </div>
            <CardDescription className="text-gray-300 text-lg mb-2">
              No policies found
            </CardDescription>
            <CardDescription className="text-gray-400 text-sm">
              You haven't created any insurance policies yet.
            </CardDescription>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 max-w-4xl mx-auto">
        <CardHeader className="pb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <BackgroundGradient className="rounded-full">
                <div className="p-3 bg-transparent">
                  <FileText className="h-8 w-8 text-white" />
                </div>
              </BackgroundGradient>
              <div>
                <CardTitle className="text-2xl text-white">My Policies</CardTitle>
                <CardDescription className="text-gray-400">
                  Total Policies: {policyIds.length}
                </CardDescription>
              </div>
            </div>
            <BackgroundGradient className="rounded-full">
              <Button
                onClick={() => refetch()}
                variant="ghost"
                size="sm"
                className="bg-transparent border-0 text-white hover:bg-white/10"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </BackgroundGradient>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {policyIds.map((policyId, index) => (
              <motion.div
                key={policyId.toString()}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <PolicyCard policyId={policyId} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

type PolicyInfo = {
  policyId: bigint;
  policyHolder: string;
  flightId: string;
  premiumAmount: bigint;
  payoutAmount: bigint;
  delayThreshold: bigint;
  departureTimestamp: bigint;
  flightStatus: number; // 0=ON_TIME, 1=DELAYED, 2=CANCELLED
  actualDelayMinutes: bigint;
  status: number; // 0=ACTIVE, 1=PAID, 2=EXPIRED
};

function PolicyCard({ policyId }: { policyId: bigint }) {
  const { address } = useAccount();
  
  const { data: policy, isLoading } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'getPolicyDetails',
    args: [policyId],
  }) as { data: PolicyInfo | undefined; isLoading: boolean };

  // Contract write hooks for claim and expire
  const { writeContract: writeClaimPayout, data: claimHash, error: claimError } = useWriteContract();
  const { writeContract: writeExpirePolicy, data: expireHash, error: expireError } = useWriteContract();

  // Wait for transactions
  const { isLoading: isClaimLoading, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
    hash: claimHash,
  });

  const { isLoading: isExpireLoading, isSuccess: isExpireSuccess } = useWaitForTransactionReceipt({
    hash: expireHash,
  });

  // Handle claim payout
  const handleClaimPayout = async () => {
    try {
      await writeClaimPayout({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'processClaim',
        args: [policyId],
        gas: BigInt(300000), // Increased gas limit for processClaim
      });
    } catch (error) {
      console.error('Process claim error:', error);
    }
  };

  // Handle expire policy
  const handleExpirePolicy = async () => {
    try {
      await writeExpirePolicy({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'expirePolicy',
        args: [policyId],
        gas: BigInt(200000), // Increased gas limit for expirePolicy
      });
    } catch (error) {
      console.error('Expire policy error:', error);
    }
  };

  // Check if departure time has passed
  const isDepartureTimePassed = () => {
    if (!policy) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= Number(policy.departureTimestamp);
  };

  // Check if policy is eligible for claim
  const isEligibleForClaim = () => {
    if (!policy) return false;
    return (
      policy.status === 0 && // ACTIVE
      isDepartureTimePassed() && // Departure time has passed
      (policy.flightStatus === 1 || policy.flightStatus === 2) && // DELAYED or CANCELLED
      (policy.flightStatus === 2 || policy.actualDelayMinutes >= policy.delayThreshold) // Cancelled or delay meets threshold
    );
  };

  // Check if policy is eligible for expiration
  const isEligibleForExpiration = () => {
    if (!policy) return false;
    return (
      policy.status === 0 && // ACTIVE
      isDepartureTimePassed() && // Departure time has passed
      policy.flightStatus === 0 // ON_TIME
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800/50 border-gray-700 animate-pulse">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-700 rounded-full w-20"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="h-3 bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!policy) {
    return null;
  }

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 1: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 2: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return 'ACTIVE';
      case 1: return 'PAID';
      case 2: return 'EXPIRED';
      default: return 'UNKNOWN';
    }
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0: return <Plane className="h-5 w-5" />;
      case 1: return <CheckCircle className="h-5 w-5" />;
      case 2: return <XCircle className="h-5 w-5" />;
      default: return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-all duration-300 hover:scale-[1.02]">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <BackgroundGradient className="rounded-full">
              <div className="p-3 bg-transparent">
                {getStatusIcon(policy.status)}
              </div>
            </BackgroundGradient>
            <div>
              <CardTitle className="text-lg text-white">
                Policy #{policyId.toString()}
              </CardTitle>
              <CardDescription className="text-gray-400">
                Flight: {policy.flightId}
              </CardDescription>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 ${getStatusColor(policy.status)}`}>
            {getStatusIcon(policy.status)}
            {getStatusText(policy.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <p className="text-xs text-gray-400">Premium Paid</p>
            </div>
            <p className="text-sm font-semibold text-white">
              {formatUnits(policy.premiumAmount, 6)} PYUSD
            </p>
          </div>
          
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-blue-400" />
              <p className="text-xs text-gray-400">Payout Amount</p>
            </div>
            <p className="text-sm font-semibold text-green-400">
              {formatUnits(policy.payoutAmount, 6)} PYUSD
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <p className="text-xs text-gray-400">Delay Threshold</p>
            </div>
            <p className="text-sm font-semibold text-white">
              {policy.delayThreshold.toString()} min
            </p>
          </div>

          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-purple-400" />
              <p className="text-xs text-gray-400">Policy ID</p>
            </div>
            <p className="text-sm font-semibold text-white font-mono">
              #{policyId.toString()}
            </p>
          </div>
        </div>

        {policy.status === 0 && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-400" />
              <p className="text-sm font-semibold text-blue-400">Active Policy</p>
            </div>
            <p className="text-sm text-blue-300 mb-4">
              If your flight is delayed ≥{policy.delayThreshold.toString()} minutes, 
              you'll receive {formatUnits(policy.payoutAmount, 6)} PYUSD.
            </p>
            
            {/* Action buttons for active policies */}
            <div className="flex gap-3">
              {/* Main Process Claim Button - Only shows if eligible for claim */}
              {isEligibleForClaim() && (
                <Button
                  onClick={handleClaimPayout}
                  disabled={isClaimLoading || isClaimSuccess}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isClaimLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Claim...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Process Claim
                    </>
                  )}
                </Button>
              )}
              
              {/* Expire Policy Button - Only shows if eligible for expiration */}
              {isEligibleForExpiration() && (
                <Button
                  onClick={handleExpirePolicy}
                  disabled={isExpireLoading || isExpireSuccess}
                  className="bg-gray-600 hover:bg-gray-700 text-white"
                >
                  {isExpireLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Expiring...
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-2 h-4 w-4" />
                      Expire Policy
                    </>
                  )}
                </Button>
              )}
              
              {/* Show waiting message if departure time hasn't passed */}
              {policy.status === 0 && !isDepartureTimePassed() && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Waiting for departure time...</span>
                </div>
              )}
            </div>
            
            {/* Flight status info */}
            <div className="mt-3 p-2 bg-gray-800/50 rounded text-xs text-gray-400">
              <p>Flight Status: {policy.flightStatus === 0 ? 'On Time' : policy.flightStatus === 1 ? 'Delayed' : 'Cancelled'}</p>
              {policy.flightStatus === 1 && (
                <p>Actual Delay: {policy.actualDelayMinutes.toString()} minutes</p>
              )}
              <p>Departure Time: {new Date(Number(policy.departureTimestamp) * 1000).toLocaleString()}</p>
              <p>Departure Status: {isDepartureTimePassed() ? '✅ Passed' : '⏳ Upcoming'}</p>
              {isEligibleForClaim() && (
                <p className="text-green-400 font-semibold">✅ Eligible for claim!</p>
              )}
              {isEligibleForExpiration() && (
                <p className="text-gray-400 font-semibold">⏳ Eligible for expiration</p>
              )}
            </div>
          </div>
        )}

        {policy.status === 1 && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <p className="text-sm font-semibold text-green-400">Payout Processed</p>
            </div>
            <p className="text-sm text-green-300">
              Payout of {formatUnits(policy.payoutAmount, 6)} PYUSD has been processed!
            </p>
          </div>
        )}

        {policy.status === 2 && (
          <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-semibold text-gray-400">Policy Expired</p>
            </div>
            <p className="text-sm text-gray-300">
              This policy has expired without payout (flight delay was below threshold).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

