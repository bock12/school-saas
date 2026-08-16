'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneOff, Phone, Video, VideoOff, Mic, MicOff,
  Volume2, VolumeX, Minimize2, Maximize2,
} from 'lucide-react';
import type { CallState } from './messaging-client';
import type { ChatUser } from './actions';
import type { SupabaseClient } from '@supabase/supabase-js';

const AVATAR_COLORS = ['bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-sky-600', 'bg-fuchsia-600'];
function avatarColor(id: string) { return AVATAR_COLORS[(id.charCodeAt(0) || 0) % AVATAR_COLORS.length]; }
function getInitials(name: string) { return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(); }
function formatDuration(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = (sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

interface CallModalProps {
  callState: CallState;
  currentUser: ChatUser;
  supabase: SupabaseClient;
  onClose: () => void;
}

export default function CallModal({ callState, currentUser, supabase, onClose }: CallModalProps) {
  const [status, setStatus] = useState<'ringing' | 'connecting' | 'active' | 'ended'>(
    callState.direction === 'incoming' ? 'ringing' : 'connecting'
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callState.type === 'voice');
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [duration, setDuration] = useState(0);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  // Refs — stable across renders, safe to use inside useEffect/broadcast handlers
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const signalChannelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneRef = useRef<any>(null);
  const pendingCandidates = useRef<RTCIceCandidate[]>([]);
  // Stable ref to endCall so broadcast handlers don't capture stale closures
  const endCallRef = useRef<(sendSignal?: boolean) => void>(() => {});
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const signalingChannelName = `webrtc:${[currentUser.id, callState.peerId].sort().join(':')}:${callState.channelId}`;

  // ── Start media + peer connection ──────────────────────────────────────────
  // Returns the RTCPeerConnection on success, null on failure.
  const startMedia = useCallback(async (): Promise<RTCPeerConnection | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.type === 'video',
      });
      setLocalStream(stream);
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        const [remStream] = e.streams;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remStream;
        setStatus('active');
      };

      pc.onicecandidate = (e) => {
        if (e.candidate) {
          signalChannelRef.current?.send({
            type: 'broadcast', event: 'ice-candidate',
            payload: { candidate: e.candidate, from: currentUser.id },
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          setStatus('ended');
        }
      };

      // Flush buffered ICE candidates that arrived before remote description was set
      for (const c of pendingCandidates.current) {
        try { await pc.addIceCandidate(c); } catch { /* ignore */ }
      }
      pendingCandidates.current = [];

      return pc;
    } catch (err: any) {
      console.error('Media error:', err);
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera/Mic permission denied. Please allow access and try again.'
        : 'Could not access camera or microphone.';
      setMediaError(msg);
      setStatus('ended');
      return null;
    }
  }, [callState.type, currentUser.id]);

  // ── Setup WebRTC signaling channel ──────────────────────────────────────────
  // Runs once on mount. Broadcast handlers use refs (endCallRef) to avoid
  // capturing stale state in the closure.
  useEffect(() => {
    const sigCh = supabase.channel(signalingChannelName, {
      config: { broadcast: { self: false } },
    });
    signalChannelRef.current = sigCh;

    sigCh
      // Incoming callee receives offer → create answer
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.to !== currentUser.id) return;
        const pc = pcRef.current || await startMedia();
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sigCh.send({
          type: 'broadcast', event: 'answer',
          payload: { sdp: answer, to: payload.from, from: currentUser.id },
        });
        setStatus('active');
      })
      // Caller receives answer → set remote description
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.to !== currentUser.id) return;
        const pc = pcRef.current;
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
        setStatus('active');
      })
      // ICE candidate exchange — buffer if remote description not yet set
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.from === currentUser.id) return;
        const candidate = new RTCIceCandidate(payload.candidate);
        const pc = pcRef.current;
        if (pc && pc.remoteDescription) {
          try { await pc.addIceCandidate(candidate); } catch { /* ignore */ }
        } else {
          pendingCandidates.current.push(candidate);
        }
      })
      // Peer ended the call
      .on('broadcast', { event: 'call-end' }, ({ payload }) => {
        if (payload.from !== currentUser.id) endCallRef.current(false);
      })
      // Peer accepted → caller creates and sends offer
      .on('broadcast', { event: 'call-accept' }, async () => {
        if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        const pc = pcRef.current;
        if (!pc) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sigCh.send({
          type: 'broadcast', event: 'offer',
          payload: { sdp: offer, to: callState.peerId, from: currentUser.id },
        });
      })
      .subscribe();

    // Outgoing call: start media immediately, then wait for call-accept signal
    if (callState.direction === 'outgoing') {
      startMedia();
      // Auto-cancel if peer doesn't answer within 30 seconds
      ringTimeoutRef.current = setTimeout(() => {
        endCallRef.current(true);
      }, 30000);
    }

    // Incoming call: play a ringtone oscillator
    if (callState.direction === 'incoming') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const gainNode = ctx.createGain();
          gainNode.gain.value = 0.15;
          gainNode.connect(ctx.destination);

          // Create a simple two-tone ring pattern
          const playBeep = () => {
            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = 880;
            osc.connect(gainNode);
            osc.start();
            setTimeout(() => { try { osc.stop(); } catch { /* ignore */ } }, 300);
          };

          playBeep();
          const ringInterval = setInterval(playBeep, 1200);
          let isStopped = false;
          ringtoneRef.current = {
            stop: () => {
              if (isStopped) return;
              isStopped = true;
              clearInterval(ringInterval);
              if (ctx.state !== 'closed') ctx.close().catch(() => {});
            },
          };
        }
      } catch { /* ignore */ }
    }

    return () => {
      supabase.removeChannel(sigCh);
      ringtoneRef.current?.stop?.();
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — stable via refs

  // ── Duration timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  // ── End call ───────────────────────────────────────────────────────────────
  const endCall = useCallback((sendSignal = true) => {
    if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    if (sendSignal) {
      signalChannelRef.current?.send({
        type: 'broadcast', event: 'call-end',
        payload: { from: currentUser.id },
      });
    }
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    setStatus('ended');
    ringtoneRef.current?.stop?.();
    setTimeout(onClose, 1200);
  }, [currentUser.id, onClose]);

  // Keep endCallRef always pointing to the latest endCall (avoids stale closure in broadcasts)
  useEffect(() => { endCallRef.current = endCall; }, [endCall]);

  // ── Accept incoming call ───────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    ringtoneRef.current?.stop?.();
    setStatus('connecting');
    const pc = await startMedia();
    if (!pc) return;
    // Signal caller we accepted — they will then create an offer
    signalChannelRef.current?.send({
      type: 'broadcast', event: 'call-accept',
      payload: { from: currentUser.id },
    });
  }, [startMedia, currentUser.id]);

  // ── Toggle mic ────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(m => !m);
  }, []);

  // ── Toggle video ──────────────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsVideoOff(v => !v);
  }, []);

  // ── Speaker toggle ────────────────────────────────────────────────────────
  const toggleSpeaker = useCallback(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.muted = !isSpeakerOff;
    setIsSpeakerOff(s => !s);
  }, [isSpeakerOff]);

  const isVideo = callState.type === 'video';

  return (
    <div className={`fixed z-[100] transition-all duration-300 ${
      isMinimized
        ? 'bottom-6 right-6 w-72 h-auto rounded-2xl shadow-2xl overflow-hidden'
        : 'inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center'
    }`}>
      <div className={`relative ${isMinimized
        ? 'w-full bg-gray-900 rounded-2xl'
        : 'w-full max-w-sm bg-gray-900 rounded-3xl shadow-2xl overflow-hidden'
      }`}>

        {/* Remote video (background for video calls) */}
        {isVideo && status === 'active' && (
          <video ref={remoteVideoRef} autoPlay playsInline
            className={`${isMinimized ? 'hidden' : 'absolute inset-0 w-full h-full object-cover'}`} />
        )}

        {/* Main content */}
        <div className={`relative flex flex-col items-center ${isMinimized ? 'p-4' : 'p-8 min-h-[480px]'} ${isVideo && status === 'active' && !isMinimized ? 'bg-black/40' : 'bg-gray-900'}`}>

          {/* Minimize/maximize button */}
          <button onClick={() => setIsMinimized(m => !m)}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors z-10">
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Peer info + avatar (expanded view) */}
          {!isMinimized && (
            <div className="flex flex-col items-center gap-4 flex-1 justify-center w-full">
              {/* Call type badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                {isVideo ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {isVideo ? 'Video Call' : 'Voice Call'}
              </div>

              {/* Avatar / remote video */}
              {!(isVideo && status === 'active') && (
                <div className={`w-24 h-24 rounded-full ${avatarColor(callState.peerId)} text-white flex items-center justify-center font-bold text-3xl shadow-xl border-4 border-white/20 relative`}>
                  {callState.peerAvatar
                    ? <img src={callState.peerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : getInitials(callState.peerName)}
                  {status === 'active' && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </span>
                  )}
                  {/* Pulsing ring animation when ringing/connecting */}
                  {(status === 'ringing' || status === 'connecting') && (
                    <span className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping" />
                  )}
                </div>
              )}

              <div className="text-center">
                <h3 className="text-xl font-black text-white">{callState.peerName}</h3>
                <p className="text-sm text-white/60 mt-1">
                  {status === 'ringing' && (callState.direction === 'incoming' ? '🔔 Incoming call...' : '📞 Calling...')}
                  {status === 'connecting' && '⚡ Connecting...'}
                  {status === 'active' && formatDuration(duration)}
                  {status === 'ended' && '✓ Call ended'}
                </p>
                {mediaError && (
                  <p className="text-xs text-rose-400 mt-2 bg-rose-900/30 px-3 py-1 rounded-lg">{mediaError}</p>
                )}
              </div>

              {/* Local video PiP (video calls) */}
              {isVideo && (
                <div className="absolute bottom-28 right-4 w-24 h-32 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {isVideoOff && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <VideoOff className="w-5 h-5 text-white/40" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Minimized view */}
          {isMinimized && (
            <div className="flex items-center gap-3 w-full">
              <div className={`w-10 h-10 rounded-full ${avatarColor(callState.peerId)} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                {callState.peerAvatar
                  ? <img src={callState.peerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  : getInitials(callState.peerName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{callState.peerName}</p>
                <p className="text-[10px] text-white/50">{status === 'active' ? formatDuration(duration) : status}</p>
              </div>
            </div>
          )}

          {/* Call controls */}
          <div className={`flex items-center justify-center gap-4 ${isMinimized ? 'mt-3' : 'mt-auto pt-6'}`}>

            {status === 'ringing' && callState.direction === 'incoming' ? (
              /* Incoming: Decline + Accept */
              <>
                <button onClick={() => endCall(true)}
                  className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors"
                  title="Decline">
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button onClick={acceptCall}
                  className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors animate-bounce"
                  title="Accept">
                  <Phone className="w-6 h-6" />
                </button>
              </>
            ) : (
              /* Active / connecting: Mic, End, Video/Speaker */
              <>
                <button onClick={toggleMic}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  title={isMuted ? 'Unmute' : 'Mute'}>
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <button onClick={() => endCall(true)}
                  className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors"
                  title="End Call">
                  <PhoneOff className="w-6 h-6" />
                </button>

                {isVideo ? (
                  <button onClick={toggleVideo}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}>
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                ) : (
                  <button onClick={toggleSpeaker}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isSpeakerOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                    title={isSpeakerOff ? 'Unmute Speaker' : 'Mute Speaker'}>
                    {isSpeakerOff ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
