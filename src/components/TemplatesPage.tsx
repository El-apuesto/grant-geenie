import { FileText, Lock } from 'lucide-react';

interface TemplatesPageProps {
  isPro: boolean;
}

export default function TemplatesPage({ isPro }: TemplatesPageProps) {
  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="bg-slate-800 p-6 rounded-full mb-6">
          <Lock className="w-12 h-12 text-slate-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pro Feature Locked</h2>
        <p className="text-slate-400 max-w-md">
          Upgrade to Pro to access our library of professional grant application templates.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-8 h-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Application Templates</h1>
      </div>
      
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 text-center">
        <p className="text-slate-400">Templates library coming soon!</p>
      </div>
    </div>
  );
}