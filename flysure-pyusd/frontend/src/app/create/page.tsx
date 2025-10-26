'use client';

import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { CreatePolicyForm } from '@/components/CreatePolicyForm';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { ArrowLeft, Shield, Wallet, CheckCircle } from 'lucide-react';

export default function CreatePolicyPage() {
  const { isConnected } = useAccount();

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

      <main className="max-w-4xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Create Your Policy
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Protect your flight with instant PYUSD payouts when delays occur
          </p>
        </motion.div>

        {isConnected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <CreatePolicyForm />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <BackgroundGradient className="rounded-2xl">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="text-center pb-8">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-blue-500/20 rounded-full">
                      <Wallet className="h-16 w-16 text-blue-400" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-3xl font-bold mb-4">
                    Connect Your Wallet
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg">
                    Please connect your wallet to create a flight insurance policy
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-8">
                    <ConnectButton />
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-white/70">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Instant</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Transparent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BackgroundGradient>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          {[
            {
              icon: <Shield className="h-8 w-8 text-cyan-400" />,
              title: "Smart Contract Protection",
              description: "Your policy is secured by blockchain technology"
            },
            {
              icon: <CheckCircle className="h-8 w-8 text-green-400" />,
              title: "Automatic Payouts",
              description: "No claims process - payouts happen automatically"
            },
            {
              icon: <Wallet className="h-8 w-8 text-purple-400" />,
              title: "PYUSD Stablecoin",
              description: "Receive payments in stable USD-pegged currency"
            }
          ].map((feature, index) => (
            <Card key={index} className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        {/* Status Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
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
            <div className="flex items-center gap-2">
              <span>🔒</span>
              <span>Smart Contract Secured</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}