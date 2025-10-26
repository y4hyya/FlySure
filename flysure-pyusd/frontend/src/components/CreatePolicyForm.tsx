'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { POLICY_ABI, ERC20_ABI, POLICY_CONTRACT_ADDRESS, PYUSD_TOKEN_ADDRESS } from '@/lib/abi';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { 
  Plane, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react';

export function CreatePolicyForm() {
  const { address } = useAccount();
  
  // Step management state
  const [step, setStep] = useState(1);
  const [flightCode, setFlightCode] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [pnrCode, setPnrCode] = useState('');
  const [delayThreshold, setDelayThreshold] = useState(120);
  const [premiumAmount, setPremiumAmount] = useState(10);
  const [payoutAmount, setPayoutAmount] = useState(100);
  const [departureTimestamp, setDepartureTimestamp] = useState('');

  // Transaction state
  const [isApproving, setIsApproving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'approving' | 'approved' | 'creating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Flight policy validation
  const [flightAlreadyExists, setFlightAlreadyExists] = useState(false);

  // Wagmi hooks for contract writes
  const { writeContract: writeApprove, data: approveHash, error: approveError } = useWriteContract();
  const { writeContract: writeCreate, data: createHash, error: createError } = useWriteContract();
  
  // Check if flight already has a policy
  const { data: flightHasPolicy, isLoading: isCheckingFlight } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'flightHasPolicy',
    args: flightCode && flightCode.length > 0 ? [flightCode] : undefined,
    query: {
      enabled: Boolean(flightCode && flightCode.length > 0),
    },
  });

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
      30: 3,
      60: 6,
      120: 10
    };
    const multiplier = multipliers[delayThreshold as keyof typeof multipliers] || 10;
    const calculatedPayout = premiumAmount * multiplier;
    setPayoutAmount(calculatedPayout);
  }, [premiumAmount, delayThreshold]);

  // Update flight validation state when flightHasPolicy data changes
  useEffect(() => {
    if (flightCode && flightCode.length > 0) {
      if (flightHasPolicy === true) {
        setFlightAlreadyExists(true);
        setErrorMessage('This flight already has a policy. Only one policy per flight is allowed.');
      } else if (flightHasPolicy === false) {
        setFlightAlreadyExists(false);
        setErrorMessage('');
      }
    } else {
      setFlightAlreadyExists(false);
      setErrorMessage('');
    }
  }, [flightCode, flightHasPolicy]);

  const handleCreatePolicy = async () => {
    try {
      // Check if flight already has a policy
      if (flightAlreadyExists) {
        setErrorMessage('This flight already has a policy. Only one policy per flight is allowed.');
        return;
      }

      console.log('🚀 Starting policy creation...');
      setTxStatus('creating');
      setIsCreating(true);
      setIsApproving(false);

      const premium = parseUnits(premiumAmount.toString(), 6);
      const payout = parseUnits(payoutAmount.toString(), 6);

      // Convert departure timestamp to Unix timestamp
      const departureTime = departureTimestamp ? Math.floor(new Date(departureTimestamp).getTime() / 1000) : Math.floor(Date.now() / 1000) + 86400; // Default to 24 hours from now

      console.log('📋 Policy creation parameters:');
      console.log('  - Flight Code:', flightCode);
      console.log('  - Premium Amount:', premiumAmount);
      console.log('  - Premium (parsed):', premium.toString());
      console.log('  - Payout Amount:', payoutAmount);
      console.log('  - Payout (parsed):', payout.toString());
      console.log('  - Delay Threshold:', delayThreshold);
      console.log('  - Departure Time:', departureTime);
      console.log('  - Contract Address:', POLICY_CONTRACT_ADDRESS);

      console.log('⏳ Calling createPolicy function...');
      await writeCreate({
        address: POLICY_CONTRACT_ADDRESS,
        abi: POLICY_ABI,
        functionName: 'createPolicy',
        args: [
          flightCode,
          BigInt(departureTime),
          payout,
        ],
        gas: BigInt(500000), // Increased gas limit for Sepolia
      });
      console.log('✅ createPolicy transaction submitted successfully');
    } catch (error: any) {
      console.error('❌ Create policy error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      });
      setErrorMessage(`Policy creation failed: ${error.message || 'Unknown error'}`);
      setTxStatus('error');
      setIsCreating(false);
    }
  };

  // Handle approve success
  useEffect(() => {
    if (isApproveSuccess && txStatus === 'approving') {
      console.log('✅ Approval transaction confirmed! Moving to policy creation...');
      setTxStatus('approved');
      setIsApproving(false);
      handleCreatePolicy();
    }
  }, [isApproveSuccess, txStatus]);

  // Handle create success
  useEffect(() => {
    if (isCreateSuccess && txStatus === 'creating') {
      console.log('✅ Policy creation transaction confirmed!');
      setTxStatus('success');
      setSuccessMessage(`✅ Policy created successfully! Transaction: ${createHash}`);
      setFlightCode('');
      setIsCreating(false);
    }
  }, [isCreateSuccess, txStatus, createHash]);

  // Handle errors
  useEffect(() => {
    if (approveError) {
      console.error('❌ Approval transaction failed:', approveError);
      setErrorMessage(`Approval failed: ${approveError.message || 'Unknown error'}`);
      setTxStatus('error');
      setIsApproving(false);
    }
  }, [approveError]);

  useEffect(() => {
    if (createError) {
      console.error('❌ Policy creation transaction failed:', createError);
      setErrorMessage(`Policy creation failed: ${createError.message || 'Unknown error'}`);
      setTxStatus('error');
      setIsCreating(false);
    }
  }, [createError]);

  const handleApprove = async () => {
    if (!flightCode.trim()) {
      setErrorMessage('Please enter a flight code');
      return;
    }

    try {
      console.log('🔐 Starting PYUSD approval...');
      setTxStatus('approving');
      setIsApproving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const premium = parseUnits(premiumAmount.toString(), 6);
      
      console.log('📋 Approval parameters:');
      console.log('  - PYUSD Token Address:', PYUSD_TOKEN_ADDRESS);
      console.log('  - Policy Contract Address:', POLICY_CONTRACT_ADDRESS);
      console.log('  - Premium Amount:', premiumAmount);
      console.log('  - Premium (parsed):', premium.toString());

      console.log('⏳ Calling approve function...');
      await writeApprove({
        address: PYUSD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [POLICY_CONTRACT_ADDRESS, premium],
        gas: BigInt(100000), // Increased gas limit for approve
      });
      console.log('✅ approve transaction submitted successfully');
    } catch (error: any) {
      console.error('❌ Approve error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        data: error.data,
        stack: error.stack
      });
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

  const steps = [
    { id: 1, title: 'Flight Details', icon: <Plane className="h-5 w-5" /> },
    { id: 2, title: 'Policy Settings', icon: <Shield className="h-5 w-5" /> },
    { id: 3, title: 'Review & Buy', icon: <CheckCircle className="h-5 w-5" /> }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <BackgroundGradient className="rounded-2xl">
        <Card className="bg-transparent border-0 shadow-none">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-white text-3xl font-bold mb-2">
              Create Flight Insurance Policy
            </CardTitle>
            <CardDescription className="text-white/80 text-lg">
              Protect your flight with instant PYUSD payouts
            </CardDescription>
          </CardHeader>

          {/* Step Indicator */}
          <CardContent className="pb-8">
            <div className="flex justify-between items-center mb-8">
              {steps.map((stepItem, index) => (
                <div key={stepItem.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    step >= stepItem.id 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-gray-600 text-gray-400'
                  }`}>
                    {step >= stepItem.id ? stepItem.icon : stepItem.id}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step >= stepItem.id ? 'text-white' : 'text-gray-400'
                  }`}>
                    {stepItem.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      step > stepItem.id ? 'bg-blue-500' : 'bg-gray-600'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="flightCode" className="block text-sm font-medium text-white mb-2">
                        Flight Code
                      </label>
                      <Input
                        id="flightCode"
                        value={flightCode}
                        onChange={(e) => setFlightCode(e.target.value.toUpperCase())}
                        placeholder="TK1984"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                      {/* Flight validation indicator */}
                      {flightCode && (
                        <div className="mt-2 flex items-center gap-2">
                          {isCheckingFlight ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                              <span className="text-sm text-blue-400">Checking flight availability...</span>
                            </>
                          ) : flightAlreadyExists ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-red-400" />
                              <span className="text-sm text-red-400">This flight already has a policy</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-green-400">Flight available for policy</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label htmlFor="departureAirport" className="block text-sm font-medium text-white mb-2">
                        Departure Airport
                      </label>
                      <Input
                        id="departureAirport"
                        value={departureAirport}
                        onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
                        placeholder="IST"
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="pnrCode" className="block text-sm font-medium text-white mb-2">
                      PNR Code
                    </label>
                    <Input
                      id="pnrCode"
                      value={pnrCode}
                      onChange={(e) => setPnrCode(e.target.value.toUpperCase())}
                      placeholder="A4T5P2"
                      maxLength={6}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    />
                    <p className="text-xs text-white/60 mt-1">
                      Enter your 6-digit PNR code found on your ticket
                    </p>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <label className="block text-lg font-medium text-white mb-4">
                      Delay Threshold
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[30, 60, 120].map((time) => (
                        <Button
                          key={time}
                          variant={delayThreshold === time ? "default" : "outline"}
                          onClick={() => setDelayThreshold(time)}
                          className={`h-20 flex flex-col ${
                            delayThreshold === time 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                          }`}
                        >
                          <span className="text-2xl font-bold">{time}</span>
                          <span className="text-sm">Minutes</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="premium" className="block text-lg font-medium text-white mb-4">
                      Premium Amount (PYUSD)
                    </label>
                    <div className="space-y-4">
                      <input
                        type="range"
                        id="premium"
                        min="1"
                        max="100"
                        value={premiumAmount}
                        onChange={(e) => setPremiumAmount(Number(e.target.value))}
                        className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                      />
                      <div className="text-center">
                        <span className="text-3xl font-bold text-white">
                          {premiumAmount} PYUSD
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-green-500/20 rounded-lg text-center">
                    <p className="text-white/80 mb-2">
                      If delayed by {delayThreshold} minutes or more:
                    </p>
                    <span className="text-4xl font-bold text-green-400">
                      {payoutAmount} PYUSD
                    </span>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <Card className="bg-white/10 border-white/20">
                    <CardHeader>
                      <CardTitle className="text-white">Policy Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/80">Flight Code:</span>
                        <span className="text-white font-semibold">{flightCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">PNR Code:</span>
                        <span className="text-white font-semibold">{pnrCode || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Departure Airport:</span>
                        <span className="text-white font-semibold">{departureAirport || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/80">Delay Threshold:</span>
                        <span className="text-white font-semibold">{delayThreshold} minutes</span>
                      </div>
                      <div className="flex justify-between text-blue-300">
                        <span className="font-medium">Premium:</span>
                        <span className="font-bold text-xl">{premiumAmount} PYUSD</span>
                      </div>
                      <div className="flex justify-between text-green-300">
                        <span className="font-medium">Payout:</span>
                        <span className="font-bold text-xl">{payoutAmount} PYUSD</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Status Messages */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/50 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <p className="text-red-300">{errorMessage}</p>
                      </div>
                      <Button
                        onClick={resetForm}
                        variant="outline"
                        size="sm"
                        className="mt-2 bg-transparent border-red-500/50 text-red-300 hover:bg-red-500/20"
                      >
                        Try again
                      </Button>
                    </motion.div>
                  )}

                  {successMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/20 border border-green-500/50 rounded-lg p-4"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-400" />
                        <p className="text-green-300">{successMessage}</p>
                      </div>
                      {createHash && (
                        <a
                          href={`http://localhost:8545`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-sm text-green-400 hover:text-green-300 underline inline-block"
                        >
                          View transaction →
                        </a>
                      )}
                    </motion.div>
                  )}

                  {/* Transaction Status */}
                  {(isApproving || isCreating) && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-3">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
                        <div className="flex-1">
                          {isApproving && (
                            <div>
                              <p className="text-sm font-medium text-blue-300">
                                Step 1/2: Approving PYUSD...
                                {isApproveLoading && ' (Waiting for confirmation...)'}
                              </p>
                              {approveHash && (
                                <a
                                  href={`http://localhost:8545`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                  View transaction →
                                </a>
                              )}
                            </div>
                          )}
                          {isCreating && (
                            <div>
                              <p className="text-sm font-medium text-blue-300">
                                Step 2/2: Creating policy...
                                {isCreateLoading && ' (Waiting for confirmation...)'}
                              </p>
                              {createHash && (
                                <a
                                  href={`http://localhost:8545`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                                >
                                  View transaction →
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {step > 1 && (
                <Button
                  onClick={() => setStep(step - 1)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}
              
              {step === 1 && (
                <Button
                  onClick={() => setStep(2)}
                  disabled={!flightCode.trim() || flightAlreadyExists || isCheckingFlight}
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              {step === 2 && (
                <Button
                  onClick={() => setStep(3)}
                  className="ml-auto bg-blue-600 hover:bg-blue-700"
                >
                  Review Policy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              
              {step === 3 && (
                <Button
                  onClick={handleBuyPolicy}
                  disabled={isApproving || isCreating || flightAlreadyExists}
                  className={`ml-auto ${
                    isApproving || isCreating || flightAlreadyExists
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving PYUSD...
                    </>
                  ) : isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Policy...
                    </>
                  ) : (
                    <>
                      <DollarSign className="mr-2 h-4 w-4" />
                      Buy Policy
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Additional Info */}
            {step === 3 && (
              <div className="mt-6 text-center text-sm text-white/60">
                <p>
                  Make sure you have at least {premiumAmount} PYUSD in your wallet.
                </p>
                <a
                  href="https://faucet.paxos.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Get testnet PYUSD →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </BackgroundGradient>
    </div>
  );
}