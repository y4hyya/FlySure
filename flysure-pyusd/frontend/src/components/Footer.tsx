'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BackgroundGradient } from '@/components/ui/background-gradient';
import { Button } from '@/components/ui/button';
import { 
  Plane, 
  Shield, 
  DollarSign, 
  Globe, 
  Twitter, 
  Github, 
  Linkedin,
  Mail,
  ArrowUp
} from 'lucide-react';
import Link from 'next/link';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-black border-t border-gray-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <BackgroundGradient className="rounded-full">
                  <div className="p-3 bg-transparent">
                    <Plane className="h-8 w-8 text-white" />
                  </div>
                </BackgroundGradient>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400">
                  FlySure
                </h3>
              </div>
              <p className="text-gray-300 text-lg mb-6 max-w-md">
                Instant flight delay insurance powered by PYUSD. No forms, no waiting, 
                get paid before you board.
              </p>
              <div className="flex gap-4">
                <BackgroundGradient className="rounded-full">
                  <Button variant="ghost" size="sm" className="bg-transparent border-0 text-white hover:bg-white/10">
                    <Twitter className="h-4 w-4" />
                  </Button>
                </BackgroundGradient>
                <BackgroundGradient className="rounded-full">
                  <Button variant="ghost" size="sm" className="bg-transparent border-0 text-white hover:bg-white/10">
                    <Github className="h-4 w-4" />
                  </Button>
                </BackgroundGradient>
                <BackgroundGradient className="rounded-full">
                  <Button variant="ghost" size="sm" className="bg-transparent border-0 text-white hover:bg-white/10">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </BackgroundGradient>
                <BackgroundGradient className="rounded-full">
                  <Button variant="ghost" size="sm" className="bg-transparent border-0 text-white hover:bg-white/10">
                    <Mail className="h-4 w-4" />
                  </Button>
                </BackgroundGradient>
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-3">
                <Link href="/" className="block text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
                <Link href="/create" className="block text-gray-400 hover:text-white transition-colors">
                  Create Policy
                </Link>
                <Link href="/policies" className="block text-gray-400 hover:text-white transition-colors">
                  My Policies
                </Link>
                <Link href="/admin" className="block text-gray-400 hover:text-white transition-colors">
                  Admin Panel
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Features */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Instant Payouts</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <DollarSign className="h-4 w-4 text-blue-400" />
                  <span>PYUSD Powered</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Globe className="h-4 w-4 text-purple-400" />
                  <span>Global Coverage</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Plane className="h-4 w-4 text-cyan-400" />
                  <span>Smart Contracts</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
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
            
            <div className="flex items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 FlySure. A hackathon project.
              </p>
              <BackgroundGradient className="rounded-full">
                <Button
                  onClick={scrollToTop}
                  variant="ghost"
                  size="sm"
                  className="bg-transparent border-0 text-white hover:bg-white/10"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </BackgroundGradient>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

