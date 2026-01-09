import { useState } from 'react';
import { Briefcase } from 'lucide-react';
import ShadowProfileGenerator from './ShadowProfileGenerator';

interface AgencyToolsProps {
  isPro: boolean;
}

export default function AgencyTools({ isPro }: AgencyToolsProps) {
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(null);

  const handleProfileSelect = (profileId: string) => {
    setCurrentProfileId(profileId);
    // In a real app, this would trigger a context update or data fetch
    console.log('Selected profile:', profileId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-8 h-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Agency Tools</h1>
      </div>
      
      <ShadowProfileGenerator 
        onProfileSelect={handleProfileSelect}
        currentProfileId={currentProfileId}
      />
    </div>
  );
}