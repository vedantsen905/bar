'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaWineBottle, FaBeer, FaCocktail, FaChartLine } from 'react-icons/fa';

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <FaWineBottle className="text-4xl text-purple-500" />,
      title: "Inventory Tracking",
      description: "Real-time monitoring of all your bar stock"
    },
    {
      icon: <FaBeer className="text-4xl text-amber-500" />,
      title: "Smart Alerts",
      description: "Get notified when stock runs low"
    },
    {
      icon: <FaCocktail className="text-4xl text-pink-500" />,
      title: "Recipe Management",
      description: "Track ingredients for signature cocktails"
    },
    {
      icon: <FaChartLine className="text-4xl text-blue-500" />,
      title: "Analytics Dashboard",
      description: "Visualize sales and consumption patterns"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/bar-pattern.svg')] bg-repeat opacity-5"></div>
        
        <div className="container mx-auto px-6 py-24 md:py-32 text-center relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-6xl font-extrabold mb-6"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Bar Inventory Pro
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10"
          >
            Revolutionize how you manage your bar's inventory with AI-powered insights and real-time tracking.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <button 
              onClick={() => router.push('/register')}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              Get Started Free
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-3 border border-gray-600 rounded-full font-medium hover:bg-gray-800/50 transition-all"
            >
              Existing User? Login
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-800/30">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Powerful Features for <span className="text-blue-400">Your Bar</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-800/50 p-8 rounded-xl hover:bg-gray-700/50 transition-all border border-gray-700 hover:border-blue-400/30"
              >
                <div className="flex justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900/50 to-purple-900/50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Bar Management?
          </h2>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Join hundreds of bars and restaurants using our system to save time and reduce waste.
          </p>
          <button 
            onClick={() => router.push('/register')}
            className="px-10 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-200 transition-all shadow-lg hover:shadow-xl"
          >
            Start Your 14-Day Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}