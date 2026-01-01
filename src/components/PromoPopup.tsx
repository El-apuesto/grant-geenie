import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PromoPopup() {
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
      <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
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
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMTggMGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnpNMCAzNmMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <span className="text-6xl animate-bounce">🎁</span>
            </div>
            <h2 className="text-4xl font-bold text-center mb-2">FREE Bonus Gift!</h2>
            <p className="text-2xl text-center font-semibold">Grant Writing Masterclass</p>
            <div className="inline-block bg-cyan-400 text-gray-900 px-4 py-2 rounded-full font-bold text-lg mt-3 mx-auto block w-fit shadow-lg shadow-cyan-400/50 animate-pulse">
              Worth $297 - Yours FREE!
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* What You Get */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-emerald-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Get FREE:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-3 text-2xl">✅</span>
                <span className="text-gray-700"><strong className="text-gray-900">47-Page Grant Writing Masterclass</strong> - Expert strategies</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">✅</span>
                <span className="text-gray-700"><strong className="text-gray-900">4 Application Templates</strong> - Speed up your process</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">✅</span>
                <span className="text-gray-700"><strong className="text-gray-900">AI LOI Generator</strong> - Create letters in minutes</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">✅</span>
                <span className="text-gray-700"><strong className="text-gray-900">400+ Fiscal Sponsor Database</strong> - Find sponsors</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">💰</span>
                <span className="text-gray-700"><strong className="text-emerald-600">First Month: Just $9.99</strong> - Save $18 (70% off)</span>
              </li>
            </ul>
          </div>

          {/* Why We Win */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-cyan-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">🏆 Why Grant Geenie Wins:</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">💰</div>
                <p className="font-bold text-gray-900 text-sm">85% Cheaper</p>
                <p className="text-xs text-gray-600">than Instrumentl</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🤝</div>
                <p className="font-bold text-gray-900 text-sm">Only Fiscal Matching</p>
                <p className="text-xs text-gray-600">400+ sponsors</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🤖</div>
                <p className="font-bold text-gray-900 text-sm">AI LOI Generator</p>
                <p className="text-xs text-gray-600">Unique feature</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <p className="font-bold text-gray-900 text-sm">For Small Orgs</p>
                <p className="text-xs text-gray-600">Built for you</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="/pricing"
              onClick={() => setIsOpen(false)}
              className="inline-block w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl mb-3"
            >
              Start for $9.99 →
            </a>
            <p className="text-sm text-gray-600 mb-2">
              <span className="inline-block bg-cyan-400 text-gray-900 px-3 py-1 rounded-full font-semibold text-xs shadow-md">70% OFF</span>
              {' '}Free tier available • Cancel anytime
            </p>
            <p className="text-xs text-gray-500">Then $27.99/mo after first month</p>
          </div>
        </div>
      </div>
    </div>
  );
}
