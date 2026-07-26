import React, { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile } from '../../types';
import { 
  Shield, Eye, Lock, Globe, Users, UserX, Check, Sparkles, X, 
  Clock, CheckCircle2, AlertCircle, MessageSquare, Info 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatLastSeenDetailed, updateUserActiveStatus } from '../../lib/presence';

interface ChatPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onUpdatePreferences?: (newPrefs: any) => void;
}

export default function ChatPrivacyModal({
  isOpen,
  onClose,
  userProfile,
  onUpdatePreferences
}: ChatPrivacyModalProps) {
  const [lastSeenVisibility, setLastSeenVisibility] = useState<'everyone' | 'contacts' | 'nobody'>(
    (userProfile as any).lastSeenVisibility || (userProfile as any).preferences?.lastSeenVisibility || 'everyone'
  );

  const [onlineStatusVisibility, setOnlineStatusVisibility] = useState<'everyone' | 'same_as_last_seen' | 'nobody'>(
    (userProfile as any).onlineStatusVisibility || (userProfile as any).preferences?.onlineStatusVisibility || 'everyone'
  );

  const [statusMessage, setStatusMessage] = useState<string>(
    (userProfile as any).statusMessage || (userProfile as any).preferences?.statusMessage || 'Available 👋'
  );

  const [existingPrefs, setExistingPrefs] = useState<Record<string, any>>((userProfile as any).preferences || {});
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !userProfile?.uid) return;

    let isMounted = true;
    const loadLatestSettings = async () => {
      try {
        const userSnap = await getDoc(doc(db, 'users', userProfile.uid));
        if (userSnap.exists() && isMounted) {
          const data = userSnap.data();
          const prefs = data.preferences || {};
          setExistingPrefs(prefs);
          setLastSeenVisibility(data.lastSeenVisibility || prefs.lastSeenVisibility || 'everyone');
          setOnlineStatusVisibility(data.onlineStatusVisibility || prefs.onlineStatusVisibility || 'everyone');
          setStatusMessage(data.statusMessage || prefs.statusMessage || 'Available 👋');
        } else if (isMounted) {
          const prefs = (userProfile as any).preferences || {};
          setExistingPrefs(prefs);
          setLastSeenVisibility((userProfile as any).lastSeenVisibility || prefs.lastSeenVisibility || 'everyone');
          setOnlineStatusVisibility((userProfile as any).onlineStatusVisibility || prefs.onlineStatusVisibility || 'everyone');
          setStatusMessage((userProfile as any).statusMessage || prefs.statusMessage || 'Available 👋');
        }
      } catch (err) {
        console.error("Error fetching fresh user privacy settings:", err);
      }
    };

    loadLatestSettings();

    return () => {
      isMounted = false;
    };
  }, [isOpen, userProfile?.uid]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    const now = new Date().toISOString();
    const updatePayload = {
      lastSeenVisibility,
      onlineStatusVisibility,
      statusMessage,
      lastSeen: now,
      lastActiveAt: now,
      preferences: {
        ...(existingPrefs || (userProfile as any).preferences || {}),
        lastSeenVisibility,
        onlineStatusVisibility,
        statusMessage
      }
    };

    try {
      if (userProfile.uid) {
        const userRef = doc(db, 'users', userProfile.uid);
        await setDoc(userRef, updatePayload, { merge: true });

        const profileRef = doc(db, 'user_profiles', userProfile.uid);
        await setDoc(profileRef, updatePayload, { merge: true }).catch(() => {});

        // Also refresh active status
        await updateUserActiveStatus(userProfile.uid, true, {
          lastSeenVisibility,
          onlineStatusVisibility,
          statusMessage
        });
      }

      if (onUpdatePreferences) {
        onUpdatePreferences({
          lastSeenVisibility,
          onlineStatusVisibility,
          statusMessage
        });
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error("Error saving privacy settings:", err);
      setErrorMessage(err.message || "Failed to save privacy settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const statusPresets = [
    'Available 👋',
    'In Class 📚',
    'Studying 📖',
    'Busy / Do Not Disturb 🚫',
    'Focus Mode ⚡',
    'At Lunch 🥗'
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight leading-snug">Privacy & Active Status</h3>
                <p className="text-xs text-emerald-100 font-medium">Control who can see your Online status & Last Seen</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar text-slate-800">
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* User Active Status Preview Card */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center gap-3.5">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-base overflow-hidden ring-2 ring-emerald-500/30">
                  {userProfile.photoURL ? (
                    <img src={userProfile.photoURL} alt="" className="w-full h-full object-cover" />
                  ) : (
                    userProfile.displayName?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                {onlineStatusVisibility !== 'nobody' && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 truncate">{userProfile.displayName}</h4>
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Active Preview
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold mt-0.5 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${onlineStatusVisibility === 'nobody' ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
                  {onlineStatusVisibility === 'nobody' ? (
                    <span className="text-slate-500 italic">Online Status Hidden</span>
                  ) : (
                    <span>Online &bull; Active Now</span>
                  )}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {lastSeenVisibility === 'nobody' ? (
                    <span className="text-slate-400 italic">Last seen hidden (Nobody)</span>
                  ) : (
                    <span>Last seen {formatLastSeenDetailed(new Date().toISOString())}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Custom Status Message Presets */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Custom Status Preset
              </label>
              <input
                type="text"
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="e.g. In Class 📚 or Focus Mode ⚡"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {statusPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStatusMessage(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      statusMessage === preset
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 1: Who Can See My Last Seen */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" /> Who can see my Last Seen
                  </h4>
                  <p className="text-[11px] text-slate-500">Controls visibility of your last seen day & time</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'everyone',
                    title: 'Everyone',
                    desc: 'All members in your school organization can see your last seen date & time',
                    icon: Globe
                  },
                  {
                    id: 'contacts',
                    title: 'My Contacts & Group Members',
                    desc: 'Only users you have active messages or direct channels with',
                    icon: Users
                  },
                  {
                    id: 'nobody',
                    title: 'Nobody',
                    desc: 'No one can see when you were last online',
                    icon: UserX
                  }
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = lastSeenVisibility === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setLastSeenVisibility(opt.id as any)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500/80 ring-1 ring-emerald-500/40'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                            {opt.title}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Who Can See When I'm Online */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" /> Who can see when I'm Online
                  </h4>
                  <p className="text-[11px] text-slate-500">Controls real-time green online presence indicator</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'everyone',
                    title: 'Everyone',
                    desc: 'Show green online indicator whenever you are active',
                    icon: Globe
                  },
                  {
                    id: 'same_as_last_seen',
                    title: 'Same as Last Seen',
                    desc: 'Inherits the visibility selection set for Last Seen above',
                    icon: Shield
                  },
                  {
                    id: 'nobody',
                    title: 'Nobody',
                    desc: 'Hide online presence status completely',
                    icon: UserX
                  }
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = onlineStatusVisibility === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setOnlineStatusVisibility(opt.id as any)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500/80 ring-1 ring-emerald-500/40'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${isSelected ? 'text-emerald-950' : 'text-slate-800'}`}>
                            {opt.title}
                          </span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Privacy Rule Hint Banner */}
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                <strong>Note:</strong> If you set your Last Seen or Online status to <em>Nobody</em>, you will also not be able to see other users' Last Seen or Online status in chat windows.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Save Privacy Settings</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
