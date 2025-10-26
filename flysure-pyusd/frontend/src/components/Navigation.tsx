'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { POLICY_ABI, POLICY_CONTRACT_ADDRESS } from '@/lib/abi';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const { isConnected, address } = useAccount();
  const pathname = usePathname();

  // Check if user is contract owner
  const { data: contractOwner } = useReadContract({
    address: POLICY_CONTRACT_ADDRESS,
    abi: POLICY_ABI,
    functionName: 'owner',
  }) as { data: string | undefined };

  const isOwner = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-md">
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-3">
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <Image
            src="/flysure-logo.png"
            alt="FlySure Logo"
            width={40}
            height={40}
            className="mr-3 rounded"
          />
          <div>
            <h1 className="text-2xl font-bold text-blue-600">FlySure</h1>
            <span className="text-sm text-gray-500">PYUSD Insurance</span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          {isConnected && (
            <div className="flex gap-4">
              <Link
                href="/create"
                className={`text-gray-600 hover:text-blue-600 transition-colors py-2 ${
                  isActive('/create') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Create Policy
              </Link>
              <Link
                href="/policies"
                className={`text-gray-600 hover:text-blue-600 transition-colors py-2 ${
                  isActive('/policies') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                My Policies
              </Link>
            </div>
          )}
          
          {isConnected && isOwner && (
            <Link
              href="/admin"
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/admin')
                  ? 'bg-purple-700 text-white'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              <span>👨‍💼</span>
              <span>Admin Panel</span>
            </Link>
          )}
          
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}

