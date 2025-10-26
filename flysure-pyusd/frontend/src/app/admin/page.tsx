'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { POLICY_ABI, POLICY_CONTRACT_ADDRESS } from '@/lib/abi';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { 
  ArrowLeft, 
  Shield, 
  Settings, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Crown,
  Zap,
  Eye,
  Play,
  Plus,
  User,
  Plane,
  DollarSign,
  Clock
} from 'lucide-react';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const [flightId, setFlightId] = useState('');
  const [mockDelayThreshold, setMockDelayThreshold] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

         // Oracle payout state
         const [policyId, setPolicyId] = useState('');
         const [actualDelay, setActualDelay] = useState('');
         const [isTriggeringPayout, setIsTriggeringPayout] = useState(false);

         // Oracle flight status update state
         const [flightStatusPolicyId, setFlightStatusPolicyId] = useState('');
         const [flightStatus, setFlightStatus] = useState('0'); // 0=OnTime, 1=Delayed, 2=Cancelled
         const [flightDelayMinutes, setFlightDelayMinutes] = useState('');
         const [isUpdatingFlightStatus, setIsUpdatingFlightStatus] = useState(false);

  // Read contract owner
  const { data: contractOwner } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'owner',
  });

  // Read oracle address
  const { data: oracleAddress } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'oracleAddress',
  });

  // Hardcoded admin addresses (add your wallet address here)
  const adminAddresses = [
    '0x24aAdc7F4884A027364A5D4A8fe4d7cf648415FD', // Your Sepolia address (contract owner)
    // Add more admin addresses here as needed
  ];
  
  // Check if user is owner, oracle, or hardcoded admin
  const isOwner = address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase();
  const isOracle = address && oracleAddress && address.toLowerCase() === (oracleAddress as string).toLowerCase();
  const isHardcodedAdmin = address && adminAddresses.some(adminAddr => 
    address.toLowerCase() === adminAddr.toLowerCase()
  );
  const hasAdminAccess = isOwner || isOracle || isHardcodedAdmin;

  // Write contract hooks
  const { writeContract: writeCreatePolicy, data: createHash } = useWriteContract();
  const { writeContract: writeTriggerPayout, data: payoutHash } = useWriteContract();
  const { writeContract: writeUpdateFlightStatus, data: flightStatusHash } = useWriteContract();
  
  const { isLoading: isCreateLoading, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ 
    hash: createHash 
  });
  
  const { isLoading: isPayoutLoading, isSuccess: isPayoutSuccess } = useWaitForTransactionReceipt({ 
    hash: payoutHash 
  });

  const { isLoading: isFlightStatusLoading, isSuccess: isFlightStatusSuccess } = useWaitForTransactionReceipt({ 
    hash: flightStatusHash 
  });

  // Real policy creation handler
  const handleCreatePolicy = async () => {
    if (!flightId || !mockDelayThreshold) {
      setErrorMessage('Please fill in both Flight ID and Delay Threshold');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Set default values for premium and payout
      const premiumAmount = BigInt(10 * 1000000); // 10 PYUSD
      const payoutAmount = BigInt(100 * 1000000); // 100 PYUSD
      const threshold = BigInt(mockDelayThreshold);
      const departureTime = BigInt(Math.floor(Date.now() / 1000) + 86400); // 24 hours from now

      writeCreatePolicy({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'createPolicy',
        args: [
          flightId,
          premiumAmount,
          payoutAmount,
          threshold,
          departureTime,
        ],
      });
    } catch (error: any) {
      console.error('Create policy error:', error);
      setErrorMessage(`Failed to create policy: ${error.message || 'Unknown error'}`);
      setIsProcessing(false);
    }
  };

  // Oracle flight status update handler
  const handleUpdateFlightStatus = async () => {
    if (!flightStatusPolicyId || !flightDelayMinutes) {
      setErrorMessage('Please fill in Policy ID and Delay Minutes');
      return;
    }

    try {
      setIsUpdatingFlightStatus(true);
      setErrorMessage('');
      setSuccessMessage('');

      writeUpdateFlightStatus({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'updateFlightStatus',
        args: [
          BigInt(flightStatusPolicyId),
          BigInt(flightStatus), // 0=OnTime, 1=Delayed, 2=Cancelled
          BigInt(flightDelayMinutes),
        ],
      });
    } catch (error: any) {
      console.error('Update flight status error:', error);
      setErrorMessage(`Failed to update flight status: ${error.message || 'Unknown error'}`);
      setIsUpdatingFlightStatus(false);
    }
  };

  // Oracle payout handler
  const handleTriggerPayout = async () => {
    if (!policyId || !actualDelay) {
      setErrorMessage('Please fill in both Policy ID and Actual Delay');
      return;
    }

    try {
      setIsTriggeringPayout(true);
      setErrorMessage('');
      setSuccessMessage('');

      writeTriggerPayout({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'triggerPayout',
        args: [
          BigInt(policyId),
          BigInt(actualDelay),
        ],
      });
    } catch (error: any) {
      console.error('Trigger payout error:', error);
      setErrorMessage(`Failed to trigger payout: ${error.message || 'Unknown error'}`);
      setIsTriggeringPayout(false);
    }
  };

  // Handle successful policy creation
  useEffect(() => {
    if (isCreateSuccess) {
      setSuccessMessage(`✅ Policy created successfully! Flight: ${flightId}, Delay Threshold: ${mockDelayThreshold} minutes`);
      setIsProcessing(false);
      setFlightId('');
      setMockDelayThreshold('');
    }
  }, [isCreateSuccess, flightId, mockDelayThreshold]);

  // Handle successful payout trigger
  useEffect(() => {
    if (isPayoutSuccess) {
      setSuccessMessage(`✅ Payout triggered successfully! Policy: ${policyId}, Delay: ${actualDelay} minutes`);
      setIsTriggeringPayout(false);
      setPolicyId('');
      setActualDelay('');
    }
  }, [isPayoutSuccess, policyId, actualDelay]);

  // Handle successful flight status update
  useEffect(() => {
    if (isFlightStatusSuccess) {
      const statusText = flightStatus === '0' ? 'On Time' : flightStatus === '1' ? 'Delayed' : 'Cancelled';
      setSuccessMessage(`✅ Flight status updated successfully! Policy: ${flightStatusPolicyId}, Status: ${statusText}, Delay: ${flightDelayMinutes} minutes`);
      setIsUpdatingFlightStatus(false);
      setFlightStatusPolicyId('');
      setFlightDelayMinutes('');
      setFlightStatus('0');
    }
  }, [isFlightStatusSuccess, flightStatusPolicyId, flightDelayMinutes, flightStatus]);


  // Not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <BackgroundGradient className="rounded-2xl">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-500/20 rounded-full">
                    <Shield className="h-16 w-16 text-red-400" />
                  </div>
                </div>
                <CardTitle className="text-white text-2xl font-bold">Admin Panel</CardTitle>
                <CardDescription className="text-white/80">
                  Please connect your wallet to access the admin panel
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Go to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </motion.div>
      </div>
    );
  }

  // Not owner or oracle
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <BackgroundGradient className="rounded-2xl">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-red-500/20 rounded-full">
                    <AlertCircle className="h-16 w-16 text-red-400" />
                  </div>
                </div>
                <CardTitle className="text-white text-2xl font-bold">Access Denied</CardTitle>
                <CardDescription className="text-white/80">
                  Only contract owner, oracle, or authorized admin can access this page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/10 rounded-lg p-4 text-left">
                  <p className="text-white/60 text-sm mb-2">Your Address:</p>
                  <p className="text-white text-xs font-mono break-all">{address}</p>
                  <p className="text-white/60 text-sm mt-3 mb-2">Contract Owner:</p>
                  <p className="text-white text-xs font-mono break-all">{String(contractOwner) || 'Loading...'}</p>
                  <p className="text-white/60 text-sm mt-3 mb-2">Oracle Address:</p>
                  <p className="text-white text-xs font-mono break-all">{String(oracleAddress) || 'Not set'}</p>
                  <p className="text-white/60 text-sm mt-3 mb-2">Authorized Admin Addresses:</p>
                  {adminAddresses.map((adminAddr, index) => (
                    <p key={index} className="text-white text-xs font-mono break-all">
                      {adminAddr}
                    </p>
                  ))}
                </div>
                <Link href="/">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Go to Home
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </motion.div>
      </div>
    );
  }

  // Owner view
  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="relative z-10 p-6">
        <Link href="/">
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Admin Panel
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-4">
            Create Policies and Manage Mock Data
          </p>
          
          {/* Admin Status Indicator */}
          <div className="flex justify-center mb-6">
            <div className="bg-green-500/20 border border-green-500/30 rounded-full px-4 py-2 flex items-center gap-2">
              <Crown className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">
                {isOwner ? 'Contract Owner' : isOracle ? 'Oracle' : 'Authorized Admin'}
              </span>
            </div>
          </div>
          
          {/* Your Address Display */}
          <div className="bg-white/10 rounded-lg p-3 max-w-md mx-auto">
            <p className="text-white/60 text-sm mb-1">Your Address:</p>
            <p className="text-white text-xs font-mono break-all">{address}</p>
          </div>
        </motion.div>

        {/* Policy Creation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <BackgroundGradient className="rounded-2xl">
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-blue-500/20 rounded-full">
                    <Plane className="h-16 w-16 text-blue-400" />
                  </div>
                </div>
                <CardTitle className="text-white text-3xl font-bold mb-4">
                  Create Policy
                </CardTitle>
                <CardDescription className="text-white/80 text-lg">
                  Enter Flight ID and Delay Threshold to create a new policy
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Messages */}
                <AnimatePresence>
                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <p className="text-green-300">{successMessage}</p>
                      </div>
                    </motion.div>
                  )}

                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <p className="text-red-300">{errorMessage}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Flight ID
                    </label>
                    <Input
                      type="text"
                      value={flightId}
                      onChange={(e) => setFlightId(e.target.value)}
                      placeholder="e.g., TK1234"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <p className="text-xs text-white/60 mt-2">
                      💡 Enter the flight ID for the specific policy
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Delay Threshold (minutes)
                    </label>
                    <Input
                      type="number"
                      value={mockDelayThreshold}
                      onChange={(e) => setMockDelayThreshold(e.target.value)}
                      placeholder="e.g., 120"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <p className="text-xs text-white/60 mt-2">
                      💡 Enter the delay threshold in minutes for this flight
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleCreatePolicy}
                  disabled={isProcessing || isCreateLoading || !flightId || !mockDelayThreshold}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
                >
                  {isProcessing || isCreateLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Policy...
                    </>
                  ) : (
                    <>
                      <Plane className="mr-2 h-4 w-4" />
                      Create Policy
                    </>
                  )}
                </Button>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-400" />
                    <p className="text-sm font-semibold text-blue-400">Mock Data Purpose</p>
                  </div>
                  <p className="text-sm text-blue-300">
                    This creates a real policy on the blockchain. The policy will appear in "My Policies" 
                    section and can be used for testing flight delay scenarios.
                  </p>
                </div>
              </CardContent>
            </Card>
          </BackgroundGradient>
        </motion.div>

        {/* Oracle Payout Section */}
        {isOracle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <BackgroundGradient className="rounded-2xl">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-green-500/20 rounded-full">
                      <Zap className="h-16 w-16 text-green-400" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-3xl font-bold mb-4">
                    Oracle Payout Trigger
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg">
                    Trigger policy payouts based on actual flight delays
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Policy ID
                      </label>
                      <Input
                        type="number"
                        value={policyId}
                        onChange={(e) => setPolicyId(e.target.value)}
                        placeholder="e.g., 1"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <p className="text-xs text-white/60 mt-2">
                        💡 Enter the policy ID to process
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Actual Delay (minutes)
                      </label>
                      <Input
                        type="number"
                        value={actualDelay}
                        onChange={(e) => setActualDelay(e.target.value)}
                        placeholder="e.g., 150"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <p className="text-xs text-white/60 mt-2">
                        💡 Enter the actual flight delay in minutes
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleTriggerPayout}
                    disabled={isTriggeringPayout || isPayoutLoading || !policyId || !actualDelay}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600"
                  >
                    {isTriggeringPayout || isPayoutLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Triggering Payout...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Trigger Payout
                      </>
                    )}
                  </Button>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-green-400" />
                      <p className="text-sm font-semibold text-green-400">Oracle Function</p>
                    </div>
                    <p className="text-sm text-green-300">
                      This function processes policy payouts. If delay ≥ threshold: pays out PYUSD. 
                      If delay &lt; threshold: expires policy without payout.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </BackgroundGradient>
          </motion.div>
        )}

        {/* Oracle Flight Status Update Section */}
        {isOracle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl mx-auto mt-12"
          >
            <BackgroundGradient className="rounded-2xl">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-purple-500/20 rounded-full">
                      <Plane className="h-16 w-16 text-purple-400" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-3xl font-bold mb-4">
                    Flight Status Update
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg">
                    Update flight status from external oracle data (Chainlink, etc.)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Policy ID
                      </label>
                      <Input
                        type="number"
                        value={flightStatusPolicyId}
                        onChange={(e) => setFlightStatusPolicyId(e.target.value)}
                        placeholder="e.g., 1"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <p className="text-xs text-white/60 mt-2">
                        💡 Enter the policy ID to update
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Flight Status
                      </label>
                      <select
                        value={flightStatus}
                        onChange={(e) => setFlightStatus(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                        aria-label="Flight Status"
                      >
                        <option value="0" className="bg-black text-white">On Time</option>
                        <option value="1" className="bg-black text-white">Delayed</option>
                        <option value="2" className="bg-black text-white">Cancelled</option>
                      </select>
                      <p className="text-xs text-white/60 mt-2">
                        💡 Select the flight status
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Delay Minutes
                      </label>
                      <Input
                        type="number"
                        value={flightDelayMinutes}
                        onChange={(e) => setFlightDelayMinutes(e.target.value)}
                        placeholder="e.g., 150"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      <p className="text-xs text-white/60 mt-2">
                        💡 Enter actual delay in minutes
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={handleUpdateFlightStatus}
                    disabled={isUpdatingFlightStatus || isFlightStatusLoading || !flightStatusPolicyId || !flightDelayMinutes}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600"
                  >
                    {isUpdatingFlightStatus || isFlightStatusLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Status...
                      </>
                    ) : (
                      <>
                        <Plane className="mr-2 h-4 w-4" />
                        Update Flight Status
                      </>
                    )}
                  </Button>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-purple-400" />
                      <p className="text-sm font-semibold text-purple-400">Parametric Trigger</p>
                    </div>
                    <p className="text-sm text-purple-300">
                      This is the main oracle function that automatically processes payouts based on flight status:
                      <br />• <strong>On Time:</strong> Policy expires, no payout
                      <br />• <strong>Delayed:</strong> Pays out if delay ≥ threshold
                      <br />• <strong>Cancelled:</strong> Full payout regardless of threshold
                    </p>
                  </div>
                </CardContent>
              </Card>
            </BackgroundGradient>
          </motion.div>
        )}

      </main>
    </div>
  );
}