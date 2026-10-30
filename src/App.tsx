import React, { useState } from 'react';
import { EcosystemProvider, useEcosystem } from './context/EcosystemContext';
import { HeaderBar } from './components/common/HeaderBar';
import { BottomBar } from './components/common/BottomBar';
import { UniversalCheckoutModal } from './components/common/UniversalCheckoutModal';
import { SodiaFeed } from './components/sodia/SodiaFeed';
import { DiscoverMap } from './components/discover/DiscoverMap';
import { CardsHub } from './components/cards/CardsHub';
import { TrackHub } from './components/track/TrackHub';
import { ProfileHub } from './components/profile/ProfileHub';
import { ActivityView } from './components/sodia/ActivityView';
import { InboxView } from './components/sodia/InboxView';
import { ChallengesView } from './components/sodia/ChallengesView';
import { GymDashTablet } from './components/gymdash/GymDashTablet';
import { GymDashWebOS } from './components/gymdash/GymDashWebOS';
import { ClubdashFacilityOS } from './components/clubdash/ClubdashFacilityOS';
import { CoachDashHub } from './components/coachdash/CoachDashHub';
import { MasterTestbenchDrawer } from './components/deepdives/MasterTestbenchDrawer';
import { FigmaDualPhoneView } from './components/figma/FigmaDualPhoneView';
import { Smartphone, Monitor, Sliders, Sparkles } from 'lucide-react';
import { ExecutiveSettingsModal } from './components/common/ExecutiveSettingsModal';

const EcosystemShell: React.FC = () => {
  const { portal, sodiaTab, toastMessage } = useEcosystem();

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isTestbenchOpen, setIsTestbenchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [figmaMockupMode, setFigmaMockupMode] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col selection:bg-pink-500 selection:text-white relative">
      
      {/* Floating Desktop Utility Capsule (Only visible on tablet/desktop displays to switch mockup mode easily) */}
      <div className="hidden lg:flex fixed top-3 right-4 z-40 items-center gap-2 bg-[#12161f]/90 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full shadow-2xl text-xs select-none">
        <button
          onClick={() => setFigmaMockupMode(!figmaMockupMode)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all active:scale-95 ${
            figmaMockupMode
              ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-sm'
              : 'bg-white/10 text-zinc-300 hover:text-white'
          }`}
          title="Toggle between single responsive mobile view and dual Figma phone mockup"
        >
          {figmaMockupMode ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5 text-pink-400" />}
          <span>{figmaMockupMode ? 'Single Mobile' : 'Dual Figma View'}</span>
        </button>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/15 text-zinc-300 hover:text-white font-bold transition-colors"
          title="Executive Settings & Switcher"
        >
          <Sliders className="h-3.5 w-3.5 text-[#ec4899]" />
          <span>Settings</span>
        </button>

        <button
          onClick={() => setIsTestbenchOpen(true)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold border border-purple-500/30 transition-colors"
          title="34 Flowchart Master Verification"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>34 Dives</span>
        </button>
      </div>

      {/* Main Active Portal View */}
      <div className="flex-1">
        {figmaMockupMode ? (
          <FigmaDualPhoneView
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTestbench={() => setIsTestbenchOpen(true)}
            onSwitchToMobile={() => setFigmaMockupMode(false)}
          />
        ) : (
          <>
            {portal === 'sodia' && (
              <div className="min-h-screen bg-black text-white flex flex-col selection:bg-pink-500 selection:text-white">
                <HeaderBar
                  onOpenActivity={() => setIsActivityOpen(true)}
                  onOpenInbox={() => setIsInboxOpen(true)}
                  onOpenTestbench={() => setIsTestbenchOpen(true)}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  figmaMockupMode={figmaMockupMode}
                  onToggleFigmaMode={() => setFigmaMockupMode(!figmaMockupMode)}
                />

                <main className="flex-1">
                  {sodiaTab === 'sodia' && <SodiaFeed />}
                  {sodiaTab === 'discover' && <DiscoverMap />}
                  {sodiaTab === 'cards' && <CardsHub />}
                  {sodiaTab === 'track' && <TrackHub />}
                  {sodiaTab === 'profile' && <ProfileHub />}
                </main>

                <BottomBar />
                <UniversalCheckoutModal />

                {/* Overlays */}
                {isActivityOpen && <ActivityView onClose={() => setIsActivityOpen(false)} />}
                {isInboxOpen && <InboxView onClose={() => setIsInboxOpen(false)} />}
              </div>
            )}

            {portal === 'gymdash-tablet' && <GymDashTablet />}
            {portal === 'gymdash-os' && <GymDashWebOS />}
            {portal === 'clubdash' && <ClubdashFacilityOS />}
            {portal === 'coachdash' && <CoachDashHub />}
          </>
        )}
      </div>

      {/* Executive Settings Modal */}
      <ExecutiveSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenTestbench={() => setIsTestbenchOpen(true)}
        figmaMockupMode={figmaMockupMode}
        setFigmaMockupMode={setFigmaMockupMode}
      />

      {/* Deep Dives Testbench Drawer */}
      <MasterTestbenchDrawer
        isOpen={isTestbenchOpen}
        onClose={() => setIsTestbenchOpen(false)}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-zinc-950 px-4 py-2.5 text-xs font-bold text-white shadow-2xl border border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <EcosystemProvider>
      <EcosystemShell />
    </EcosystemProvider>
  );
}
