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
import { soundManager } from './utils/SoundManager';
import { notificationManager } from './utils/NotificationManager';
import { Shield, Skull } from 'lucide-react';
import { useHabits } from './hooks/useHabits';
import { useGamification } from './hooks/useGamification';

function App() {
  const { habits, setHabits, history, setHistory, addHabit, editHabit, deleteHabit, triggerHaptic } = useHabits();
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

  // --- PERMADEATH LOGIC (Moved from hook for side effects) ---
  useEffect(() => {
    if (hardcoreMode) {
      document.body.classList.add('hardcore-active');
      const hasHistory = Object.keys(history).length > 0;

      if (streak === 0 && hasHistory) {
        const dates = Object.keys(history).sort();
        const lastDateStr = dates[dates.length - 1];

        if (lastDateStr && lastDateStr !== today) {
          setHistory({});
          soundManager.playGameOver();
          setTimeout(() => alert("☠️ HARDCORE MODE: YOU MISSED A DAY. PROTOCOL RESET. ☠️"), 100);
        }
      }
    } else {
      document.body.classList.remove('hardcore-active');
    }
  }, [streak, hardcoreMode, history, today, setHistory]);

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
    const habitsWithIds = newHabits.map((h, index) => ({
      ...h,
      id: Date.now() + index // Ensure unique IDs
    }));
    setHabits(habitsWithIds);
    soundManager.playCharge();
    triggerHaptic('heavy');
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#39FF14', '#ffffff']
    });
  };

  const toggleHabit = (id) => {
    const date = new Date();
    const currentToday = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    setHistory(prev => {
      const todayCompleted = prev[currentToday] || [];
      const isCompleted = todayCompleted.includes(id);

      let newTodayCompleted;
      let shouldTriggerCard = false;

      if (isCompleted) {
        // STRICT MODE: Cannot undo a completed habit for the day
        triggerHaptic('medium'); // Error vibration
        soundManager.playGlitch();
        return prev;
      } else {
        newTodayCompleted = [...todayCompleted, id];
        triggerHaptic('success');

        // --- VITALITY EFFECTS ---
        soundManager.playThud();
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);

        const habit = habits.find(h => h.id === id);
        if (habit && habit.category === 'training') {
          setIsPumped(true);
          setTimeout(() => setIsPumped(false), 2000);
        }
        // ------------------------

        // Check for Perfect Day
        if (habits.length > 0 && newTodayCompleted.length === habits.length) {
          const lastCardDate = prev.lastMysteryBoxDate;
          if (lastCardDate !== currentToday) {
            shouldTriggerCard = true;
          } else {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#39FF14', '#ffffff'] // Neon Green & White
            });
            soundManager.playCharge();
          }
        }
      }

      if (shouldTriggerCard) {
        setTimeout(() => setShowKnowledgeCard(true), 500);
        soundManager.playCharge();
      }

      return {
        ...prev,
        [currentToday]: newTodayCompleted,
        lastMysteryBoxDate: shouldTriggerCard ? currentToday : prev.lastMysteryBoxDate
      };
    });
  };

  const handleShare = async () => {
    // Trigger download directly
    if (proofRef.current) {
      soundManager.playCharge(); // Feedback start

      // Wait a bit for any state updates to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(proofRef.current, {
        backgroundColor: null, // Transparent background
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
    const stats = {
      training: 0, // 0-1 for BodyWidget
      nutrition: 0,
      recovery: 0,
      str: 0, // 0-100% for PerformanceStats
      rec: 0,
      know: 0
    };

    const categories = {
      training: { total: 0, done: 0 },
      nutrition: { total: 0, done: 0 },
      recovery: { total: 0, done: 0 },
      knowledge: { total: 0, done: 0 }
    };

    todayHabits.forEach(h => {
      const cat = h.category || 'training'; // Default to training if missing
      if (categories[cat]) {
        categories[cat].total++;
        if (h.completed) categories[cat].done++;
      }
    });

    // Body Widget Stats (0-1)
    stats.training = categories.training.total > 0 ? categories.training.done / categories.training.total : 0;
    stats.nutrition = categories.nutrition.total > 0 ? categories.nutrition.done / categories.nutrition.total : 0;
    stats.recovery = categories.recovery.total > 0 ? categories.recovery.done / categories.recovery.total : 0;
    stats.knowledge = categories.knowledge.total > 0 ? categories.knowledge.done / categories.knowledge.total : 0;

    // Performance Stats (0-100%)
    // STR = Training + Knowledge (Discipline)
    const strTotal = categories.training.total + categories.knowledge.total;
    const strDone = categories.training.done + categories.knowledge.done;
    stats.str = strTotal > 0 ? (strDone / strTotal) * 100 : 0;

    // REC = Recovery + Nutrition (Health)
    const recTotal = categories.recovery.total + categories.nutrition.total;
    const recDone = categories.recovery.done + categories.nutrition.done;
    stats.rec = recTotal > 0 ? (recDone / recTotal) * 100 : 0;

    // KNOW = Knowledge (Focus)
    stats.know = categories.knowledge.total > 0 ? (categories.knowledge.done / categories.knowledge.total) * 100 : 0;

    return stats;
  };

  const currentStats = calculateStats();

  // Determine Pulse Class
  const integrity = (currentStats.training + currentStats.nutrition + currentStats.recovery + currentStats.knowledge) / 4;
  let pulseClass = '';
  if (integrity < 0.4) pulseClass = 'pulse-red';
  else if (streak > 3 || integrity > 0.8) pulseClass = 'pulse-green';

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
