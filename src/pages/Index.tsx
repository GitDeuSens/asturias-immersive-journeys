import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DynamicBackground } from '@/components/DynamicBackground';
import { OnboardingHeader } from '@/components/OnboardingHeader';
import { ModeSelector } from '@/components/ModeSelector';
import { ExperienceSelector } from '@/components/ExperienceSelector';
import { useExplorationMode } from '@/hooks/useLanguage';
import { LCPOptimizer, useLCPOptimization, ResourceOptimizer } from '@/components/LCPOptimizer';

type FlowStep = 'mode' | 'experience';

const Index = () => {
  const navigate = useNavigate();
  const { setMode } = useExplorationMode();
  const [step, setStep] = useState<FlowStep>('experience');
  
  // Optimize LCP
  useLCPOptimization();

  const handleModeSelect = (selectedMode: 'home' | 'here') => {
    setMode(selectedMode);
    setStep('experience');
  };

  const handleExperienceSelect = (experience: 'tours' | 'routes') => {
    if (experience === 'tours') {
      navigate('/tours');
    } else {
      navigate('/routes');
    }
  };

  const handleBack = () => {
    setStep('mode');
  };

  return (
    <>
      <LCPOptimizer />
      <ResourceOptimizer />
      <div className="min-h-screen bg-background">
        {/* Dynamic blurred background */}
        <DynamicBackground blur={10} interval={8000} />
        
        {/* Header with language selector */}
        <OnboardingHeader />
        
        {/* Content */}
        {step === 'experience' && <ExperienceSelector onSelect={handleExperienceSelect} onBack={handleBack} />}
        {/*step === 'mode' && <ModeSelector onSelect={handleModeSelect} />*/}
      </div>
    </>
  );
};

export default Index;
