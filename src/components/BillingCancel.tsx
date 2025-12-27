export default function BillingCancel() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-slate-400 text-5xl mb-4">⊝</div>
        <h1 className="text-2xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-slate-400 mb-4">Your payment was cancelled. No charges were made to your account.</p>
        <button 
          onClick={() => window.location.href = "/"}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}