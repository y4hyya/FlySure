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
  DollarSign,
  Clock
} from 'lucide-react';

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  
  // Oracle payout state
  const [policyId, setPolicyId] = useState('');
  const [actualDelay, setActualDelay] = useState('');
  const [isTriggeringPayout, setIsTriggeringPayout] = useState(false);

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
  const { writeContract: writeTriggerPayout, data: payoutHash } = useWriteContract();
  
  const { isLoading: isPayoutLoading, isSuccess: isPayoutSuccess } = useWaitForTransactionReceipt({ 
    hash: payoutHash 
  });

  // Oracle payout handler
  const handleTriggerPayout = async () => {
    if (!policyId || !actualDelay) {
      return;
    }

    try {
      setIsTriggeringPayout(true);
      await writeTriggerPayout({
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
      setIsTriggeringPayout(false);
    }
  };

  // Handle successful payout trigger
  useEffect(() => {
    if (isPayoutSuccess) {
      setIsTriggeringPayout(false);
      setPolicyId('');
      setActualDelay('');
    }
  }, [isPayoutSuccess]);


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


      </main>
    </div>
  );
}