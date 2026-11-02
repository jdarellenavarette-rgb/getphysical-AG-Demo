'use client';

import React, { useState, useEffect } from 'react';
import { Dumbbell, Footprints, Utensils, Play, CheckCircle2, RotateCcw, Plus, Clock } from 'lucide-react';
import { calculateEpleyOneRepMax } from 'sodia-core';

export function TrackTabScreen() {
  const [trackMode, setTrackMode] = useState<'lift' | 'move' | 'food'>('lift');

  // Lift State
  const [sets, setSets] = useState([
    { id: 1, weight: 180, reps: 5, completed: true },
    { id: 2, weight: 200, reps: 3, completed: true },
    { id: 3, weight: 225, reps: 1, completed: false },
  ]);
  const [restSeconds, setRestSeconds] = useState(74);
  const [isResting, setIsResting] = useState(true);

  useEffect(() => {
    if (!isResting || restSeconds <= 0) return;
    const interval = setInterval(() => setRestSeconds(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [isResting, restSeconds]);

  const toggleSet = (id: number) => {
    setSets(prev => prev.map(s => (s.id === id ? { ...s, completed: !s.completed } : s)));
    setRestSeconds(90);
    setIsResting(true);
  };

  const estimated1RM = calculateEpleyOneRepMax(225, 1);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#09090b', color: '#fff', overflowY: 'auto', padding: '16px 16px 90px' }}>
      {/* Trinity Mode Switcher */}
      <div style={{ display: 'flex', backgroundColor: '#18181b', borderRadius: '12px', padding: '4px', marginBottom: '16px', border: '1px solid #27272a' }}>
        {[
          { id: 'lift', label: 'Lift', icon: Dumbbell },
          { id: 'move', label: 'Move (GPS)', icon: Footprints },
          { id: 'food', label: 'Food (NASM)', icon: Utensils },
        ].map((m) => {
          const Icon = m.icon;
          const active = trackMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setTrackMode(m.id as any)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '8px 0', borderRadius: '8px', fontSize: '12px', fontWeight: 800,
                backgroundColor: active ? '#ec4899' : 'transparent', color: active ? '#fff' : '#a1a1aa',
                border: 'none', cursor: 'pointer'
              }}
            >
              <Icon size={14} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {trackMode === 'lift' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Active Floating Rest Timer Banner */}
          {isResting && restSeconds > 0 && (
            <div style={{ backgroundColor: '#1e1b4b', border: '1px solid #4f46e5', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color="#818cf8" className="animate-spin" />
                <div>
                  <div style={{ fontSize: '11px', color: '#a5b4fc', fontWeight: 700 }}>REST TIMER</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
                    00:{restSeconds < 10 ? `0${restSeconds}` : restSeconds}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setRestSeconds(prev => prev + 15)} style={{ backgroundColor: '#312e81', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>+15s</button>
                <button onClick={() => setRestSeconds(0)} style={{ backgroundColor: '#4338ca', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>Skip</button>
              </div>
            </div>
          )}

          {/* Exercise Card */}
          <div style={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#fff', margin: 0 }}>Conventional Deadlift</h3>
                <span style={{ fontSize: '11px', color: '#a1a1aa' }}>Primary Posterior Chain • Target: 3 Working Sets</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 800 }}>EPLEY 1RM</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>{estimated1RM} KG</div>
              </div>
            </div>

            {/* Sets Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sets.map((set) => (
                <div
                  key={set.id}
                  onClick={() => toggleSet(set.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px',
                    backgroundColor: set.completed ? '#10b98115' : '#27272a',
                    border: `1px solid ${set.completed ? '#10b98150' : '#3f3f46'}`,
                    borderRadius: '10px', cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#a1a1aa' }}>SET {set.id}</span>
                    <span style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>{set.weight} KG × {set.reps} reps</span>
                  </div>
                  <CheckCircle2 size={18} color={set.completed ? '#10b981' : '#71717a'} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {trackMode === 'move' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', padding: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#ec4899', marginBottom: '4px' }}>LATEST RUN • BONIFACIO GLOBAL CITY</div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#fff' }}>5.24 KM</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
              <div style={{ backgroundColor: '#27272a', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Duration</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>28:14</div>
              </div>
              <div style={{ backgroundColor: '#27272a', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Pace</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>5'23"/km</div>
              </div>
              <div style={{ backgroundColor: '#27272a', padding: '10px', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#a1a1aa' }}>Calories</div>
                <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>412 kcal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {trackMode === 'food' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: '#18181b', borderRadius: '16px', border: '1px solid #27272a', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 800 }}>NASM DAILY TARGETS</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>1,915 / 2,350 kcal</div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#a1a1aa' }}>81% Goal</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { name: 'Protein', current: 145, target: 180, unit: 'g', color: '#ec4899' },
                { name: 'Carbs', current: 210, target: 250, unit: 'g', color: '#38bdf8' },
                { name: 'Fats', current: 55, target: 70, unit: 'g', color: '#f59e0b' },
              ].map(macro => (
                <div key={macro.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                    <span style={{ color: '#d4d4d8' }}>{macro.name}</span>
                    <span style={{ fontWeight: 800, color: '#fff' }}>{macro.current} / {macro.target} {macro.unit}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: '#27272a', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(macro.current / macro.target) * 100}%`, backgroundColor: macro.color, borderRadius: '99px' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
