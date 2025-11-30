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
import { soundManager } from './utils/SoundManager';
import { notificationManager } from './utils/NotificationManager';
import { Shield, Skull } from 'lucide-react';
import { useHabits } from './hooks/useHabits';
import { useGamification } from './hooks/useGamification';

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

  const { streak, calculateHabitStreak, hardcoreMode, setHardcoreMode, today } = useGamification(history, habits);

  const [showKnowledgeCard, setShowKnowledgeCard] = useState(false);
  const [isPumped, setIsPumped] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // REFS
  const proofRef = useRef(null);
  const shareRef = useRef(null);

  // Initialize Audio & Notifications on first interaction
  useEffect(() => {
    const initServices = () => {
      soundManager.init();
      notificationManager.requestPermission();
    };
    window.addEventListener('click', initServices, { once: true });

    // Check for aggressive notifications every minute
    const interval = setInterval(() => {
      notificationManager.checkRoutine(habits, history);
    }, 60000);

    return () => {
      window.removeEventListener('click', initServices);
      clearInterval(interval);
    };
  }, [habits, history]);

  // --- PERMADEATH LOGIC ---
  useEffect(() => {
    if (hardcoreMode) {
      document.body.classList.add('hardcore-active');
      const hasHistory = Object.keys(history).length > 0;

      if (streak === 0 && hasHistory) {
        const dates = Object.keys(history).sort();
        const lastDateStr = dates[dates.length - 1];

        if (lastDateStr && lastDateStr !== today) {
          // In Supabase version, we might need a way to reset history.
          // For now, we just alert. Resetting DB history is a heavy operation.
          // Maybe we just reset the streak visually or sound?
          // The original code did setHistory({}).
          // We can't easily wipe the DB logs here without a specific function.
          // For Phase 1, let's just play the sound and alert.
          soundManager.playGameOver();
          // setTimeout(() => alert("☠️ HARDCORE MODE: YOU MISSED A DAY. PROTOCOL RESET. ☠️"), 100);
        }
      }
    } else {
      document.body.classList.remove('hardcore-active');
    }
  }, [streak, hardcoreMode, history, today]);

  const toggleHardcore = () => {
    if (!hardcoreMode) {
      const confirm = window.confirm("⚠️ WARNING: HARDCORE MODE ⚠️\n\nIf you miss ONE day, your entire progress (Streak & Level) will be WIPED.\n\nAre you sure you have what it takes?");
      if (confirm) {
        setHardcoreMode(true);
        soundManager.playThud();
        triggerHaptic('heavy');
      }
    } else {
      setHardcoreMode(false);
      soundManager.playThud();
    }
  };

  const handleProtocolSelect = (newHabits) => {
    setHabitsBulk(newHabits);
    soundManager.playCharge();
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
      soundManager.playGlitch();
      return;
    }

    // 2. Call Hook
    const nowCompleted = await toggleCompletion(id, today);

    // 3. Effects (if successfully completed)
    if (nowCompleted) {
      triggerHaptic('success');
      soundManager.playThud();
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 300);

      const habit = habits.find(h => h.id === id);
      if (habit && habit.category === 'training') {
        setIsPumped(true);
        setTimeout(() => setIsPumped(false), 2000);
      }

      // Perfect Day Check
      const currentCount = (history[today] || []).length; // Count BEFORE this toggle (from current render state)
      // Since we just added one, total is currentCount + 1

      if (habits.length > 0 && (currentCount + 1) === habits.length) {
        // Check if we should trigger mystery box (simplified logic for now)
        // Original logic checked lastMysteryBoxDate in history state.
        // We don't have that in the new history object (it's just logs).
        // We can just trigger confetti every time for now.

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#39FF14', '#ffffff']
        });
        soundManager.playCharge();

        // Optional: Show Knowledge Card occasionally
        if (Math.random() > 0.7) {
          setTimeout(() => setShowKnowledgeCard(true), 500);
        }
      }
    }
  };

  const handleShare = async () => {
    if (proofRef.current) {
      soundManager.playCharge();
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(proofRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `optimal-overlay-${today}.png`;
      link.click();

      triggerHaptic('success');
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

        <BodyWidget stats={currentStats} isAllDone={isAllDone} isPumped={isPumped} streak={streak} hardcoreMode={hardcoreMode} />

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
        <button className="share-btn-large" onClick={handleShare}>
          <span className="camera-icon">📸</span>
          <span className="action-text">GENERATE OVERLAY</span>
          <div className="btn-shine"></div>
        </button>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <ShareCard
          ref={shareRef}
          streak={streak}
          habits={habits}
          todayHabits={todayHabits}
          history={history}
        />
      </div>

      <KnowledgeCardModal
        show={showKnowledgeCard}
        onClose={() => setShowKnowledgeCard(false)}
      />
    </div>
  );
}

export default App;
