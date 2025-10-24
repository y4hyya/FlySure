import Link from 'next/link';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-white to-gray-50">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-800">
          Instant Flight Delay Insurance.
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-2xl">
          No forms. No waiting. Get paid in PYUSD <em>before</em> you board.
        </p>
        <Link
          href="/create"
          className="inline-block bg-blue-600 text-white font-bold text-lg py-4 px-10 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
        >
          Get Insured Now
        </Link>
      </section>

      {/* How It Works Section */}
      <section className="w-full bg-white py-24">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-xl shadow-lg">
              <DollarSign size={40} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">1. Buy Policy</h3>
              <p className="text-gray-600">
                Select your flight and pay a small premium in PYUSD.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-xl shadow-lg">
              <Clock size={40} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">2. Flight Delayed?</h3>
              <p className="text-gray-600">
                Our smart contract automatically verifies the delay with a trusted oracle.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-xl shadow-lg">
              <CheckCircle size={40} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-semibold mb-3">3. Get Instant Payout</h3>
              <p className="text-gray-600">
                Receive your full payout in PYUSD directly to your wallet. Instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="bg-gray-800 text-white py-24">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Our Mission
          </h2>
          <p className="text-xl text-gray-300">
            To replace slow, bureaucratic insurance claims with transparent, instant, and programmatic payouts. We believe in trustless assurance, and PYUSD helps us deliver it.
          </p>
        </div>
      </section>
    </div>
  );
}
