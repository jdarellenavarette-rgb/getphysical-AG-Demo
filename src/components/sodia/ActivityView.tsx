import React, { useState } from 'react';
import { X, Heart, Trophy, MessageSquare, Repeat2, UserPlus, Flame } from 'lucide-react';
import { useEcosystem } from '../../context/EcosystemContext';

interface ActivityViewProps {
  onClose: () => void;
}

export const ActivityView: React.FC<ActivityViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');
  const { showToast } = useEcosystem();

  const activities = [
    {
      id: 'act_1',
      type: 'challenge',
      icon: <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />,
      title: 'Leaderboard Alert',
      desc: '@marcus_power logged 260 KG on "Heaviest Deadlift in Makati". You are now Rank #3.',
      time: '15m ago',
      group: 'Today'
    },
    {
      id: 'act_2',
      type: 'like',
      icon: <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />,
      title: 'Liked your post',
      desc: '@sarah_lifts and 14 others liked your 11-8 Pickleball match result.',
      time: '1h ago',
      group: 'Today'
    },
    {
      id: 'act_3',
      type: 'comment',
      icon: <MessageSquare className="h-4 w-4 text-blue-500" />,
      title: 'New comment',
      desc: '@coach_marcus commented: "Bar speed was immaculate! Great hip drive."',
      time: '2h ago',
      group: 'Today'
    },
    {
      id: 'act_4',
      type: 'follow',
      icon: <UserPlus className="h-4 w-4 text-emerald-500" />,
      title: 'New follower',
      desc: '@ken_runner started following you.',
      time: 'Yesterday',
      group: 'This Week'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200 bg-white p-5 shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
            <h3 className="text-base font-black text-zinc-900">Activity & Alerts</h3>
          </div>
          <button onClick={onClose} className="rounded-full bg-zinc-100 p-1 text-zinc-500 hover:bg-zinc-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 flex rounded-xl bg-zinc-100 p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTab === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTab === 'requests' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500'
            }`}
          >
            Follow Requests (0)
          </button>
        </div>

        {/* Activity List */}
        <div className="mt-4 flex-1 overflow-y-auto space-y-3">
          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Today</div>
          {activities.filter(a => a.group === 'Today').map(act => (
            <div
              key={act.id}
              onClick={() => showToast(`Viewed: ${act.title}`)}
              className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-zinc-50 cursor-pointer transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 shrink-0">
                {act.icon}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold text-zinc-900">{act.title}</div>
                <div className="text-zinc-600 mt-0.5">{act.desc}</div>
                <div className="text-[10px] text-zinc-400 mt-1">{act.time}</div>
              </div>
            </div>
          ))}

          <div className="text-[10px] font-black uppercase tracking-wider text-zinc-400 pt-2">This Week</div>
          {activities.filter(a => a.group === 'This Week').map(act => (
            <div
              key={act.id}
              className="flex items-start gap-3 rounded-2xl p-2.5 hover:bg-zinc-50 cursor-pointer transition-colors"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 shrink-0">
                {act.icon}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold text-zinc-900">{act.title}</div>
                <div className="text-zinc-600 mt-0.5">{act.desc}</div>
                <div className="text-[10px] text-zinc-400 mt-1">{act.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
