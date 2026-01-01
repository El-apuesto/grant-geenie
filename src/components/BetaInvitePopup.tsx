import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
              <span className="text-6xl animate-bounce">🚀</span>
            </div>
            <h2 className="text-4xl font-bold text-center mb-2">You're Invited!</h2>
            <p className="text-2xl text-center font-semibold">Grant Geenie Beta Testing</p>
            <div className="inline-block bg-cyan-400 text-gray-900 px-4 py-2 rounded-full font-bold text-lg mt-3 mx-auto block w-fit shadow-lg shadow-cyan-400/50 animate-pulse">
              Limited Spots Available
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* What Beta Testers Get */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-2 border-emerald-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">🎁 Beta Testers Get:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="mr-3 text-2xl">⭐</span>
                <span className="text-gray-700"><strong className="text-emerald-600">FREE Lifetime Pro Access</strong> - Never pay a subscription</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🎯</span>
                <span className="text-gray-700"><strong className="text-gray-900">Early Access</strong> - Be first to use all features</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">💬</span>
                <span className="text-gray-700"><strong className="text-gray-900">Direct Input</strong> - Shape the product with your feedback</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">🏆</span>
                <span className="text-gray-700"><strong className="text-gray-900">VIP Status</strong> - Priority support forever</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-2xl">📚</span>
                <span className="text-gray-700"><strong className="text-gray-900">Free Resources</strong> - Grant writing masterclass & templates</span>
              </li>
            </ul>
          </div>

          {/* What We Need */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-cyan-300">
            <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">🤝 What We're Looking For:</h3>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-start">
                <span className="mr-2">•</span>
                <span>People actively searching for grants (nonprofits, artists, small businesses)</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">•</span>
                <span>Willingness to test features and provide honest feedback</span>
              </p>
              <p className="flex items-start">
                <span className="mr-2">•</span>
                <span>Share your grant search experience (15-20 min weekly check-ins)</span>
              </p>
            </div>
          </div>

          {/* Urgency */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-300 rounded-xl p-4 mb-6 text-center">
            <p className="text-lg font-bold text-gray-900 mb-1">⚡ Only 50 Beta Spots Available</p>
            <p className="text-sm text-gray-600">Join now and get lifetime free access worth $336/year</p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="https://forms.gle/vzLiMcG8f4YaipbG8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl mb-3"
            >
              Apply for Beta Access →
            </a>
            <p className="text-sm text-gray-600 mb-2">
              <span className="inline-block bg-cyan-400 text-gray-900 px-3 py-1 rounded-full font-semibold text-xs shadow-md">FREE LIFETIME</span>
              {' '}Takes 2 minutes • Limited spots
            </p>
            <p className="text-xs text-gray-500">Applications reviewed within 24 hours</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-4 rounded-b-2xl text-center">
          <p className="text-sm text-gray-700">
            <strong>Why beta test?</strong> Get free lifetime access + help us build the best grant tool for the little guys.
          </p>
        </div>
      </div>
    </div>
  );
}
