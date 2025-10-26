"use client";
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackgroundBeams } from '@/components/ui/background-beams';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { FloatingNav } from '@/components/ui/floating-nav';
import { useAccount, useReadContract } from 'wagmi';
import { POLICY_ABI, POLICY_CONTRACT_ADDRESS } from '@/lib/abi';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  Plane,
  TrendingUp,
  Settings
} from 'lucide-react';

const navItems = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Create Policy",
    link: "/create",
  },
  {
    name: "My Policies",
    link: "/policies",
  },
];

export default function Home() {
  const { isConnected, address } = useAccount();
  
  // Check if user is contract owner
  const { data: contractOwner } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'owner',
  }) as { data: string | undefined };

  // Check if user is contract owner
  const isOwner = address && contractOwner && address.toLowerCase() === (contractOwner as string).toLowerCase();

  // Dynamic nav items - Admin panel always visible
  const dynamicNavItems = [
    ...navItems,
    {
      name: "Admin",
      link: "/admin",
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      <FloatingNav navItems={dynamicNavItems} />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <BackgroundBeams className="absolute inset-0" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <Image
              src="/flysure-logo.png"
              alt="FlySure Logo"
              width={120}
              height={120}
              className="drop-shadow-2xl rounded-lg"
            />
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            FlySure
          </motion.h1>
          
          <motion.p 
            className="text-2xl md:text-3xl text-white mb-4 font-light"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Instant Flight Delay Insurance
          </motion.p>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            No forms. No waiting. Get paid in PYUSD <em className="text-cyan-400">before</em> you board.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <BackgroundGradient className="rounded-full">
              <Link href="/create">
                <Button 
                  size="lg" 
                  className="bg-transparent border-0 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold"
                >
                  Get Insured Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </BackgroundGradient>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose FlySure?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of insurance with instant, transparent, and automated payouts
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-12 w-12 text-cyan-400" />,
                title: "Instant Payouts",
                description: "Receive PYUSD directly to your wallet in seconds, not weeks"
              },
              {
                icon: <Shield className="h-12 w-12 text-blue-400" />,
                title: "Trustless System",
                description: "Smart contracts handle everything automatically - no human intervention"
              },
              {
                icon: <Globe className="h-12 w-12 text-purple-400" />,
                title: "Global Coverage",
                description: "Works for any flight, anywhere in the world"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 hover:scale-105">
                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to get protected
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <DollarSign className="h-16 w-16 text-green-400" />,
                title: "1. Buy Policy",
                description: "Select your flight and pay a small premium in PYUSD. Takes less than 2 minutes.",
                color: "from-green-500 to-emerald-600"
              },
              {
                icon: <Clock className="h-16 w-16 text-yellow-400" />,
                title: "2. Flight Delayed?",
                description: "Our smart contract automatically verifies the delay with trusted flight data.",
                color: "from-yellow-500 to-orange-600"
              },
              {
                icon: <CheckCircle className="h-16 w-16 text-cyan-400" />,
                title: "3. Get Instant Payout",
                description: "Receive your full payout in PYUSD directly to your wallet. Instantly.",
                color: "from-cyan-500 to-blue-600"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <BackgroundGradient className={`rounded-2xl bg-gradient-to-br ${step.color}`}>
                  <Card className="bg-transparent border-0 shadow-none">
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-6">
                        {step.icon}
                      </div>
                      <CardTitle className="text-white text-2xl font-bold">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-white/90 text-center text-lg">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </BackgroundGradient>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Trusted by Travelers
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Policies Created" },
              { number: "$2M+", label: "PYUSD Paid Out" },
              { number: "99.9%", label: "Uptime" },
              { number: "150+", label: "Countries Covered" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Card className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                    <div className="text-gray-300">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Panel Section */}
      <section className="relative py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Admin Panel
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Mock data management for testing and demonstration
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <BackgroundGradient className="rounded-2xl">
              <Card className="bg-transparent border-0 shadow-none">
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 bg-purple-500/20 rounded-full">
                      <Shield className="h-16 w-16 text-purple-400" />
                    </div>
                  </div>
                  <CardTitle className="text-white text-3xl font-bold mb-4">
                    Admin Dashboard
                  </CardTitle>
                  <CardDescription className="text-white/80 text-lg mb-8">
                    Manage mock data for testing and demonstration purposes
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center">
                      <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold mb-2">Mock Data</h4>
                      <p className="text-white/60 text-sm">Enter delay threshold for testing</p>
                    </div>
                    <div className="text-center">
                      <Settings className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold mb-2">Testing Tools</h4>
                      <p className="text-white/60 text-sm">Simulate flight delay scenarios</p>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <h4 className="text-white font-semibold mb-2">Demo Support</h4>
                      <p className="text-white/60 text-sm">Support demonstration and testing</p>
                    </div>
                  </div>
                  
                  <Link href="/admin">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg">
                      <Shield className="mr-2 h-5 w-5" />
                      Access Admin Panel
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  
                  {!isConnected && (
                    <p className="text-yellow-400 text-sm mt-4">
                      ⚠️ Connect your wallet to access admin functions
                    </p>
                  )}
                  
                  {isConnected && !isOwner && (
                    <p className="text-yellow-400 text-sm mt-4">
                      ⚠️ Only contract owners and oracles can perform admin operations
                    </p>
                  )}
                  
                  {isConnected && isOwner && (
                    <p className="text-green-400 text-sm mt-4">
                      ✅ You have admin access
                    </p>
                  )}
                </CardContent>
              </Card>
            </BackgroundGradient>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Fly Protected?
            </h2>
            <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of travelers who trust FlySure for instant, transparent flight delay insurance.
            </p>
            <Link href="/create">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
              >
                <Plane className="mr-2 h-5 w-5" />
                Get Started Now
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}