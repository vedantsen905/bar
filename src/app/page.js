import Head from 'next/head';
import Navbar from '../components/Navbar';
import { ChartBarIcon, ClipboardDocumentCheckIcon, ArrowPathIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const features = [
    {
      name: 'Real-time Tracking',
      description: 'Monitor your stock levels in real-time across all locations.',
      icon: ChartBarIcon,
    },
    {
      name: 'Inventory Management',
      description: 'Easily add, remove, and update your bar inventory items.',
      icon: ClipboardDocumentCheckIcon,
    },
    {
      name: 'Automated Reports',
      description: 'Generate consumption and restocking reports automatically.',
      icon: ArrowPathIcon,
    },
    {
      name: 'Custom Alerts',
      description: 'Get notified when stock levels are low or items are expiring.',
      icon: AdjustmentsHorizontalIcon,
    },
  ];

  const stats = [
    { name: 'Bars Worldwide', value: '10,000+', change: '+12%', changeType: 'positive' },
    { name: 'Inventory Items', value: '500K+', change: '+8%', changeType: 'positive' },
    { name: 'Daily Transactions', value: '1.2M', change: '+5%', changeType: 'positive' },
    { name: 'Avg. Time Saved', value: '15 hrs', change: '+3 hrs', changeType: 'positive' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Head>
        <title>BarStock - Modern Bar Inventory System</title>
        <meta name="description" content="Manage your bar inventory efficiently" />
      </Head>

      <Navbar />

      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <div className="pt-10 sm:pt-16 lg:pt-8 lg:pb-14 lg:overflow-hidden">
                <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                  <div className="sm:text-center lg:text-left">
                    <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                      <span className="block">Modern</span>
                      <span className="block text-blue-500 dark:text-blue-400">Bar Inventory</span>
                      <span className="block">Management</span>
                    </h1>
                    <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                      Streamline your bar operations with our powerful inventory tracking and reporting system.
                    </p>
                    <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                      <div className="rounded-md shadow">
                        <a
                          href="/inventory"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                        >
                          Get Started
                        </a>
                      </div>
                      <div className="mt-3 sm:mt-0 sm:ml-3">
                        <a
                          href="#features"
                          className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-500 bg-blue-100 hover:bg-blue-200 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600 md:py-4 md:text-lg md:px-10 transition-colors"
                        >
                          Learn More
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 dark:bg-gray-800 pt-12 sm:pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Trusted by bars worldwide
              </h2>
              <p className="mt-3 text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
                Our system helps bars of all sizes manage their inventory efficiently.
              </p>
            </div>
          </div>
          <div className="mt-10 pb-12 bg-white dark:bg-gray-900 sm:pb-16">
            <div className="relative">
              <div className="absolute inset-0 h-1/2 bg-gray-50 dark:bg-gray-800"></div>
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                  <dl className="rounded-lg bg-white dark:bg-gray-800 shadow-lg sm:grid sm:grid-cols-4">
                    {stats.map((stat) => (
                      <div key={stat.name} className="flex flex-col border-b border-gray-100 dark:border-gray-700 p-6 text-center sm:border-0 sm:border-r dark:border-gray-700">
                        <dt className="order-2 mt-2 text-lg leading-6 font-medium text-gray-500 dark:text-gray-300">
                          {stat.name}
                        </dt>
                        <dd className="order-1 text-5xl font-extrabold text-blue-500 dark:text-blue-400">
                          {stat.value}
                        </dd>
                        <dd className={`order-3 mt-2 text-sm font-medium ${stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {stat.change}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-12 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-500 dark:text-blue-400 font-semibold tracking-wide uppercase">Features</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Everything you need to manage your bar
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-300 lg:mx-auto">
                Our system is designed to make bar inventory management simple and efficient.
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {features.map((feature) => (
                  <div key={feature.name} className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white dark:bg-blue-600">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div className="ml-16">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">{feature.name}</h3>
                      <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="bg-gray-50 dark:bg-gray-800 pt-16 pb-20 px-4 sm:px-6 lg:pt-24 lg:pb-28 lg:px-8">
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight sm:text-4xl">
                What our customers say
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
                Don't just take our word for it.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((testimonial) => (
                <div key={testimonial} className="pt-6 bg-white dark:bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center text-white font-bold">
                          {testimonial}
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Bar Owner {testimonial}</h3>
                        <p className="text-gray-500 dark:text-gray-300">Premium Member</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-base text-gray-500 dark:text-gray-300">
                        "This system has completely transformed how we manage our inventory. We've reduced waste by 30% and saved countless hours."
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-500 dark:bg-blue-600">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to dive in?</span>
              <span className="block text-blue-100 dark:text-blue-200">Start managing your bar inventory today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/inventory"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-500 bg-white hover:bg-blue-50 dark:hover:bg-gray-100 transition-colors"
                >
                  Get started
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Solutions</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Inventory</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Reporting</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Analytics</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">API Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Careers</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-base text-gray-400 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} BarStock. All rights reserved.
            </p>
            <div className="mt-8 flex space-x-6 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}