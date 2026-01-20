import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeSplash } from '@/components/WelcomeSplash';
import { ExplorationMode } from '@/components/ExplorationMode';
import { ExperienceSelector } from '@/components/ExperienceSelector';
import { useLanguage, Language, useExplorationMode } from '@/hooks/useLanguage';

type FlowStep = 'splash' | 'mode' | 'experience';

const Index = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();
  const { mode, setMode } = useExplorationMode();
  const [step, setStep] = useState<FlowStep>('splash');

  useEffect(() => {
    // Check if language already set, skip splash
    const savedLang = localStorage.getItem('asturias-inmersivo-lang');
    if (savedLang) {
      setStep('mode');
    }
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setStep('mode');
  };

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

  return (
    <div className="min-h-screen bg-background">
      {step === 'splash' && <WelcomeSplash onContinue={handleLanguageSelect} />}
      {step === 'mode' && <ExplorationMode onSelect={handleModeSelect} />}
      {step === 'experience' && <ExperienceSelector onSelect={handleExperienceSelect} />}
    </div>
  );
};

export default Index;
