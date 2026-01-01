import { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function BetaInvitePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen the popup before
    const hasSeenPopup = localStorage.getItem('hasSeenMasterclassPopup');
    
    if (!hasSeenPopup) {
      // Show popup after 1 second delay
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenMasterclassPopup', 'true');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-all z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">🎁 FREE Bonus Gift</h1>
            <p className="text-2xl text-gray-700">Grant Writing Masterclass</p>
            <p className="text-xl text-indigo-600 font-semibold mt-2">Worth $297 - Yours FREE!</p>
          </div>

          {/* Main Content Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl mb-8">
              <h2 className="text-3xl font-bold mb-4">What You Get FREE When You Subscribe:</h2>
              <ul className="space-y-3 text-lg">
                <li className="flex items-start">
                  <span className="mr-3 text-2xl">✅</span>
                  <span><strong>47-Page Grant Writing Masterclass</strong> - Expert strategies used by successful nonprofits</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-2xl">✅</span>
                  <span><strong>Application Templates Library</strong> - 4 proven templates to speed up your process</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-2xl">✅</span>
                  <span><strong>AI-Powered LOI Generator</strong> - Create compelling letters in minutes</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-2xl">✅</span>
                  <span><strong>400+ Fiscal Sponsor Database</strong> - Find the perfect sponsor for your project</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-3 text-2xl">💰</span>
                  <span><strong>First Month: Just $9.99</strong> - Save $18 (70% off regular $27.99/month)</span>
                </li>
              </ul>
            </div>

            {/* Why This Matters */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Why This Is Worth $297:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border-l-4 border-indigo-500 pl-4">
                  <p className="font-semibold text-gray-900">Comparable Courses:</p>
                  <p className="text-gray-600">• Instrumentl: $179/month</p>
                  <p className="text-gray-600">• Grant Writing Workshops: $200-500</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="font-semibold text-gray-900">Professional Services:</p>
                  <p className="text-gray-600">• Grant Consultants: $1,000+ per proposal</p>
                  <p className="text-gray-600">• Professional Training: $297+</p>
                </div>
              </div>
            </div>

            {/* Competitive Comparison */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🏆 Why Grant Hustle Wins:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-3 text-left font-semibold">Feature</th>
                      <th className="p-3 text-center font-semibold bg-indigo-100">Grant Hustle</th>
                      <th className="p-3 text-center">Instrumentl</th>
                      <th className="p-3 text-center">GrantWatch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="p-3 font-medium">Price</td>
                      <td className="p-3 text-center bg-indigo-50"><strong className="text-indigo-600">$27.99/mo</strong></td>
                      <td className="p-3 text-center text-gray-600">$179/mo</td>
                      <td className="p-3 text-center text-gray-600">$49-99/mo</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Fiscal Sponsor Matcher</td>
                      <td className="p-3 text-center bg-indigo-50">
                        <span className="text-2xl">✅</span>
                        <br />
                        <small>400+ sponsors</small>
                      </td>
                      <td className="p-3 text-center"><span className="text-2xl">❌</span></td>
                      <td className="p-3 text-center"><span className="text-2xl">❌</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">AI LOI Generator</td>
                      <td className="p-3 text-center bg-indigo-50"><span className="text-2xl">✅</span></td>
                      <td className="p-3 text-center"><span className="text-2xl">❌</span></td>
                      <td className="p-3 text-center"><span className="text-2xl">❌</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">Application Templates</td>
                      <td className="p-3 text-center bg-indigo-50">
                        <span className="text-2xl">✅</span>
                        <br />
                        <small>4 templates</small>
                      </td>
                      <td className="p-3 text-center"><span className="text-2xl">❌</span></td>
                      <td className="p-3 text-center"><span className="text-2xl">❌</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">FREE Tier</td>
                      <td className="p-3 text-center bg-indigo-50">
                        <span className="text-2xl">✅</span>
                        <br />
                        <small>5 grants/mo forever</small>
                      </td>
                      <td className="p-3 text-center text-gray-600">14-day trial only</td>
                      <td className="p-3 text-center text-gray-600">30-day trial</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">First Month Price</td>
                      <td className="p-3 text-center bg-indigo-50">
                        <strong className="text-green-600 text-lg">$9.99</strong>
                        <br />
                        <small className="text-gray-600">70% off • Save $18</small>
                        <br />
                        <small className="text-gray-500">Then $27.99/mo</small>
                      </td>
                      <td className="p-3 text-center text-gray-600">$179</td>
                      <td className="p-3 text-center text-gray-600">$49-99</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Unique Selling Points */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🎯 What Makes Us Different:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <span className="text-3xl">💰</span>
                  <div>
                    <p className="font-bold text-gray-900">Most Affordable</p>
                    <p className="text-sm text-gray-600">85% cheaper than Instrumentl</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-3xl">🤝</span>
                  <div>
                    <p className="font-bold text-gray-900">Only Fiscal Sponsor Matching</p>
                    <p className="text-sm text-gray-600">400+ sponsors, zero competitors</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-3xl">🤖</span>
                  <div>
                    <p className="font-bold text-gray-900">AI LOI Generator</p>
                    <p className="text-sm text-gray-600">Nobody else offers this</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-3xl">🎨</span>
                  <div>
                    <p className="font-bold text-gray-900">Built for Small Orgs</p>
                    <p className="text-sm text-gray-600">Artists, nonprofits, solopreneurs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl shadow-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-2">First month just $9.99 (70% off)</p>
            <p className="text-lg mb-6">Get $297 worth of free resources + enter to win a FREE YEAR!</p>
            <div className="space-y-4">
              <button
                onClick={handleClose}
                className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
              >
                Start for $9.99 →
              </button>
              <p className="text-sm">Free tier available (5 grants/month) • Cancel anytime • Then $27.99/mo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}