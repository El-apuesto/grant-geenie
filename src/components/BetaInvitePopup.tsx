import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function BetaInvitePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show popup after 1 second delay
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-all z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-8 rounded-t-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <span className="text-6xl">🚀</span>
            </div>
            <h2 className="text-4xl font-bold text-center mb-2">Launch Special!</h2>
            <p className="text-xl text-center font-semibold">Stop Overpaying for Grant Tools</p>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Feature</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-emerald-600">Grant Hustle</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">Instrumentl</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">GrantWatch</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-500">Candid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-emerald-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Monthly Price</td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600">$27.99</div>
                    <div className="text-xs text-gray-600">($9.99 first month)</div>
                  </td>
                  <td className="px-6 py-4 text-center text-lg font-semibold text-gray-700">$179</td>
                  <td className="px-6 py-4 text-center text-lg font-semibold text-gray-700">$49.99</td>
                  <td className="px-6 py-4 text-center text-lg font-semibold text-gray-700">$159</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">8,000+ Grant Database</td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-gray-400 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">State-Specific Filtering</td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center text-gray-500 text-xs">Limited</td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-gray-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Fiscal Sponsor Matching</td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-6 h-6 text-red-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-6 h-6 text-red-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-6 h-6 text-red-400 mx-auto" /></td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">AI Letter of Intent Generator</td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-6 h-6 text-red-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-6 h-6 text-red-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-6 h-6 text-red-400 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Deadline Calendar</td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-emerald-600 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><Check className="w-6 h-6 text-gray-400 mx-auto" /></td>
                  <td className="px-6 py-4 text-center"><X className="w-6 h-6 text-red-400 mx-auto" /></td>
                </tr>
                <tr className="bg-emerald-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Built For</td>
                  <td className="px-6 py-4 text-center text-xs font-semibold text-emerald-700">Small nonprofits, artists, solopreneurs</td>
                  <td className="px-6 py-4 text-center text-xs text-gray-600">Large nonprofits</td>
                  <td className="px-6 py-4 text-center text-xs text-gray-600">General</td>
                  <td className="px-6 py-4 text-center text-xs text-gray-600">Researchers</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Launch Pricing */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {/* FIRST10 */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-3 border-amber-400 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-bold">FIRST 10 ONLY</span>
              </div>
              <div className="text-center mt-4">
                <p className="text-3xl font-bold text-gray-900 mb-2">$2.80<span className="text-lg">/month</span></p>
                <p className="text-sm font-semibold text-amber-700 mb-4">90% OFF FOREVER</p>
                <div className="bg-white rounded-lg p-3 mb-4">
                  <p className="font-mono font-bold text-xl text-amber-600">FIRST10</p>
                </div>
                <ul className="text-left text-sm space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>First month: $9.99</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Then $2.80/month for life</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Priority support forever</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All features included</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* LAUNCH40 */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold">EVERYONE ELSE</span>
              </div>
              <div className="text-center mt-4">
                <p className="text-3xl font-bold text-gray-900 mb-2">$16.79<span className="text-lg">/month</span></p>
                <p className="text-sm font-semibold text-blue-700 mb-4">40% OFF FOREVER</p>
                <div className="bg-white rounded-lg p-3 mb-4">
                  <p className="font-mono font-bold text-xl text-blue-600">LAUNCH40</p>
                </div>
                <ul className="text-left text-sm space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>First month: $9.99</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Then $16.79/month for life</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Still 84% cheaper than Instrumentl</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-emerald-600 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All features included</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl p-6">
            <p className="text-2xl font-bold mb-2">Ready to Stop Overpaying?</p>
            <p className="text-lg mb-4">First month just $9.99 • No contract • Cancel anytime</p>
            <button
              onClick={() => setIsOpen(false)}
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Started Now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}