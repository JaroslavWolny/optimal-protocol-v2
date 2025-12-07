import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import './components/StreakDisplay.css';
import confetti from 'canvas-confetti';
import HabitList from './components/HabitList';
import AddHabit from './components/AddHabit';
import Calendar from './components/Calendar';
import Award from './components/Award';
import ShareCard from './components/ShareCard';
import BodyWidget from './components/BodyWidget';
import KnowledgeCardModal from './components/KnowledgeCardModal';
import ProofHUD from './components/ProofHUD';
import ProtocolSelector from './components/ProtocolSelector';
import IdentityInitialization from './components/Auth/IdentityInitialization';
import { Shield, Skull } from 'lucide-react';
import { useHabits } from './hooks/useHabits';
import { useGamification } from './hooks/useGamification';
import { useAudio } from './context/AudioContext';

const DeathCertificate = React.lazy(() => import('./components/DeathCertificate'));

function App() {
  const {
    habits,
    history,
    user,
    loading,
    addHabit,
    editHabit,
    deleteHabit,
    toggleCompletion,
    setHabitsBulk,
    triggerHaptic
  } = useHabits();

  const { streak, calculateHabitStreak, hardcoreMode, setHardcoreMode, today } = useGamification();
  const { play } = useAudio();

  const [showKnowledgeCard, setShowKnowledgeCard] = useState(false);
  const [isPumped, setIsPumped] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  const [avatarSnapshot, setAvatarSnapshot] = useState(null);
  const bodyRef = useRef(null);
  const proofRef = useRef(null);
  const shareRef = useRef(null);

  // --- PERMADEATH LOGIC ---
  useEffect(() => {
    if (hardcoreMode) {
      document.body.classList.add('hardcore-active');
      const hasHistory = Object.keys(history).length > 0;

      if (streak === 0 && hasHistory) {
        const dates = Object.keys(history).sort();
        const lastDateStr = dates[dates.length - 1];

        if (lastDateStr && lastDateStr !== today) {
          play('gameover');
        }
      }
    } else {
      document.body.classList.remove('hardcore-active');
    }
  }, [streak, hardcoreMode, history, today, play]);

  const toggleHardcore = () => {
    if (!hardcoreMode) {
      const confirm = window.confirm("⚠️ WARNING: HARDCORE MODE ⚠️\n\nIf you miss ONE day, your entire progress (Streak & Level) will be WIPED.\n\nAre you sure you have what it takes?");
      if (confirm) {
        setHardcoreMode(true);
        play('thud');
        triggerHaptic('heavy');
      }
    } else {
      setHardcoreMode(false);
      play('thud');
    }
  };

  const handleProtocolSelect = (newHabits) => {
    setHabitsBulk(newHabits);
    play('charge');
    triggerHaptic('heavy');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#39FF14', '#ffffff']
    });
  };

  const toggleHabit = async (id) => {
    // 1. Check Strict Mode (Optimistic check)
    const isCompleted = (history[today] || []).includes(id);

    if (isCompleted) {
      // STRICT MODE: Cannot undo a completed habit for the day
      triggerHaptic('medium');
      play('glitch');
      return;
    }

    // 2. Call Hook
    const nowCompleted = await toggleCompletion(id, today);

    // 3. Effects (if successfully completed)
    if (nowCompleted) {
      triggerHaptic('success');
      play('thud');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);

      const habit = habits.find(h => h.id === id);
      if (habit && habit.category === 'training') {
        setIsPumped(true);
        setTimeout(() => setIsPumped(false), 2000);
      }

      // Perfect Day Check
      const currentCount = (history[today] || []).length;
      if (habits.length > 0 && (currentCount + 1) === habits.length) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#39FF14', '#ffffff']
        });
        play('charge');

        // Optional: Show Knowledge Card occasionally
        if (Math.random() > 0.7) {
          setTimeout(() => setShowKnowledgeCard(true), 500);
        }
      }
    }
  };

  const [isGeneratingShare, setIsGeneratingShare] = useState(false);

  const handleShare = async () => {
    try {
      play('charge');
      triggerHaptic('medium');
      console.log('Initiating share sequence...');

      // 1. Capture Avatar Snapshot
      let snapshot = null;
      if (bodyRef.current) {
        try {
          snapshot = bodyRef.current.getSnapshot();
          if (snapshot) setAvatarSnapshot(snapshot);
        } catch (e) {
          console.error('Snapshot failed:', e);
        }
      }

      // 2. Show the Card (Visible Render)
      setIsGeneratingShare(true);

      // 3. Wait for Render & Image Load (Critical for html2canvas)
      // Giving it 800ms to ensure full layout and asset loading
      await new Promise(resolve => setTimeout(resolve, 800));

      // 4. Capture & Share
      const elementToShare = shareRef.current;
      if (elementToShare) {
        const { shareElement } = await import('./utils/shareUtils');
        const success = await shareElement(
          elementToShare,
          `optimal-status-${today}.png`,
          'PROTOCOL STATUS',
          `Day ${streak} complete. Power Level: CHECKED. #OptimalProtocol`
        );

        if (success) {
          triggerHaptic('success');
        } else {
          alert('Share generation failed. Please try again.');
        }
      } else {
        console.error('Share Reference Invalid');
      }

    } catch (error) {
      console.error('Share Error:', error);
      alert('System Error during generation.');
    } finally {
      // 5. Hide Card
      setIsGeneratingShare(false);
      setAvatarSnapshot(null);
    }
  };

  const todayHabits = habits.map(h => ({
    ...h,
    completed: (history[today] || []).includes(h.id),
    streak: calculateHabitStreak(h.id)
  }));

  const completedCount = (history[today] || []).filter(id => habits.some(h => h.id === id)).length;
  const isAllDone = habits.length > 0 && completedCount === habits.length;

  // Calculate Stats for Dashboard
  const calculateStats = () => {
    const stats = { training: 0, nutrition: 0, recovery: 0, str: 0, rec: 0, know: 0 };
    const categories = {
      training: { total: 0, done: 0 },
      nutrition: { total: 0, done: 0 },
      recovery: { total: 0, done: 0 },
      knowledge: { total: 0, done: 0 }
    };

    todayHabits.forEach(h => {
      const cat = h.category || 'training';
      if (categories[cat]) {
        categories[cat].total++;
        if (h.completed) categories[cat].done++;
      }
    });

    stats.training = categories.training.total > 0 ? categories.training.done / categories.training.total : 0;
    stats.nutrition = categories.nutrition.total > 0 ? categories.nutrition.done / categories.nutrition.total : 0;
    stats.recovery = categories.recovery.total > 0 ? categories.recovery.done / categories.recovery.total : 0;
    stats.knowledge = categories.knowledge.total > 0 ? categories.knowledge.done / categories.knowledge.total : 0;

    const strTotal = categories.training.total + categories.knowledge.total;
    const strDone = categories.training.done + categories.knowledge.done;
    stats.str = strTotal > 0 ? (strDone / strTotal) * 100 : 0;

    const recTotal = categories.recovery.total + categories.nutrition.total;
    const recDone = categories.recovery.done + categories.nutrition.done;
    stats.rec = recTotal > 0 ? (recDone / recTotal) * 100 : 0;

    stats.know = categories.knowledge.total > 0 ? (categories.knowledge.done / categories.knowledge.total) * 100 : 0;

    return stats;
  };

  const currentStats = calculateStats();
  const integrity = (currentStats.training + currentStats.nutrition + currentStats.recovery + currentStats.knowledge) / 4;
  let pulseClass = '';
  if (integrity < 0.4) pulseClass = 'pulse-red';
  else if (streak > 3 || integrity > 0.8) pulseClass = 'pulse-green';

  // --- RENDER ---

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="glitch-text">INITIALIZING...</div>
      </div>
    );
  }

  if (!user) {
    return <IdentityInitialization />;
  }

  // --- DEATH CHECK ---
  if (user.status === 'DEAD') {
    return (
      <React.Suspense fallback={<div className="glitch-text">LOADING DEATH...</div>}>
        <DeathCertificate user={user} />
      </React.Suspense>
    );
  }

  return (
    <div className={`app-container ${isShaking ? 'shake-effect' : ''} ${pulseClass}`}>

      {/* Hidden Proof HUD for Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ProofHUD ref={proofRef} streak={streak} />
      </div>

      <div className="header-row">
        <div className="app-brand">
          <h1 className="glitch-text" data-text="OPTIMAL APP">OPTIMAL APP</h1>
        </div>

        <div className="header-controls">
          <button
            className={`mode-switch ${hardcoreMode ? 'hardcore' : 'normal'}`}
            onClick={toggleHardcore}
            title={hardcoreMode ? "Disable Hardcore Mode" : "Enable Hardcore Mode"}
          >
            <div className="switch-track">
              <div className="switch-thumb">
                {hardcoreMode ? <Skull size={14} /> : <Shield size={14} />}
              </div>
            </div>
            <span className="mode-label">{hardcoreMode ? 'DEATH' : 'SAFE'}</span>
          </button>

          <div className="streak-minimal">
            <span className="streak-fire">🔥</span>
            <span className="streak-val">{streak}</span>
          </div>
        </div>
      </div>

      <Award show={isAllDone} />

      <div className="glass-panel main-panel">

        <BodyWidget
          ref={bodyRef}
          stats={currentStats}
          isAllDone={isAllDone}
          isPumped={isPumped}
          streak={streak}
          hardcoreMode={hardcoreMode}
        />

        {habits.length === 0 ? (
          <ProtocolSelector onSelect={handleProtocolSelect} />
        ) : (
          <>
            <AddHabit onAdd={addHabit} />
            <HabitList
              habits={todayHabits}
              onToggle={toggleHabit}
              onEdit={editHabit}
              onDelete={deleteHabit}
            />
          </>
        )}

        <Calendar history={history} habits={habits} />
      </div>

      <div className="fixed-action-bar">
        <button className="cyber-share-btn" onClick={handleShare} disabled={isGeneratingShare}>
          <div className="btn-bg-layer"></div>
          <div className="btn-content">
            <div className="btn-icon-box">
              <span className="btn-icon">{isGeneratingShare ? '⏳' : '🚀'}</span>
            </div>
            <div className="btn-text-stack">
              <span className="btn-action">{isGeneratingShare ? 'GENERATING...' : 'DEPLOY STATUS'}</span>
              <span className="btn-sub">{isGeneratingShare ? 'PROCESSING DATA' : 'GENERATE PROOF OF WORK'}</span>
            </div>
          </div>
          <div className="btn-scanline"></div>
        </button>
      </div>

      {/* 
          VISIBLE SHARE OVERLAY
          Rendered on top of everything when generating.
          This ensures browser correctly paints the element for html2canvas.
      */}
      {isGeneratingShare && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999,
          background: 'rgba(0,0,0,0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ transform: 'scale(0.35)', transformOrigin: 'center center' }}>
            <ShareCard
              ref={shareRef}
              streak={streak}
              habits={habits}
              todayHabits={todayHabits}
              history={history}
              avatarImage={avatarSnapshot}
            />
          </div>
          <div style={{ position: 'absolute', bottom: '10%', color: '#39FF14', fontFamily: 'monospace', letterSpacing: '2px' }}>
            INITIALIZING NEURAL LINK...
          </div>
        </div>
      )}

      <KnowledgeCardModal
        show={showKnowledgeCard}
        onClose={() => setShowKnowledgeCard(false)}
      />
    </div>
  );
}

export default App;
