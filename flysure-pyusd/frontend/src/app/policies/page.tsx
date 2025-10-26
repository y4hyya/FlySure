'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MyPolicies } from '@/components/MyPolicies';
import { motion } from 'framer-motion';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Shield, FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PoliciesPage() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <BackgroundBeams className="absolute inset-0" />
      
      {/* Header */}
      <div className="relative z-10 pt-20 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-4 mb-8"
          >
            <BackgroundGradient className="rounded-full">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="bg-transparent border-0 text-white hover:bg-white/10"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </BackgroundGradient>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
              My Policies
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Manage and track your flight insurance policies
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          {isConnected ? (
            <MyPolicies />
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="bg-gray-900/50 border-gray-800 max-w-2xl mx-auto">
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-6">
                    <BackgroundGradient className="rounded-full">
                      <div className="p-4 bg-transparent">
                        <Shield className="h-16 w-16 text-white" />
                      </div>
                    </BackgroundGradient>
                  </div>
                  <CardTitle className="text-2xl text-white mb-2">
                    Connect Your Wallet
                  </CardTitle>
                  <CardDescription className="text-gray-300 text-lg">
                    Please connect your wallet to view your insurance policies
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <BackgroundGradient className="rounded-full">
                    <ConnectButton />
                  </BackgroundGradient>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Sepolia Testnet</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💵</span>
                <span>Powered by PYUSD</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

