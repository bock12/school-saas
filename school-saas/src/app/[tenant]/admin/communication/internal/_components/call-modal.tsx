'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneOff, Phone, Video, VideoOff, Mic, MicOff,
  Volume2, VolumeX, Minimize2, Maximize2, Monitor, MonitorOff, Users,
} from 'lucide-react';
import type { CallState } from './messaging-client';
import type { ChatUser } from './actions';
import { logCallMessage } from './actions';
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

interface PeerTile {
  peerId: string;
  peerName: string;
  peerAvatar: string | null;
  stream: MediaStream | null;
}

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
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [peerTiles, setPeerTiles] = useState<PeerTile[]>(
    callState.peerIds.map(id => ({
      peerId: id,
      peerName: callState.isGroup ? `Peer ${id.slice(0, 4)}` : callState.peerName,
      peerAvatar: callState.isGroup ? null : callState.peerAvatar,
      stream: null,
    }))
  );

  // One RTCPeerConnection per peer for group mesh
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const signalChannelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneRef = useRef<any>(null);
  const pendingCandidates = useRef<Map<string, RTCIceCandidate[]>>(new Map());
  const endCallRef = useRef<(sendSignal?: boolean) => void>(() => {});
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const statusRef = useRef(status);
  const durationRef = useRef(duration);
  const loggedCallRef = useRef(false);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  const signalingChannelName = `webrtc:${[currentUser.id, ...callState.peerIds].sort().join(':')}:${callState.channelId}`;


  // ── Create peer connection for a single peer ───────────────────────────────
  const createPeerConnection = useCallback((peerId: string) => {
    if (pcsRef.current.has(peerId)) return pcsRef.current.get(peerId)!;

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcsRef.current.set(peerId, pc);

    // Add local tracks
    localStreamRef.current?.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    pc.ontrack = (e) => {
      const [remStream] = e.streams;
      const el = remoteVideoRefs.current.get(peerId);
      if (el) el.srcObject = remStream;
      setPeerTiles(prev => prev.map(t =>
        t.peerId === peerId ? { ...t, stream: remStream } : t
      ));
      setStatus('active');
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        signalChannelRef.current?.send({
          type: 'broadcast', event: 'ice-candidate',
          payload: { candidate: e.candidate, from: currentUser.id, to: peerId },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        setPeerTiles(prev => prev.map(t => t.peerId === peerId ? { ...t, stream: null } : t));
      }
    };

    // Flush buffered ICE candidates
    const buffered = pendingCandidates.current.get(peerId) || [];
    buffered.forEach(c => { try { pc.addIceCandidate(c); } catch { } });
    pendingCandidates.current.delete(peerId);

    return pc;
  }, [currentUser.id]);

  // ── Start local media ──────────────────────────────────────────────────────
  const startMedia = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.type === 'video',
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return true;
    } catch (err: any) {
      const msg = err?.name === 'NotAllowedError'
        ? 'Camera/Mic permission denied. Please allow access and try again.'
        : 'Could not access camera or microphone.';
      setMediaError(msg);
      setStatus('ended');
      return false;
    }
  }, [callState.type]);

  // ── Screen sharing ─────────────────────────────────────────────────────────
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen share, restore camera
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
      const camTrack = localStreamRef.current?.getVideoTracks()[0];
      if (camTrack) {
        pcsRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(camTrack);
        });
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        screenStreamRef.current = screen;
        const screenTrack = screen.getVideoTracks()[0];

        pcsRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        });

        // Local preview
        if (localVideoRef.current) localVideoRef.current.srcObject = screen;

        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } catch {
        // User cancelled or permission denied
      }
    }
  }, [isScreenSharing]);

  // ── Signaling channel setup ────────────────────────────────────────────────
  useEffect(() => {
    const sigCh = supabase.channel(signalingChannelName, {
      config: { broadcast: { self: false } },
    });
    signalChannelRef.current = sigCh;

    sigCh
      // Callee receives offer
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.to !== currentUser.id) return;
        const pc = createPeerConnection(payload.from);
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sigCh.send({
          type: 'broadcast', event: 'answer',
          payload: { sdp: answer, to: payload.from, from: currentUser.id },
        });
        setStatus('active');
      })
      // Caller receives answer
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.to !== currentUser.id) return;
        const pc = pcsRef.current.get(payload.from);
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
        setStatus('active');
      })
      // ICE candidate
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.from === currentUser.id) return;
        if (payload.to && payload.to !== currentUser.id) return;
        const candidate = new RTCIceCandidate(payload.candidate);
        const pc = pcsRef.current.get(payload.from);
        if (pc && pc.remoteDescription) {
          try { await pc.addIceCandidate(candidate); } catch { }
        } else {
          const buf = pendingCandidates.current.get(payload.from) || [];
          buf.push(candidate);
          pendingCandidates.current.set(payload.from, buf);
        }
      })
      // Peer ended
      .on('broadcast', { event: 'call-end' }, ({ payload }) => {
        if (payload.from !== currentUser.id) endCallRef.current(false);
      })
      // Peer accepted (DM flow: callee accepts → caller sends offer)
      .on('broadcast', { event: 'call-accept' }, async ({ payload }) => {
        if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        const acceptingPeerId = payload.from;
        const pc = createPeerConnection(acceptingPeerId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sigCh.send({
          type: 'broadcast', event: 'offer',
          payload: { sdp: offer, to: acceptingPeerId, from: currentUser.id },
        });
      })
      .subscribe();

    // Outgoing call: start media and wait for peers to accept
    if (callState.direction === 'outgoing') {
      startMedia();
      ringTimeoutRef.current = setTimeout(() => endCallRef.current(true), 30000);
    }

    // Incoming: ringtone
    if (callState.direction === 'incoming') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const gainNode = ctx.createGain();
          gainNode.gain.value = 0.15;
          gainNode.connect(ctx.destination);
          const playBeep = () => {
            const osc = ctx.createOscillator();
            osc.type = 'sine'; osc.frequency.value = 880;
            osc.connect(gainNode);
            osc.start();
            setTimeout(() => { try { osc.stop(); } catch { } }, 300);
          };
          playBeep();
          const ringInterval = setInterval(playBeep, 1200);
          let stopped = false;
          ringtoneRef.current = {
            stop: () => {
              if (stopped) return; stopped = true;
              clearInterval(ringInterval);
              if (ctx.state !== 'closed') ctx.close().catch(() => { });
            },
          };
        }
      } catch { }
    }

    return () => {
      supabase.removeChannel(sigCh);
      ringtoneRef.current?.stop?.();
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // Record call log message into chat if caller or if missed
    if (!loggedCallRef.current) {
      loggedCallRef.current = true;
      const isCaller = callState.direction === 'outgoing';
      const wasActive = statusRef.current === 'active';
      // Only log once (caller logs, or callee if declined while incoming)
      if (isCaller || statusRef.current === 'ringing') {
        const callStatus = wasActive ? 'completed' : 'missed';
        const durStr = wasActive && durationRef.current > 0 ? formatDuration(durationRef.current) : undefined;
        logCallMessage(callState.channelId, callState.type, callStatus, durStr).catch(() => {});
      }
    }

    pcsRef.current.forEach(pc => pc.close());
    pcsRef.current.clear();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    setStatus('ended');
    ringtoneRef.current?.stop?.();
    setTimeout(onClose, 1200);
  }, [currentUser.id, onClose, callState.channelId, callState.type, callState.direction]);

  useEffect(() => { endCallRef.current = endCall; }, [endCall]);


  // ── Accept incoming call ───────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    ringtoneRef.current?.stop?.();
    setStatus('connecting');
    const ok = await startMedia();
    if (!ok) return;
    signalChannelRef.current?.send({
      type: 'broadcast', event: 'call-accept',
      payload: { from: currentUser.id },
    });
  }, [startMedia, currentUser.id]);

  const toggleMic = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(m => !m);
  }, []);

  const toggleVideo = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsVideoOff(v => !v);
  }, []);

  const toggleSpeaker = useCallback(() => {
    remoteVideoRefs.current.forEach(el => { el.muted = !isSpeakerOff; });
    setIsSpeakerOff(s => !s);
  }, [isSpeakerOff]);

  const isVideo = callState.type === 'video';
  const hasActivePeers = peerTiles.some(t => t.stream);

  return (
    <div className={`fixed z-[100] transition-all duration-300 ${isMinimized
      ? 'bottom-6 right-6 w-72 h-auto rounded-2xl shadow-2xl overflow-hidden'
      : 'inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center'
    }`}>
      <div className={`relative ${isMinimized
        ? 'w-full bg-gray-900 rounded-2xl'
        : 'w-full max-w-xl bg-gray-900 rounded-3xl shadow-2xl overflow-hidden'
      }`}>

        {/* ── Grid of remote video tiles (video call + active) ── */}
        {isVideo && status === 'active' && !isMinimized && hasActivePeers && (
          <div className={`grid gap-1 ${peerTiles.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} absolute inset-0`}>
            {peerTiles.map(tile => (
              <div key={tile.peerId} className="relative bg-gray-800 overflow-hidden">
                {tile.stream
                  ? <video
                      ref={el => {
                        if (el) {
                          remoteVideoRefs.current.set(tile.peerId, el);
                          if (tile.stream && el.srcObject !== tile.stream) el.srcObject = tile.stream;
                        }
                      }}
                      autoPlay playsInline
                      className="w-full h-full object-cover"
                    />
                  : <div className={`w-full h-full flex items-center justify-center ${avatarColor(tile.peerId)}`}>
                      <span className="text-white font-bold text-2xl">{getInitials(tile.peerName)}</span>
                    </div>
                }
                {isScreenSharing && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Monitor className="w-2.5 h-2.5" /> Sharing Screen
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                  {tile.peerName.split(' ')[0]}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Main content ── */}
        <div className={`relative flex flex-col items-center ${isMinimized ? 'p-4' : 'p-8 min-h-[480px]'} ${(isVideo && status === 'active' && hasActivePeers && !isMinimized) ? 'bg-black/40' : 'bg-gray-900'}`}>

          {/* Minimize/maximize */}
          <button onClick={() => setIsMinimized(m => !m)}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 z-10">
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* ── Expanded view ── */}
          {!isMinimized && (
            <div className="flex flex-col items-center gap-4 flex-1 justify-center w-full">
              {/* Call type badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                {callState.isGroup ? <Users className="w-3 h-3" /> : isVideo ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {callState.isGroup ? 'Group Call' : isVideo ? 'Video Call' : 'Voice Call'}
              </div>

              {/* Avatar (voice or no video stream yet) */}
              {!(isVideo && status === 'active' && hasActivePeers) && (
                <div className={`w-24 h-24 rounded-full ${avatarColor(callState.peerId)} text-white flex items-center justify-center font-bold text-3xl shadow-xl border-4 border-white/20 relative`}>
                  {callState.peerAvatar
                    ? <img src={callState.peerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : callState.isGroup ? <Users className="w-10 h-10" /> : getInitials(callState.peerName)}
                  {status === 'active' && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </span>
                  )}
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

              {/* Local video PiP */}
              {isVideo && (
                <div className="absolute bottom-28 right-4 w-24 h-32 rounded-xl overflow-hidden border-2 border-white/30 shadow-lg">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  {isVideoOff && !isScreenSharing && (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                      <VideoOff className="w-5 h-5 text-white/40" />
                    </div>
                  )}
                  {isScreenSharing && (
                    <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">Screen</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Minimized view ── */}
          {isMinimized && (
            <div className="flex items-center gap-3 w-full">
              <div className={`w-10 h-10 rounded-full ${avatarColor(callState.peerId)} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                {callState.peerAvatar ? <img src={callState.peerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                  : callState.isGroup ? <Users className="w-5 h-5" /> : getInitials(callState.peerName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{callState.peerName}</p>
                <p className="text-[10px] text-white/50">{status === 'active' ? formatDuration(duration) : status}</p>
              </div>
            </div>
          )}

          {/* ── Call controls ── */}
          <div className={`flex items-center justify-center gap-3 ${isMinimized ? 'mt-3' : 'mt-auto pt-6'}`}>
            {status === 'ringing' && callState.direction === 'incoming' ? (
              <>
                <button onClick={() => endCall(true)} title="Decline"
                  className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors">
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button onClick={acceptCall} title="Accept"
                  className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors animate-bounce">
                  <Phone className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                {/* Mic */}
                <button onClick={toggleMic} title={isMuted ? 'Unmute' : 'Mute'}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* Screen share (video calls only) */}
                {isVideo && status === 'active' && !isMinimized && (
                  <button onClick={toggleScreenShare} title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isScreenSharing ? 'bg-blue-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                  </button>
                )}

                {/* End call */}
                <button onClick={() => endCall(true)} title="End Call"
                  className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors">
                  <PhoneOff className="w-6 h-6" />
                </button>

                {/* Video / Speaker toggle */}
                {isVideo ? (
                  <button onClick={toggleVideo} title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                ) : (
                  <button onClick={toggleSpeaker} title={isSpeakerOff ? 'Unmute Speaker' : 'Mute Speaker'}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isSpeakerOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
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
