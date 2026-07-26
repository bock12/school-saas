'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PhoneOff, Phone, Video, VideoOff, Mic, MicOff,
  Volume2, VolumeX, Minimize2, Maximize2, RotateCcw,
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
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const signalChannelRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  const signalingChannelName = `webrtc:${[currentUser.id, callState.peerId].sort().join(':')}:${callState.channelId}`;

  // ── Start media + peer connection ──────────────────────────────────────────
  const startMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callState.type === 'video',
      });
      setLocalStream(stream);
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = (e) => {
        const [remStream] = e.streams;
        setRemoteStream(remStream);
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

      return pc;
    } catch (err) {
      console.error('Media error:', err);
      setStatus('ended');
      return null;
    }
  }, [callState.type, currentUser.id]);

  // ── Setup WebRTC signaling channel ─────────────────────────────────────────
  useEffect(() => {
    const sigCh = supabase.channel(signalingChannelName);
    signalChannelRef.current = sigCh;

    sigCh
      .on('broadcast', { event: 'offer' }, async ({ payload }) => {
        if (payload.to !== currentUser.id) return;
        const pc = pcRef.current || await startMedia();
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        sigCh.send({ type: 'broadcast', event: 'answer', payload: { sdp: answer, to: payload.from, from: currentUser.id } });
        setStatus('active');
      })
      .on('broadcast', { event: 'answer' }, async ({ payload }) => {
        if (payload.to !== currentUser.id) return;
        const pc = pcRef.current;
        if (pc && pc.signalingState !== 'stable') {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
        setStatus('active');
      })
      .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
        if (payload.from === currentUser.id) return;
        try { await pcRef.current?.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
      })
      .on('broadcast', { event: 'call-end' }, ({ payload }) => {
        if (payload.from !== currentUser.id) endCall(false);
      })
      .on('broadcast', { event: 'call-accept' }, async () => {
        // Caller receives accept → create offer
        const pc = pcRef.current;
        if (!pc) return;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        sigCh.send({ type: 'broadcast', event: 'offer', payload: { sdp: offer, to: callState.peerId, from: currentUser.id } });
      })
      .subscribe();

    // If outgoing call: start media and send invite (already sent from parent, wait for accept)
    if (callState.direction === 'outgoing') {
      startMedia();
    }

    // Ringtone for incoming
    if (callState.direction === 'incoming') {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const gainNode = ctx.createGain();
          gainNode.gain.value = 0.2;
          gainNode.connect(ctx.destination);
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = 880;
          osc.connect(gainNode);
          osc.start();
          let isStopped = false;
          ringtoneRef.current = {
            stop: () => {
              if (isStopped) return;
              isStopped = true;
              try { osc.stop(); } catch {}
              if (ctx.state !== 'closed') {
                ctx.close().catch(() => {});
              }
            },
          } as any;
        }
      } catch {}
    }

    return () => {
      supabase.removeChannel(sigCh);
      (ringtoneRef.current as any)?.stop?.();
    };
  }, []);

  // ── Duration timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  // ── End call ──────────────────────────────────────────────────────────────
  const endCall = useCallback((sendSignal = true) => {
    if (sendSignal) {
      signalChannelRef.current?.send({ type: 'broadcast', event: 'call-end', payload: { from: currentUser.id } });
    }
    pcRef.current?.close();
    localStream?.getTracks().forEach(t => t.stop());
    setStatus('ended');
    (ringtoneRef.current as any)?.stop?.();
    setTimeout(onClose, 1200);
  }, [localStream, currentUser.id, onClose]);

  // ── Accept incoming call ───────────────────────────────────────────────────
  const acceptCall = useCallback(async () => {
    (ringtoneRef.current as any)?.stop?.();
    setStatus('connecting');
    const pc = await startMedia();
    if (!pc) return;
    // Signal caller we accepted
    signalChannelRef.current?.send({ type: 'broadcast', event: 'call-accept', payload: { from: currentUser.id } });
  }, [startMedia, currentUser.id]);

  // ── Toggle mic ────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(m => !m);
  }, [localStream]);

  // ── Toggle video ──────────────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsVideoOff(v => !v);
  }, [localStream]);

  // ── Speaker ───────────────────────────────────────────────────────────────
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

          {/* Peer avatar / video */}
          {!isMinimized && (
            <div className="flex flex-col items-center gap-4 flex-1 justify-center w-full">
              {/* Call type badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider">
                {isVideo ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {isVideo ? 'Video Call' : 'Voice Call'}
              </div>

              {/* Remote video / avatar */}
              {isVideo && status === 'active' ? null : (
                <div className={`w-24 h-24 rounded-full ${avatarColor(callState.peerId)} text-white flex items-center justify-center font-bold text-3xl shadow-xl border-4 border-white/20 relative`}>
                  {callState.peerAvatar
                    ? <img src={callState.peerAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                    : getInitials(callState.peerName)}
                  {status === 'active' && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </span>
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
              </div>

              {/* Local video PiP */}
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

          {/* Minimized peer info */}
          {isMinimized && (
            <div className="flex items-center gap-3 w-full">
              <div className={`w-10 h-10 rounded-full ${avatarColor(callState.peerId)} text-white flex items-center justify-center font-bold text-sm shrink-0`}>
                {callState.peerAvatar ? <img src={callState.peerAvatar} alt="" className="w-full h-full rounded-full object-cover" /> : getInitials(callState.peerName)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">{callState.peerName}</p>
                <p className="text-[10px] text-white/50">{status === 'active' ? formatDuration(duration) : status}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className={`flex items-center justify-center gap-4 ${isMinimized ? 'mt-3' : 'mt-auto pt-6'}`}>

            {/* Ringing state: Decline + Accept */}
            {status === 'ringing' && callState.direction === 'incoming' ? (
              <>
                <button onClick={() => endCall(true)}
                  className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors">
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button onClick={acceptCall}
                  className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:bg-emerald-700 transition-colors animate-bounce">
                  <Phone className="w-6 h-6" />
                </button>
              </>
            ) : (
              <>
                {/* Mic toggle */}
                <button onClick={toggleMic}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                {/* End call */}
                <button onClick={() => endCall(true)}
                  className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:bg-rose-700 transition-colors">
                  <PhoneOff className="w-6 h-6" />
                </button>

                {/* Video toggle (video calls only) */}
                {isVideo && (
                  <button onClick={toggleVideo}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                    {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                  </button>
                )}

                {/* Speaker toggle (voice only) */}
                {!isVideo && (
                  <button onClick={toggleSpeaker}
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
