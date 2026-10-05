import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config';

interface GroupPlanningModalProps {
  onClose: () => void;
}

interface GroupPlan {
  id: number;
  event: string;
  meetPlace: string;
  meetTime: string;
  attendees: number;
}

export default function GroupPlanningModal({ onClose }: GroupPlanningModalProps) {
  const [plans, setPlans] = useState<GroupPlan[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlan, setNewPlan] = useState({ event: '', meetPlace: '', meetTime: '' });
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = API_URL.replace(/^http/, 'ws');
    const ws = new WebSocket(`${wsUrl}/ws/planning`);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ type: 'join', room: 'planning' }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'plan_update') {
        setPlans(prev => prev.map(plan => 
          plan.id === data.planId 
            ? { ...plan, attendees: data.attendees }
            : plan
        ));
      } else if (data.type === 'new_plan') {
        setPlans(prev => [...prev, data.plan]);
      }
    };

    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    return () => {
      ws.close();
    };
  }, []);

  const joinPlan = (planId: number) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify({
        type: 'join_plan',
        planId,
        user: 'You'
      }));
    }
  };

  const createPlan = () => {
    if (wsRef.current && isConnected && newPlan.event && newPlan.meetPlace && newPlan.meetTime) {
      wsRef.current.send(JSON.stringify({
        type: 'create_plan',
        plan: {
          id: Date.now(),
          event: newPlan.event,
          meetPlace: newPlan.meetPlace,
          meetTime: newPlan.meetTime,
          attendees: 1
        }
      }));
      setNewPlan({ event: '', meetPlace: '', meetTime: '' });
      setShowCreateForm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#171717] rounded-2xl border border-[#DDAA52]/30 w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <h3 className="text-[#FFFFFF] font-bold">Group Planning</h3>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
          </div>
          <button onClick={onClose} className="text-[#FFFFFF]/70 hover:text-[#FFFFFF]">×</button>
        </div>
        
        <div className="space-y-4">
          <div className="bg-[#171717]/50 rounded-xl p-4 border border-[#DDAA52]/20">
            <h4 className="text-[#FFFFFF] font-medium mb-3">Active Group Plans</h4>
            <div className="space-y-3">
              {plans.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-[#FFFFFF]/40 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <p className="text-[#FFFFFF]/60 text-sm">No active plans yet. Create one to get started!</p>
                </div>
              ) : (
                plans.map((plan) => (
                  <div key={plan.id} className="bg-[#171717] rounded-lg p-3 border border-[#DDAA52]/30">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-[#FFFFFF] font-medium">{plan.event}</h5>
                      <span className="text-[#DDAA52] text-sm">{plan.attendees} people</span>
                    </div>
                    <div className="text-[#FFFFFF]/70 text-sm space-y-1">
                      <p>📍 Meet at: {plan.meetPlace}</p>
                      <p>🕐 Time: {plan.meetTime}</p>
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button 
                        onClick={() => joinPlan(plan.id)}
                        className="bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black px-3 py-1 rounded-lg text-xs font-medium hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
                      >
                        Join Plan
                      </button>
                      <button className="bg-[#A31818] text-[#FFFFFF] px-3 py-1 rounded-lg text-xs font-medium hover:bg-[#CF0E0E] transition-all">
                        Chat
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {showCreateForm ? (
            <div className="bg-[#171717]/50 rounded-xl p-4 border border-[#DDAA52]/20 space-y-3">
              <h4 className="text-[#FFFFFF] font-medium">Create New Plan</h4>
              <input
                type="text"
                placeholder="Event name"
                value={newPlan.event}
                onChange={(e) => setNewPlan({...newPlan, event: e.target.value})}
                className="w-full px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF] placeholder-[#FFFFFF]/50"
              />
              <input
                type="text"
                placeholder="Meeting place"
                value={newPlan.meetPlace}
                onChange={(e) => setNewPlan({...newPlan, meetPlace: e.target.value})}
                className="w-full px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF] placeholder-[#FFFFFF]/50"
              />
              <input
                type="time"
                value={newPlan.meetTime}
                onChange={(e) => setNewPlan({...newPlan, meetTime: e.target.value})}
                className="w-full px-3 py-2 bg-[#171717] border border-[#DDAA52]/30 rounded-lg text-[#FFFFFF]"
              />
              <div className="flex space-x-2">
                <button
                  onClick={createPlan}
                  className="flex-1 bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-2 px-4 rounded-lg font-medium hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-[#171717] text-[#FFFFFF] py-2 px-4 rounded-lg font-medium hover:bg-[#171717]/80 transition-all border border-[#DDAA52]/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full bg-gradient-to-r from-[#FB8B24] to-[#DDAA52] text-black py-3 px-4 rounded-xl font-semibold hover:from-[#DDAA52] hover:to-[#FB8B24] transition-all"
            >
              Create New Group Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}