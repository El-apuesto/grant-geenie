import { useNavigate } from "react-router-dom";

export default function BillingCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-gray-400 text-5xl mb-4">⊘</div>
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-4">Your payment was cancelled. No charges were made to your account.</p>
        <button 
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}