import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function PricingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    if (!user) {
      alert('Please sign in first')
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          userId: user.id,
          email: user.email,
          priceId: 'price_1QYourStripePriceID', // TODO: Replace with your Stripe Price ID
        },
      })

      if (error) throw error
      if (data?.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4">Choose Your Plan</h1>
        <p className="text-center text-gray-600 mb-12">Start finding grants that match your mission</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-gray-200">
            <h2 className="text-2xl font-bold mb-4">Free</h2>
            <p className="text-4xl font-bold mb-6">
              $0<span className="text-lg font-normal text-gray-600">/month</span>
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Basic grant search</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>5 saved grants</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                <span>Email alerts</span>
              </li>
            </ul>
            <button 
              disabled 
              className="w-full bg-gray-300 text-gray-600 py-3 rounded-lg font-semibold cursor-not-allowed"
            >
              Current Plan
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-blue-500 relative">
            <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-semibold">
              RECOMMENDED
            </div>
            <h2 className="text-2xl font-bold mb-4">Premium</h2>
            <p className="text-4xl font-bold mb-6">
              $29<span className="text-lg font-normal text-gray-600">/month</span>
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="font-medium">Unlimited grant searches</span>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="font-medium">Unlimited saved grants</span>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="font-medium">AI-powered matching</span>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="font-medium">Grant writing assistant</span>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="font-medium">Priority support</span>
              </li>
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">✓</span>
                <span className="font-medium">Advanced filters</span>
              </li>
            </ul>
            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'Subscribe Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}