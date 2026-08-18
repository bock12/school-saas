'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, ArrowLeft, Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, Video, Search, Paperclip,
  Smile, X, Reply, Edit2, Trash2, CheckCheck, Check, Download,
  FileText, Image as ImageIcon, Users,
  Mic, Camera, Music, Zap, BarChart2, Calendar, MapPin, Play,
  Pause, Plus, MoreVertical, Star, Forward, Copy, Pin, Info,
  BellOff, LogOut, Flag, RefreshCw, RotateCcw,
} from 'lucide-react';
import type { ChatChannel, ChatMessage, ChatUser } from './actions';
import { sendMessage, editMessage, deleteMessage, toggleReaction, markChannelRead } from './actions';
import { createClient } from '@/lib/supabase/client';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥', '✅', '👏', '🎉'];

const EMOJI_PICKER_CATEGORIES = [
  { label: '🕐', emojis: ['😊','😂','❤️','👍','🔥','✅','🎉','😍','🙏','😭','💯','🤣','✨','🥳','👀','💪','🤝','👋','🫡','🤔'] },
  { label: '😊', emojis: ['😀','😁','😄','😅','😆','😎','🥹','😇','🤩','😋','😜','😝','😛','🤭','🤫','😏','😒','😔','😞','😟','😣','😖','😤','😠','😡','🤬','🤯','😱','😨','😰','😥','🤕','🤒','🤢','🤮','💀'] },
  { label: '👋', emojis: ['👋','🤚','🖐','✋','🖖','👌','🤌','🤏','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝','👍','👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍','💅','🤳','💪','🦾','🦵','🦶','👂','👁','👀'] },
  { label: '📱', emojis: ['📱','💻','⌨️','📷','📸','📹','🎥','📡','📺','📻','🎙️','📚','📖','📝','✏️','🔑','🔒','🔓','🔔','🔕','📢','📣','🎵','🎶','🎸','🎹','🎺','🎻','🥁','🎤','🎧','📞','☎️','📟','📠'] },
  { label: '❤️', emojis: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','✅','❌','⭕','🚫','💯','🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🆗','🆕','🆓','🆙','🆒','🆖','🆚'] },
];

const QUICK_REPLIES = [
  { label: 'Exam Office Verification', text: '✅ Verified with Sierra Leone MBSSE & WAEC guidelines. Marks are validated.' },
  { label: 'Broadsheet Review', text: '📊 Broadsheet review completed. A1–F9 grades and CASS 30% are locked.' },
  { label: 'Invigilation Update', text: '📝 Invigilation hall arrangement is ready. Desks and candidate index cards in place.' },
  { label: 'In Class Teaching', text: '📚 Currently in class. I will review and reply as soon as the lesson ends.' },
  { label: 'Under Review', text: '⏳ Received. Checking the details and will revert shortly.' },
  { label: 'Approved', text: '👍 Approved by Academic Committee. Please proceed with the submission.' },
];

const PRESET_LOCATIONS = [
  { name: 'Central Examination Hall (Memorial Wing)', sub: 'Main Hall • 180 Seating Capacity' },
  { name: 'Senior Science Laboratory', sub: 'Block B • Physics & Chemistry Practicals' },
  { name: 'Academic Registry & Exam Office', sub: 'Administrative Wing • Room 104' },
  { name: 'School Main Auditorium', sub: 'Auditorium • General Assembly & BECE Sittings' },
];

type RichAttachPayload = {
  type: string;
  name: string;
  url?: string;
  size?: number;
  duration?: string;
  options?: string[];
  date?: string;
  venue?: string;
  sub?: string;
};

type QuickReplyItem = {
  label: string;
  text: string;
};

type LocationItem = {
  name: string;
  sub: string;
};

type PollData = {
  question: string;
  options: string[];
};

type EventData = {
  title: string;
  date: string;
  venue: string;
};

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
}

function formatTimestamp(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatLastSeen(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffDays === 0 && d.getDate() === now.getDate()) {
    return `Last seen today at ${timeStr}`;
  } else if (diffDays <= 1 || (diffDays === 0 && d.getDate() !== now.getDate())) {
    return `Last seen yesterday at ${timeStr}`;
  } else if (diffDays < 7) {
    const dayName = d.toLocaleDateString([], { weekday: 'long' });
    return `Last seen ${dayName} at ${timeStr}`;
  } else {
    const dateFormatted = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `Last seen ${dateFormatted} at ${timeStr}`;
  }
}

function formatDateDivider(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}


function parseDurationSec(durationStr?: string): number {
  if (!durationStr) return 5;
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return Math.max(1, parts[0] * 60 + parts[1]);
  }
  const s = parseFloat(durationStr);
  return !isNaN(s) && s > 0 ? s : 5;
}

// Convert Base64 data URL to an in-memory playable Blob URL
function getPlayableAudioUrl(url?: string): string | null {
  if (!url || url === '#' || url.length < 10) return null;
  if (url.startsWith('blob:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  if (url.startsWith('data:audio/')) {
    try {
      const parts = url.split(';base64,');
      const contentType = parts[0]?.replace('data:', '') || 'audio/webm';
      const byteCharacters = atob(parts[1] || parts[0]);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        byteArrays.push(new Uint8Array(byteNumbers));
      }
      const blob = new Blob(byteArrays, { type: contentType });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.warn('Could not parse base64 audio, returning raw url:', e);
      return url;
    }
  }
  return url;
}

const AVATAR_COLORS = ['bg-violet-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-sky-600', 'bg-fuchsia-600'];
function avatarColor(id: string) {
  return AVATAR_COLORS[(id.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

interface ChatWindowProps {
  channel: ChatChannel | null;
  messages: ChatMessage[];
  currentUserId: string;
  currentUser: ChatUser;
  onBack: () => void;
  onMessagesChange: (msgs: ChatMessage[]) => void;
  onStartCall?: (channelId: string, type: 'voice' | 'video') => void;
}

export default function ChatWindow({
  channel,
  messages,
  currentUserId,
  currentUser,
  onBack,
  onMessagesChange,
  onStartCall,
}: ChatWindowProps) {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showEmojiBar, setShowEmojiBar] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ msgId: string; x: number; y: number } | null>(null);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Message Selection Mode ────────────────────────────────────────────────
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const isSelectMode = selectedMsgIds.length > 0;

  // ── Emoji Picker (composer) ───────────────────────────────────────────────
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiPickerTab, setEmojiPickerTab] = useState(0);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // ── Three-dot header menu ─────────────────────────────────────────────────
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement>(null);

  // ── Starred messages (client-side optimistic) ─────────────────────────────
  const [starredMsgIds, setStarredMsgIds] = useState<Set<string>>(new Set());

  // ── Message Info Modal ───────────────────────────────────────────────────
  const [infoMsg, setInfoMsg] = useState<ChatMessage | null>(null);

  // Attachment Menu Popup & Voice Record States
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveVolumeBars, setLiveVolumeBars] = useState<number[]>([25, 45, 70, 35, 80, 50, 90, 40, 75, 55, 65, 30]);


  // Audio playback state
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const playProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);
  const [audioProgressMap, setAudioProgressMap] = useState<Record<string, number>>({});
  const [audioCurrentTimeMap, setAudioCurrentTimeMap] = useState<Record<string, string>>({});
  const [playbackRateMap, setPlaybackRateMap] = useState<Record<string, number>>({});

  // Real MediaRecorder & Audio visualizer refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Modals for Extra Attachments
  const [showQuickReplyModal, setShowQuickReplyModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['Yes, confirmed', 'No, need adjustment']);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('WASSCE Practical Exam Sitting');
  const [eventDate, setEventDate] = useState('Tomorrow, 08:30 AM');
  const [eventVenue, setEventVenue] = useState('Main Science Lab (Block B)');
  const [showLocationModal, setShowLocationModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Dedicated file input refs
  const docFileInputRef = useRef<HTMLInputElement>(null);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const audioFileInputRef = useRef<HTMLInputElement>(null);

  // ── Live Camera Photo Capture State ──────────────────────────────────────
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'user' | 'environment'>('user');
  const [photoCaption, setPhotoCaption] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const startCameraStream = useCallback(async (facing: 'user' | 'environment') => {
    try {
      setCameraError(null);
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera access denied or unavailable. Please check browser permissions.');
    }
  }, []);

  const openLiveCamera = useCallback(() => {
    setShowCameraModal(true);
    setCapturedPhoto(null);
    setPhotoCaption('');
    startCameraStream(cameraFacingMode);
  }, [cameraFacingMode, startCameraStream]);

  const closeLiveCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    setShowCameraModal(false);
    setCapturedPhoto(null);
    setPhotoCaption('');
  }, []);

  const takePhotoSnapshot = useCallback(() => {
    const video = cameraVideoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      if (cameraFacingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedPhoto(dataUrl);
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
        cameraStreamRef.current = null;
      }
    }
  }, [cameraFacingMode]);

  const retakePhoto = useCallback(() => {
    setCapturedPhoto(null);
    startCameraStream(cameraFacingMode);
  }, [cameraFacingMode, startCameraStream]);


  // Voice recording timer
  useEffect(() => {
    if (!isRecordingVoice) return;
    const timer = setInterval(() => {
      setRecordingSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isRecordingVoice]);

  // Click outside to close popups (attach menu, emoji picker, header menu)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (attachMenuRef.current && !attachMenuRef.current.contains(target)) setShowAttachMenu(false);
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(target)) setShowEmojiPicker(false);
      if (headerMenuRef.current && !headerMenuRef.current.contains(target)) setShowHeaderMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  // Cleanup audio player interval on unmount
  useEffect(() => {
    return () => {
      if (playProgressIntervalRef.current) clearInterval(playProgressIntervalRef.current);
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark channel as read when opened
  useEffect(() => {
    if (channel?.id) markChannelRead(channel.id);
  }, [channel?.id]);

  const broadcastOutgoingMessage = useCallback((msg: ChatMessage) => {
    if (!channel) return;
    try {
      const supabase = createClient();
      supabase.channel(`msgs:${channel.id}`).send({
        type: 'broadcast',
        event: 'new_msg',
        payload: msg,
      });
      if (channel.tenant_id) {
        supabase.channel(`tenant_msg_stream:${channel.tenant_id}`).send({
          type: 'broadcast',
          event: 'incoming_msg',
          payload: msg,
        });
      }
    } catch (e) {
      console.warn('Broadcast error:', e);
    }
  }, [channel]);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && !editingMsg) || !channel) return;
    setIsSending(true);

    if (editingMsg) {
      await editMessage(editingMsg.id, editContent.trim());
      onMessagesChange(messages.map(m => m.id === editingMsg.id
        ? { ...m, content: editContent.trim(), is_edited: true }
        : m
      ));
      setEditingMsg(null);
      setEditContent('');
      setIsSending(false);
      return;
    }

    const fd = new FormData();
    fd.append('channel_id', channel.id);
    fd.append('content', input.trim());
    if (replyTo) {
      fd.append('reply_to_id', replyTo.id);
      fd.append('reply_to_snapshot', JSON.stringify({
        content: replyTo.content || '📎 Attachment',
        sender_name: replyTo.sender?.full_name || 'Unknown',
      }));
    }

    // Optimistic update
    const optimistic: ChatMessage = {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      channel_id: channel.id,
      sender_id: currentUserId,
      content: input.trim(),
      attachment: null,
      reply_to_id: replyTo?.id || null,
      reply_to_snapshot: replyTo ? {
        content: replyTo.content || '📎 Attachment',
        sender_name: replyTo.sender?.full_name || 'Unknown',
      } : null,
      reactions: {},
      is_edited: false,
      is_deleted: false,
      read_by: [],
      created_at: new Date().toISOString(),
      sender: currentUser,
    };
    onMessagesChange([...messages, optimistic]);
    setInput('');
    setReplyTo(null);
    broadcastOutgoingMessage(optimistic);

    await sendMessage(fd);
    setIsSending(false);
  }, [input, channel, replyTo, editingMsg, editContent, currentUserId, currentUser, messages, onMessagesChange, broadcastOutgoingMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setReplyTo(null);
      setEditingMsg(null);
      setShowAttachMenu(false);
    }
  };

  const handleReaction = async (msgId: string, emoji: string) => {
    setShowEmojiBar(null);
    await toggleReaction(msgId, emoji);
    onMessagesChange(messages.map(m => {
      if (m.id !== msgId) return m;
      const reactions = { ...m.reactions };
      const users = reactions[emoji] || [];
      if (users.includes(currentUserId)) {
        reactions[emoji] = users.filter(id => id !== currentUserId);
        if (!reactions[emoji].length) delete reactions[emoji];
      } else {
        reactions[emoji] = [...users, currentUserId];
      }
      return { ...m, reactions };
    }));
  };

  const handleDelete = async (msg: ChatMessage) => {
    setContextMenu(null);
    await deleteMessage(msg.id);
    onMessagesChange(messages.map(m => m.id === msg.id ? { ...m, is_deleted: true, content: null, attachment: null } : m));
  };

  const handleFileUpload = async (file: File) => {
    if (!channel) return;
    setShowAttachMenu(false);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      const fd = new FormData();
      fd.append('channel_id', channel.id);
      fd.append('attachment', JSON.stringify({
        type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'file',
        name: file.name,
        url: dataUrl,
        size: file.size,
      }));
      if (replyTo) {
        fd.append('reply_to_id', replyTo.id);
        fd.append('reply_to_snapshot', JSON.stringify({
          content: replyTo.content || '📎 Attachment',
          sender_name: replyTo.sender?.full_name || 'Unknown',
        }));
      }
      const optimistic: ChatMessage = {
        id: `temp-${Math.random().toString(36).substring(2, 9)}`,
        channel_id: channel.id,
        sender_id: currentUserId,
        content: null,
        attachment: {
          type: file.type.startsWith('image/') ? 'image' : file.type.startsWith('audio/') ? 'audio' : 'file',
          name: file.name,
          url: dataUrl,
          size: file.size,
        },
        reply_to_id: replyTo?.id || null,
        reply_to_snapshot: null,
        reactions: {},
        is_edited: false,
        is_deleted: false,
        read_by: [],
        created_at: new Date().toISOString(),
        sender: currentUser,
      };
      setReplyTo(null);
      onMessagesChange([...messages, optimistic]);
      broadcastOutgoingMessage(optimistic);
      await sendMessage(fd);
    };
    reader.readAsDataURL(file);
  };

  // ── REAL VOICE RECORDING ENGINE (MediaRecorder + AudioContext) ─────────────
  const startVoiceRecording = async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Microphone access is not supported by your browser.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true }
      });
      audioStreamRef.current = stream;
      audioChunksRef.current = [];

      // Connect Analyser for real-time waveform animation
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const source = ctx.createMediaStreamSource(stream);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          audioContextRef.current = ctx;
          analyserRef.current = analyser;

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          const updateWaveform = () => {
            if (!analyserRef.current) return;
            analyserRef.current.getByteFrequencyData(dataArray);
            const bars: number[] = [];
            const step = Math.max(1, Math.floor(dataArray.length / 12));
            for (let i = 0; i < 12; i++) {
              const val = dataArray[i * step] || 0;
              bars.push(Math.max(15, Math.min(100, Math.round((val / 255) * 100))));
            }
            setLiveVolumeBars(bars);
            animFrameRef.current = requestAnimationFrame(updateWaveform);
          };
          animFrameRef.current = requestAnimationFrame(updateWaveform);
        }
      } catch (err) {
        console.warn('AudioContext visualizer not available:', err);
      }

      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      const supportedMime = mimeTypes.find(m => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) || '';

      const recorder = supportedMime ? new MediaRecorder(stream, { mimeType: supportedMime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.start(100);
      setIsRecordingVoice(true);
      setRecordingSeconds(0);
    } catch (err) {
      console.error('Error starting audio recording:', err);
      alert('Could not access microphone. Please enable microphone permissions in your browser.');
    }
  };

  const cancelVoiceRecording = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    audioChunksRef.current = [];
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const stopAndSendVoiceRecording = async () => {
    if (!channel) return;
    const finalSeconds = Math.max(1, recordingSeconds);
    const durationStr = `${Math.floor(finalSeconds / 60)}:${String(finalSeconds % 60).padStart(2, '0')}`;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === 'inactive') {
      cancelVoiceRecording();
      return;
    }

    // Flush any pending data before stopping
    try {
      if (recorder.state === 'recording') {
        recorder.requestData();
      }
    } catch {}

    const stopPromise = new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        audioChunksRef.current = [];
        resolve(audioBlob);
      };
      recorder.stop();
    });

    const audioBlob = await stopPromise;
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }

    setIsRecordingVoice(false);
    setRecordingSeconds(0);

    if (audioBlob.size === 0) {
      console.warn('Recorded audio blob is empty');
      return;
    }

    const localBlobUrl = URL.createObjectURL(audioBlob);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Audio = (reader.result as string) || '';
      const attachObj: RichAttachPayload = {
        type: 'audio',
        name: `Voice Memo (${durationStr})`,
        url: base64Audio || localBlobUrl,
        size: audioBlob.size,
        duration: durationStr,
      };

      const fd = new FormData();
      fd.append('channel_id', channel.id);
      fd.append('attachment', JSON.stringify(attachObj));

      const optimistic: ChatMessage = {
        id: `temp-${Math.random().toString(36).substring(2, 9)}`,
        channel_id: channel.id,
        sender_id: currentUserId,
        content: null,
        attachment: {
          ...attachObj,
          url: localBlobUrl, // Use instant blob url for local client playback
        },
        reply_to_id: null,
        reply_to_snapshot: null,
        reactions: {},
        is_edited: false,
        is_deleted: false,
        read_by: [],
        created_at: new Date().toISOString(),
        sender: currentUser,
      };

      onMessagesChange([...messages, optimistic]);
      broadcastOutgoingMessage(optimistic);
      await sendMessage(fd);
    };

    reader.readAsDataURL(audioBlob);
  };

  // ── ENHANCED AUDIO PLAYBACK ENGINE (HTML5 Audio + Web Audio fallback) ──────
  const togglePlayAudio = (msgId: string, url?: string, durationStr?: string) => {
    // 1. If this message is currently playing -> pause it
    if (playingAudioMsgId === msgId) {
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
      if (playProgressIntervalRef.current) {
        clearInterval(playProgressIntervalRef.current);
        playProgressIntervalRef.current = null;
      }
      setPlayingAudioMsgId(null);
      return;
    }

    // 2. Stop any existing playing audio
    if (activeAudioRef.current) {
      activeAudioRef.current.pause();
      activeAudioRef.current = null;
    }
    if (playProgressIntervalRef.current) {
      clearInterval(playProgressIntervalRef.current);
      playProgressIntervalRef.current = null;
    }

    const playableUrl = getPlayableAudioUrl(url);
    const targetSeconds = parseDurationSec(durationStr);

    // Fallback: Synthesized Audio Melodic Chime if URL is missing or mock
    if (!playableUrl) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + targetSeconds);
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + targetSeconds);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + targetSeconds);
        }
      } catch {}

      setPlayingAudioMsgId(msgId);
      let elapsed = 0;
      playProgressIntervalRef.current = setInterval(() => {
        elapsed += 0.1;
        const pct = Math.min(100, (elapsed / targetSeconds) * 100);
        setAudioProgressMap(prev => ({ ...prev, [msgId]: pct }));
        const curSec = Math.floor(elapsed);
        setAudioCurrentTimeMap(prev => ({ ...prev, [msgId]: `${Math.floor(curSec / 60)}:${String(curSec % 60).padStart(2, '0')}` }));

        if (elapsed >= targetSeconds) {
          if (playProgressIntervalRef.current) clearInterval(playProgressIntervalRef.current);
          setPlayingAudioMsgId(null);
          setAudioProgressMap(prev => ({ ...prev, [msgId]: 0 }));
        }
      }, 100);
      return;
    }

    // Real HTML5 Audio Playback
    try {
      const audio = new Audio(playableUrl);
      const speed = playbackRateMap[msgId] || 1;
      audio.playbackRate = speed;
      audio.volume = 1.0;
      activeAudioRef.current = audio;
      setPlayingAudioMsgId(msgId);

      // Interval ticker guarantees smooth scrubbing even with Chromium WebM Infinity duration bug
      playProgressIntervalRef.current = setInterval(() => {
        if (!audio || audio.paused || audio.ended) {
          if (playProgressIntervalRef.current) clearInterval(playProgressIntervalRef.current);
          return;
        }
        const effectiveDur = (Number.isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity)
          ? audio.duration
          : targetSeconds;

        const cur = audio.currentTime;
        const pct = Math.min(100, (cur / effectiveDur) * 100);
        setAudioProgressMap(prev => ({ ...prev, [msgId]: pct }));
        const curSec = Math.floor(cur);
        const timeStr = `${Math.floor(curSec / 60)}:${String(curSec % 60).padStart(2, '0')}`;
        setAudioCurrentTimeMap(prev => ({ ...prev, [msgId]: timeStr }));
      }, 50);

      audio.onended = () => {
        if (playProgressIntervalRef.current) clearInterval(playProgressIntervalRef.current);
        setPlayingAudioMsgId(null);
        setAudioProgressMap(prev => ({ ...prev, [msgId]: 0 }));
        activeAudioRef.current = null;
      };

      audio.onerror = (e) => {
        console.warn('HTML5 Audio playback error:', e);
        if (playProgressIntervalRef.current) clearInterval(playProgressIntervalRef.current);
        setPlayingAudioMsgId(null);
        activeAudioRef.current = null;
      };

      audio.play().catch(err => {
        console.warn('Audio play call rejected:', err);
        if (playProgressIntervalRef.current) clearInterval(playProgressIntervalRef.current);
        setPlayingAudioMsgId(null);
        activeAudioRef.current = null;
      });
    } catch (err) {
      console.error('Failed to instantiate Audio element:', err);
      setPlayingAudioMsgId(null);
    }
  };

  const cyclePlaybackRate = (msgId: string) => {
    const currentRate = playbackRateMap[msgId] || 1;
    const nextRate = currentRate === 1 ? 1.5 : currentRate === 1.5 ? 2 : 1;
    setPlaybackRateMap(prev => ({ ...prev, [msgId]: nextRate }));
    if (activeAudioRef.current && playingAudioMsgId === msgId) {
      activeAudioRef.current.playbackRate = nextRate;
    }
  };

  const seekAudio = (msgId: string, percent: number, durationStr?: string) => {
    const targetSeconds = parseDurationSec(durationStr);
    const audio = activeAudioRef.current;
    if (audio && playingAudioMsgId === msgId) {
      const dur = (Number.isFinite(audio.duration) && audio.duration > 0 && audio.duration !== Infinity)
        ? audio.duration
        : targetSeconds;
      audio.currentTime = (percent / 100) * dur;
      setAudioProgressMap(prev => ({ ...prev, [msgId]: percent }));
    }
  };

  // Send Custom Rich Card (Quick Reply, Poll, Event, Location, Image)
  const handleSendRichMessage = useCallback(async (type: 'quick_reply' | 'poll' | 'event' | 'location' | 'image', data: QuickReplyItem | LocationItem | PollData | EventData | { name: string; url: string; sub?: string }) => {
    if (!channel) return;
    setShowQuickReplyModal(false);
    setShowPollModal(false);
    setShowEventModal(false);
    setShowLocationModal(false);

    let contentText = '';
    let attachObj: RichAttachPayload | null = null;

    if (type === 'quick_reply') {
      const item = data as QuickReplyItem;
      contentText = item.text;
    } else if (type === 'poll') {
      const item = data as PollData;
      contentText = `📊 Poll: ${item.question}\n${item.options.map((o: string, idx: number) => `• [${idx + 1}] ${o}`).join('\n')}`;
      attachObj = { type: 'poll', name: item.question, options: item.options };
    } else if (type === 'event') {
      const item = data as EventData;
      contentText = `📅 Event: ${item.title}\n⏰ When: ${item.date}\n📍 Venue: ${item.venue}`;
      attachObj = { type: 'event', name: item.title, date: item.date, venue: item.venue };
    } else if (type === 'location') {
      const item = data as LocationItem;
      contentText = `📍 Campus Location: ${item.name}\n${item.sub}`;
      attachObj = { type: 'location', name: item.name, sub: item.sub };
    } else if (type === 'image') {
      const item = data as { name: string; url: string; sub?: string };
      contentText = item.sub || '';
      attachObj = { type: 'image', name: item.name, url: item.url, sub: item.sub };
    }

    const fd = new FormData();
    fd.append('channel_id', channel.id);
    if (contentText) fd.append('content', contentText);
    if (attachObj) {
      fd.append('attachment', JSON.stringify(attachObj));
    }

    const optimistic: ChatMessage = {
      id: `temp-${Math.random().toString(36).substring(2, 9)}`,
      channel_id: channel.id,
      sender_id: currentUserId,
      content: contentText || null,
      attachment: attachObj,
      reply_to_id: null,
      reply_to_snapshot: null,
      reactions: {},
      is_edited: false,
      is_deleted: false,
      read_by: [],
      created_at: new Date().toISOString(),
      sender: currentUser,
    };
    onMessagesChange([...messages, optimistic]);
    broadcastOutgoingMessage(optimistic);
    await sendMessage(fd);
  }, [channel, currentUserId, currentUser, messages, onMessagesChange, setShowQuickReplyModal, setShowPollModal, setShowEventModal, setShowLocationModal, broadcastOutgoingMessage]);

  const sendCapturedPhoto = useCallback(() => {
    if (!capturedPhoto) return;
    handleSendRichMessage('image', {
      name: `photo_${Date.now()}.jpg`,
      url: capturedPhoto,
      sub: photoCaption.trim() || undefined,
    });
    closeLiveCamera();
  }, [capturedPhoto, photoCaption, handleSendRichMessage, closeLiveCamera]);


  const filteredMessages = searchQuery.trim()
    ? messages.filter(m => m.content?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const otherParticipant = channel?.type === 'direct'
    ? channel.participants?.find(p => p.id !== currentUserId)
    : null;
  const channelName = channel?.type === 'group'
    ? (channel.name || 'Group Chat')
    : (otherParticipant?.full_name || 'Direct Message');

  const hasTypedContent = Boolean(editingMsg ? editContent.trim() : input.trim());

  if (!channel) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[hsl(var(--bg-primary))] text-[hsl(var(--text-tertiary))] gap-4">
        <div className="w-20 h-20 rounded-full bg-[hsl(var(--bg-tertiary))] flex items-center justify-center">
          <MessageSquareIcon className="w-10 h-10 opacity-30" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-[hsl(var(--text-secondary))]">Select a conversation</p>
          <p className="text-xs mt-1 opacity-60">Choose from the list or start a new message</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full min-w-0 bg-[hsl(var(--bg-primary))] relative"
      onClick={() => {
        setContextMenu(null);
        setShowEmojiBar(null);
      }}
    >
      {/* Hidden file pickers */}
      <input
        type="file"
        ref={docFileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.xlsx,.xls,.ppt,.pptx,.txt,.csv"
        onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
      />
      <input
        type="file"
        ref={cameraFileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
      />
      <input
        type="file"
        ref={galleryFileInputRef}
        className="hidden"
        accept="image/*"
        onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
      />
      <input
        type="file"
        ref={audioFileInputRef}
        className="hidden"
        accept="audio/*"
        onChange={e => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
      />

      {/* ── Header ── */}
      <div className={`h-16 px-4 border-b border-[hsl(var(--border))] flex items-center justify-between shrink-0 z-10 transition-colors ${isSelectMode ? 'bg-[hsl(var(--accent)/0.06)]' : 'bg-[hsl(var(--bg-secondary))]'}`}>

        {/* Left side */}
        {isSelectMode ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedMsgIds([])} className="w-8 h-8 rounded-xl flex items-center justify-center text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors">
              <X className="w-4 h-4" />
            </button>
            <span className="text-sm font-bold text-[hsl(var(--text-primary))]">{selectedMsgIds.length} selected</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="md:hidden text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] mr-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="relative shrink-0">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${avatarColor(channel.id)}`}>
                {channel.type === 'group' ? <Users className="w-5 h-5" /> : getInitials(channelName)}
              </div>
              {channel.type === 'direct' && otherParticipant?.online && otherParticipant.online_visibility !== 'nobody' && (
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[hsl(var(--bg-secondary))]" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="font-bold text-sm text-[hsl(var(--text-primary))] truncate">{channelName}</h2>
              <p className="text-[11px] text-[hsl(var(--text-tertiary))] truncate">
                {channel.type === 'group'
                  ? `${channel.participants?.length || 0} members`
                  : otherParticipant?.online_visibility !== 'nobody' && otherParticipant?.online
                    ? '🟢 Online'
                    : otherParticipant?.last_seen_visibility !== 'nobody' && otherParticipant?.last_seen
                      ? formatLastSeen(otherParticipant.last_seen)
                      : otherParticipant?.role || 'Staff'}
              </p>
            </div>
          </div>
        )}

        {/* Right side — selection mode actions OR normal controls */}
        {isSelectMode ? (
          <div className="flex items-center gap-0.5 text-[hsl(var(--text-secondary))]">
            {selectedMsgIds.length === 1 && (
              <>
                <button title="Reply" onClick={() => {
                  const msg = messages.find(m => m.id === selectedMsgIds[0]);
                  if (msg) { setReplyTo(msg); setSelectedMsgIds([]); }
                }} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--accent))] transition-colors">
                  <Reply className="w-4 h-4" />
                </button>
                <button title="Pin" className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-amber-400 transition-colors">
                  <Pin className="w-4 h-4" />
                </button>
                <button title="Message Info" onClick={() => {
                  const msg = messages.find(m => m.id === selectedMsgIds[0]);
                  if (msg) { setInfoMsg(msg); setSelectedMsgIds([]); }
                }} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--accent))] transition-colors">
                  <Info className="w-4 h-4" />
                </button>
              </>
            )}
            <button title={starredMsgIds.has(selectedMsgIds[0]) ? 'Unstar' : 'Star'}
              onClick={() => {
                setStarredMsgIds(prev => {
                  const next = new Set(prev);
                  selectedMsgIds.forEach(id => next.has(id) ? next.delete(id) : next.add(id));
                  return next;
                });
                setSelectedMsgIds([]);
              }}
              className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-amber-400 transition-colors">
              <Star className={`w-4 h-4 ${selectedMsgIds.some(id => starredMsgIds.has(id)) ? 'text-amber-400 fill-amber-400' : ''}`} />
            </button>
            <button title="Copy" onClick={() => {
              const texts = messages.filter(m => selectedMsgIds.includes(m.id) && m.content).map(m => m.content!).join('\n');
              navigator.clipboard?.writeText(texts).catch(() => {});
              setSelectedMsgIds([]);
            }} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--accent))] transition-colors">
              <Copy className="w-4 h-4" />
            </button>
            <button title="Forward" className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--accent))] transition-colors">
              <Forward className="w-4 h-4" />
            </button>
            <button title="Delete" onClick={async () => {
              for (const id of selectedMsgIds) {
                const msg = messages.find(m => m.id === id);
                if (msg && msg.sender_id === currentUserId) await handleDelete(msg);
              }
              setSelectedMsgIds([]);
            }} className="p-2 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5 text-[hsl(var(--text-secondary))]">
            {searchMode ? (
              <div className="flex items-center gap-2 bg-[hsl(var(--bg-tertiary))] px-3 py-1.5 rounded-xl border border-[hsl(var(--border))] animate-fade-in">
                <Search className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" />
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search in chat..."
                  className="bg-transparent text-xs text-[hsl(var(--text-primary))] focus:outline-none w-32 md:w-48" />
                <button onClick={() => { setSearchMode(false); setSearchQuery(''); }}>
                  <X className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]" />
                </button>
              </div>
            ) : (
              <button onClick={() => setSearchMode(true)} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors" title="Search">
                <Search className="w-4 h-4" />
              </button>
            )}
            {onStartCall && !searchMode && (
              <>
                <button onClick={() => onStartCall(channel.id, 'voice')} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors" title="Voice Call">
                  <Phone className="w-4 h-4" />
                </button>
                <button onClick={() => onStartCall(channel.id, 'video')} className="p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors" title="Video Call">
                  <Video className="w-4 h-4" />
                </button>
              </>
            )}

            {/* ── Three-dot menu ── */}
            {!searchMode && (
              <div className="relative" ref={headerMenuRef}>
                <button onClick={() => setShowHeaderMenu(v => !v)}
                  className={`p-2 rounded-xl hover:bg-[hsl(var(--bg-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors ${showHeaderMenu ? 'bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]' : ''}`}
                  title="More options">
                  <MoreVertical className="w-4 h-4" />
                </button>
                {showHeaderMenu && (
                  <div className="absolute right-0 top-10 w-52 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl z-50 overflow-hidden py-1 animate-fade-in">
                    <button onClick={() => { setSearchMode(true); setShowHeaderMenu(false); }}
                      className="w-full px-4 py-2.5 text-left text-xs text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] flex items-center gap-3 transition-colors">
                      <Search className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> Search in chat
                    </button>
                    <button onClick={() => setShowHeaderMenu(false)}
                      className="w-full px-4 py-2.5 text-left text-xs text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] flex items-center gap-3 transition-colors">
                      <Pin className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> Pinned Messages
                    </button>
                    <button onClick={() => setShowHeaderMenu(false)}
                      className="w-full px-4 py-2.5 text-left text-xs text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] flex items-center gap-3 transition-colors">
                      <BellOff className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> Mute Notifications
                    </button>
                    <div className="mx-3 border-t border-[hsl(var(--border))] my-1" />
                    {channel.type === 'group' ? (
                      <>
                        <button onClick={() => setShowHeaderMenu(false)}
                          className="w-full px-4 py-2.5 text-left text-xs text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] flex items-center gap-3 transition-colors">
                          <Users className="w-3.5 h-3.5 text-[hsl(var(--text-tertiary))]" /> Group Info
                        </button>
                        <button onClick={() => setShowHeaderMenu(false)}
                          className="w-full px-4 py-2.5 text-left text-xs text-rose-400 hover:bg-rose-500/5 flex items-center gap-3 transition-colors">
                          <LogOut className="w-3.5 h-3.5" /> Leave Group
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setShowHeaderMenu(false)}
                        className="w-full px-4 py-2.5 text-left text-xs text-rose-400 hover:bg-rose-500/5 flex items-center gap-3 transition-colors">
                        <Flag className="w-3.5 h-3.5" /> Block / Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-[hsl(var(--bg-primary))]">
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[hsl(var(--text-tertiary))] gap-2 py-12">
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--bg-secondary))] flex items-center justify-center">
              <Smile className="w-6 h-6 opacity-30" />
            </div>
            <p className="text-xs">No messages yet. Send a message or share an attachment to begin!</p>
          </div>
        ) : null}

        {filteredMessages.map((msg, index) => {
          const isMe = msg.sender_id === currentUserId;
          const prevMsg = index > 0 ? filteredMessages[index - 1] : null;
          const showDateDivider = !prevMsg || !isSameDay(prevMsg.created_at, msg.created_at);
          const showAvatar = !isMe && (!prevMsg || prevMsg.sender_id !== msg.sender_id || showDateDivider);
          const isSelected = selectedMsgIds.includes(msg.id);
          const isStarred = starredMsgIds.has(msg.id);

          return (
            <div key={msg.id}
              onClick={() => { if (isSelectMode && !msg.is_deleted) setSelectedMsgIds(prev => prev.includes(msg.id) ? prev.filter(id => id !== msg.id) : [...prev, msg.id]); }}
              className={`space-y-2 rounded-xl px-1 transition-colors ${isSelectMode ? 'cursor-pointer' : ''} ${isSelected ? 'bg-[hsl(var(--accent)/0.07)]' : ''}`}>
              {showDateDivider && (
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-[10px] font-bold text-[hsl(var(--text-tertiary))] shadow-sm">
                    {formatDateDivider(msg.created_at)}
                  </span>
                </div>
              )}

              <div className={`flex gap-2 group ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="w-7 shrink-0">
                    {showAvatar ? (
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm ${avatarColor(msg.sender_id)}`}>
                        {(() => {
                          const senderObj = msg.sender || (channel.participants || []).find(p => p.id === msg.sender_id);
                          return senderObj?.avatar_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={senderObj.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            getInitials(senderObj?.full_name || 'U')
                          );
                        })()}
                      </div>
                    ) : <div className="w-7" />}
                  </div>
                )}

                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Sender name (group only) */}
                  {!isMe && channel.type === 'group' && showAvatar && (
                    <span className="text-[10px] font-bold text-[hsl(var(--accent))] mb-1 ml-1">
                      {msg.sender?.full_name || (channel.participants || []).find(p => p.id === msg.sender_id)?.full_name || 'Group Member'}
                    </span>
                  )}

                  {/* Reply preview */}
                  {msg.reply_to_snapshot && (
                    <div className={`px-3 py-1.5 rounded-t-xl mb-0.5 border-l-2 border-[hsl(var(--accent))] bg-[hsl(var(--bg-tertiary))] text-xs max-w-full ${isMe ? 'items-end' : ''}`}>
                      <p className="text-[10px] font-bold text-[hsl(var(--accent))] truncate">{msg.reply_to_snapshot.sender_name}</p>
                      <p className="text-[hsl(var(--text-secondary))] truncate">{msg.reply_to_snapshot.content}</p>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`relative px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed cursor-pointer transition-all shadow-sm
                      ${isMe
                        ? 'bg-[hsl(var(--accent))] text-white rounded-br-sm'
                        : 'bg-[hsl(var(--bg-secondary))] text-[hsl(var(--text-primary))] border border-[hsl(var(--border))] rounded-bl-sm'
                      }
                      ${msg.is_deleted ? 'opacity-50 italic' : ''}
                      ${isSelected ? 'ring-2 ring-[hsl(var(--accent)/0.5)]' : ''}
                    `}
                    onContextMenu={e => {
                      if (msg.is_deleted) return;
                      e.preventDefault();
                      if (!isSelectMode) {
                        // Right-click enters selection mode for this message
                        setSelectedMsgIds([msg.id]);
                      } else {
                        setContextMenu({ msgId: msg.id, x: e.clientX, y: e.clientY });
                      }
                    }}
                  >
                    {msg.is_deleted ? (
                      <span className="text-xs opacity-60">🚫 This message was deleted</span>
                    ) : msg.attachment ? (
                      msg.attachment.type === 'image' ? (
                        <div className="space-y-1.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={msg.attachment.url} alt={msg.attachment.name} className="max-w-[240px] rounded-xl object-cover" />
                          <p className="text-[10px] opacity-70 truncate">{msg.attachment.name}</p>
                        </div>
                      ) : msg.attachment.type === 'audio' ? (
                        <div className="flex items-center gap-3 py-1 min-w-[220px] max-w-[280px]">
                          {/* Play / Pause Toggle Button */}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              togglePlayAudio(msg.id, msg.attachment?.url, msg.attachment?.duration);
                            }}
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform hover:scale-105 active:scale-95 ${
                              isMe ? 'bg-white text-[hsl(var(--accent))]' : 'bg-[hsl(var(--accent))] text-white'
                            }`}
                            title={playingAudioMsgId === msg.id ? 'Pause Voice Note' : 'Play Voice Note'}
                          >
                            {playingAudioMsgId === msg.id ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                          </button>

                          {/* Interactive Scrubber Waveform */}
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-0.5 h-6 cursor-pointer">
                              {[25, 45, 80, 50, 95, 65, 40, 85, 60, 35, 90, 70, 45, 80, 55, 30].map((h, i) => {
                                const barPercent = (i / 16) * 100;
                                const isPlayed = (audioProgressMap[msg.id] || 0) >= barPercent;
                                return (
                                  <div
                                    key={i}
                                    onClick={e => {
                                      e.stopPropagation();
                                      seekAudio(msg.id, barPercent, msg.attachment?.duration);
                                    }}
                                    className={`w-1 rounded-full transition-all duration-150 hover:opacity-100 ${
                                      isPlayed
                                        ? isMe ? 'bg-white' : 'bg-[hsl(var(--accent))]'
                                        : isMe ? 'bg-white/40' : 'bg-[hsl(var(--text-tertiary)/0.4)]'
                                    } ${playingAudioMsgId === msg.id ? 'animate-pulse' : ''}`}
                                    style={{ height: `${h}%` }}
                                  />
                                );
                              })}
                            </div>

                            {/* Time and Speed Controls */}
                            <div className="flex items-center justify-between text-[9px] opacity-80 font-mono">
                              <span>{audioCurrentTimeMap[msg.id] || msg.attachment.duration || '0:05'}</span>
                              <button
                                type="button"
                                onClick={e => {
                                  e.stopPropagation();
                                  cyclePlaybackRate(msg.id);
                                }}
                                className={`px-1.5 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                                  isMe
                                    ? 'border-white/30 hover:bg-white/20 text-white'
                                    : 'border-[hsl(var(--border))] hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]'
                                }`}
                              >
                                {playbackRateMap[msg.id] ? `${playbackRateMap[msg.id]}x` : '1x'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : msg.attachment.type === 'location' ? (
                        <div className="flex items-start gap-2.5 p-1 min-w-[200px]">
                          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{msg.attachment.name}</p>
                            <p className="text-[10px] opacity-80">{msg.attachment.sub}</p>
                          </div>
                        </div>
                      ) : msg.attachment.type === 'event' ? (
                        <div className="flex items-start gap-2.5 p-1 min-w-[210px]">
                          <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold">{msg.attachment.name}</p>
                            <p className="text-[10px] opacity-80">⏰ {msg.attachment.date}</p>
                            <p className="text-[10px] opacity-80">📍 {msg.attachment.venue}</p>
                          </div>
                        </div>
                      ) : msg.attachment.type === 'call' ? (
                        (() => {
                          const isVideo = msg.attachment.name?.toLowerCase().includes('video') || msg.attachment.call_type === 'video';
                          const isUnanswered = msg.attachment.sub === 'missed' || msg.attachment.sub === 'declined' || msg.attachment.sub === 'unanswered';

                          // You cannot miss a call from yourself:
                          // - If isMe (I initiated): Outgoing Call ("Unanswered" or duration)
                          // - If !isMe (Someone called me): if unanswered -> "Missed Call" (red)
                          //                                if completed -> "Incoming Call" (green)
                          const title = isMe
                            ? (isVideo ? 'Outgoing Video Call' : 'Outgoing Voice Call')
                            : isUnanswered
                              ? (isVideo ? 'Missed Video Call' : 'Missed Voice Call')
                              : (isVideo ? 'Incoming Video Call' : 'Incoming Voice Call');

                          const statusText = isMe
                            ? (isUnanswered ? 'Unanswered' : (msg.attachment.duration ? `Duration: ${msg.attachment.duration}` : 'Call ended'))
                            : (isUnanswered ? 'Missed call' : (msg.attachment.duration ? `Duration: ${msg.attachment.duration}` : 'Call ended'));

                          const isMissedForMe = !isMe && isUnanswered;

                          return (
                            <div className="flex items-center gap-3 py-1 min-w-[210px]">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                                isMissedForMe
                                  ? 'bg-rose-500/20 text-rose-500'
                                  : isMe
                                    ? 'bg-white/20 text-white'
                                    : 'bg-emerald-500/20 text-emerald-500'
                              }`}>
                                {isMissedForMe ? (
                                  <PhoneMissed className="w-4 h-4" />
                                ) : isMe ? (
                                  <PhoneOutgoing className="w-4 h-4" />
                                ) : isVideo ? (
                                  <Video className="w-4 h-4" />
                                ) : (
                                  <PhoneIncoming className="w-4 h-4" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold ${
                                  isMissedForMe
                                    ? 'text-rose-500'
                                    : isMe ? 'text-white' : 'text-[hsl(var(--text-primary))]'
                                }`}>
                                  {title}
                                </p>
                                <p className="text-[10px] opacity-70">
                                  {statusText}
                                </p>
                              </div>
                              {onStartCall && (
                                <button
                                  type="button"
                                  onClick={e => {
                                    e.stopPropagation();
                                    onStartCall(channel.id, isVideo ? 'video' : 'voice');
                                  }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors shrink-0 ${
                                    isMe
                                      ? 'bg-white/20 hover:bg-white/30 text-white'
                                      : 'bg-[hsl(var(--accent)/0.15)] hover:bg-[hsl(var(--accent)/0.25)] text-[hsl(var(--accent))]'
                                  }`}
                                >
                                  {isMe ? 'Call again' : 'Call back'}
                                </button>
                              )}
                            </div>
                          );
                        })()
                      ) : (
                        <div className="flex items-center gap-2.5 py-1">
                          <FileText className="w-8 h-8 opacity-80 shrink-0" />
                          <div>
                            <p className="text-xs font-semibold truncate max-w-[160px]">{msg.attachment.name}</p>
                            <a href={msg.attachment.url} download={msg.attachment.name} className="text-[10px] underline opacity-80 flex items-center gap-0.5">
                              <Download className="w-2.5 h-2.5" /> Download
                            </a>
                          </div>
                        </div>
                      )
                    ) : (
                      <span className="whitespace-pre-line">{msg.content}</span>
                    )}

                    {/* Edited indicator */}
                    {msg.is_edited && !msg.is_deleted && (
                      <span className="text-[9px] opacity-50 ml-1">(edited)</span>
                    )}

                    {/* Hover actions */}
                    {!msg.is_deleted && (
                      <div className={`absolute top-0 ${isMe ? 'left-0 -translate-x-full pr-1' : 'right-0 translate-x-full pl-1'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5`}>
                        <button onClick={e => { e.stopPropagation(); setShowEmojiBar(showEmojiBar === msg.id ? null : msg.id); }}
                          className="w-6 h-6 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">
                          <Smile className="w-3 h-3" />
                        </button>
                        <button onClick={e => { e.stopPropagation(); setReplyTo(msg); inputRef.current?.focus(); }}
                          className="w-6 h-6 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">
                          <Reply className="w-3 h-3" />
                        </button>
                        {isMe && (
                          <button onClick={e => { e.stopPropagation(); setEditingMsg(msg); setEditContent(msg.content || ''); inputRef.current?.focus(); }}
                            className="w-6 h-6 rounded-full bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] flex items-center justify-center hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))]">
                            <Edit2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Emoji bar */}
                  {showEmojiBar === msg.id && (
                    <div className="flex gap-1 mt-1 p-1.5 bg-[hsl(var(--bg-secondary))] rounded-xl border border-[hsl(var(--border))] shadow-lg animate-fade-in z-20">
                      {EMOJI_LIST.map(emoji => (
                        <button key={emoji} onClick={() => handleReaction(msg.id, emoji)}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[hsl(var(--bg-tertiary))] text-base transition-transform hover:scale-125">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Object.entries(msg.reactions).map(([emoji, users]) => (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(msg.id, emoji)}
                          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                            users.includes(currentUserId)
                              ? 'bg-[hsl(var(--accent)/0.15)] border-[hsl(var(--accent)/0.4)] text-[hsl(var(--accent))]'
                              : 'bg-[hsl(var(--bg-secondary))] border-[hsl(var(--border))] text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))]'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span>{users.length}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timestamp & Status */}
                  <div className="flex items-center gap-1 mt-0.5 text-[9px] text-[hsl(var(--text-tertiary))] px-1">
                    <span>{formatTimestamp(msg.created_at)}</span>
                    {isMe && !msg.is_deleted && (
                      msg.read_by && msg.read_by.length > 0 ? (
                        <CheckCheck className="w-3 h-3 text-sky-400" />
                      ) : (
                        <Check className="w-3 h-3 text-[hsl(var(--text-tertiary))]" />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Context menu */}
      {contextMenu && (() => {
        const msg = messages.find(m => m.id === contextMenu.msgId);
        const isMe = msg?.sender_id === currentUserId;
        return (
          <div className="fixed z-50 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-xl shadow-xl py-1 w-48 animate-fade-in"
            style={{ top: contextMenu.y, left: Math.min(contextMenu.x, window.innerWidth - 200) }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => { if (msg) { setReplyTo(msg); inputRef.current?.focus(); } setContextMenu(null); }}
              className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
              <Reply className="w-3.5 h-3.5" /> Reply
            </button>
            {isMe && msg && !msg.is_deleted && (
              <button onClick={() => { setEditingMsg(msg); setEditContent(msg.content || ''); setContextMenu(null); inputRef.current?.focus(); }}
                className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
                <Edit2 className="w-3.5 h-3.5" /> Edit Message
              </button>
            )}
            <button onClick={() => { if (msg) { setShowEmojiBar(msg.id); } setContextMenu(null); }}
              className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
              <Smile className="w-3.5 h-3.5" /> React
            </button>
            {msg && !msg.is_deleted && (
              <button onClick={() => { setInfoMsg(msg); setContextMenu(null); }}
                className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-primary))]">
                <Info className="w-3.5 h-3.5" /> Message Info
              </button>
            )}
            {isMe && msg && !msg.is_deleted && (
              <>
                <div className="h-px bg-[hsl(var(--border))] my-1" />
                <button onClick={() => msg && handleDelete(msg)}
                  className="w-full px-4 py-2 text-xs text-left flex items-center gap-2.5 hover:bg-rose-50 text-rose-500">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Message
                </button>
              </>
            )}
          </div>
        );
      })()}

      {/* Reply preview bar */}
      {replyTo && !editingMsg && (
        <div className="px-4 py-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex items-center gap-3 shrink-0">
          <div className="flex-1 pl-3 border-l-2 border-[hsl(var(--accent))] min-w-0">
            <p className="text-[10px] font-bold text-[hsl(var(--accent))]">{replyTo.sender?.full_name}</p>
            <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{replyTo.content || '📎 Attachment'}</p>
          </div>
          <button onClick={() => setReplyTo(null)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Edit bar */}
      {editingMsg && (
        <div className="px-4 py-2 border-t border-[hsl(var(--border))] bg-amber-500/10 flex items-center gap-3 shrink-0">
          <Edit2 className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-amber-500">Editing message</p>
            <p className="text-xs text-[hsl(var(--text-secondary))] truncate">{editingMsg.content}</p>
          </div>
          <button onClick={() => { setEditingMsg(null); setEditContent(''); }} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── ATTACHMENT POPUP MENU (MATCHING ATTACHED SCREENSHOT) ──────────── */}
      {showAttachMenu && (
        <div
          ref={attachMenuRef}
          className="absolute bottom-20 left-4 z-40 bg-white dark:bg-[#1E2028] rounded-[28px] p-5 shadow-2xl border border-slate-200/80 dark:border-slate-800 w-[320px] sm:w-[350px] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="grid grid-cols-4 gap-y-4 gap-x-2">
            {/* 1. Document */}
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); docFileInputRef.current?.click(); }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#EDE8FF] text-[#635BFF] flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">Document</span>
            </button>

            {/* 2. Camera */}
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); openLiveCamera(); }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#FFE6EE] text-[#E0245E] flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <Camera className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">Camera</span>
            </button>

            {/* 3. Gallery */}
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); galleryFileInputRef.current?.click(); }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#FCE8E6] text-[#A61C1C] flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <ImageIcon className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">Gallery</span>
            </button>

            {/* 4. Audio */}
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); audioFileInputRef.current?.click(); }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#FFF0E6] text-[#F05A28] flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <Music className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">Audio</span>
            </button>

            {/* 5. Quick Reply */}
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); setShowQuickReplyModal(true); }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#E8F4FD] text-[#0088CC] flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <Zap className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">Quick Reply</span>
            </button>

            {/* 6. Poll */}
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); setShowPollModal(true); }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#E6F9EE] text-[#059669] flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <BarChart2 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">Poll</span>
            </button>

            {/* 7. Event */}
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); setShowEventModal(true); }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#FAECEE] text-[#881337] flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">Event</span>
            </button>

            {/* 8. Location */}
            <button
              type="button"
              onClick={() => { setShowAttachMenu(false); setShowLocationModal(true); }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-[#E6F8F6] text-[#0D9488] flex items-center justify-center transition-transform group-hover:scale-110 group-active:scale-95 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 text-center leading-tight">Location</span>
            </button>
          </div>
        </div>
      )}

      {/* ── MODALS FOR ATTACHMENT TYPES ──────────────────────────────────── */}
      {/* Quick Reply Modal */}
      {showQuickReplyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-extrabold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#0088CC]" /> Quick Reply Presets
              </h3>
              <button onClick={() => setShowQuickReplyModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {QUICK_REPLIES.map((qr, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendRichMessage('quick_reply', qr)}
                  className="w-full p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-left hover:border-[#0088CC]/50 hover:bg-[#0088CC]/5 transition-all space-y-1"
                >
                  <p className="text-xs font-bold text-[#0088CC]">{qr.label}</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))] leading-relaxed">{qr.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Poll Creator Modal */}
      {showPollModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-extrabold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#059669]" /> Create Academic Poll
              </h3>
              <button onClick={() => setShowPollModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Poll Question</label>
                <input
                  type="text"
                  placeholder="e.g. Preferred time for WASSCE Science Moderation meeting?"
                  value={pollQuestion}
                  onChange={e => setPollQuestion(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[#059669]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Options</label>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={e => {
                        const next = [...pollOptions];
                        next[i] = e.target.value;
                        setPollOptions(next);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[#059669]"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                        className="text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
                {pollOptions.length < 4 && (
                  <button
                    onClick={() => setPollOptions([...pollOptions, `Option ${pollOptions.length + 1}`])}
                    className="text-xs font-bold text-[#059669] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Option
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  if (pollQuestion.trim()) {
                    handleSendRichMessage('poll', { question: pollQuestion.trim(), options: pollOptions });
                  }
                }}
                disabled={!pollQuestion.trim()}
                className="w-full py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs disabled:opacity-40 transition-colors shadow-md"
              >
                Send Poll to Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Share Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-extrabold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#881337]" /> Share Academic Event
              </h3>
              <button onClick={() => setShowEventModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={e => setEventTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[#881337]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Date &amp; Time</label>
                <input
                  type="text"
                  value={eventDate}
                  onChange={e => setEventDate(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[#881337]"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[hsl(var(--text-secondary))]">Venue / Hall</label>
                <input
                  type="text"
                  value={eventVenue}
                  onChange={e => setEventVenue(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-xs text-[hsl(var(--text-primary))] focus:outline-none focus:border-[#881337]"
                />
              </div>
              <button
                onClick={() => handleSendRichMessage('event', { title: eventTitle, date: eventDate, venue: eventVenue })}
                className="w-full py-2.5 rounded-xl bg-[#881337] hover:bg-[#700f2b] text-white font-bold text-xs transition-colors shadow-md"
              >
                Post Event Badge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Location Share Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-[hsl(var(--border))] pb-3">
              <h3 className="font-extrabold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0D9488]" /> Share Campus Venue
              </h3>
              <button onClick={() => setShowLocationModal(false)} className="text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {PRESET_LOCATIONS.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendRichMessage('location', loc)}
                  className="w-full p-3 rounded-2xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] text-left hover:border-[#0D9488]/50 hover:bg-[#0D9488]/5 transition-all flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#E6F8F6] text-[#0D9488] flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[hsl(var(--text-primary))]">{loc.name}</p>
                    <p className="text-[10px] text-[hsl(var(--text-tertiary))]">{loc.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── INPUT BAR COMPOSER (EMOJI LEFT, ATTACH & CAMERA RIGHT INSIDE FIELD) ── */}
      <div className="px-4 py-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--bg-secondary))] flex items-center gap-2 shrink-0 relative">
        {/* Dynamic Voice Recording Bar or WhatsApp-Style Unified Input Pill */}
        {isRecordingVoice ? (
          <div className="flex-1 h-11 px-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span className="text-xs font-bold text-rose-500">
                Recording... ${Math.floor(recordingSeconds / 60)}:${String(recordingSeconds % 60).padStart(2, '0')}
              </span>
              {/* Real-time live audio frequency wave bars */}
              <div className="hidden sm:flex items-center gap-0.5 h-5">
                {liveVolumeBars.map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-rose-500 rounded-full transition-all duration-75"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={cancelVoiceRecording}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        ) : (
          <div className="flex-1 min-h-[44px] rounded-2xl md:rounded-3xl bg-[hsl(var(--bg-tertiary))] border border-[hsl(var(--border))] flex items-center px-2 py-1 gap-1 focus-within:border-[hsl(var(--accent))] focus-within:ring-1 focus-within:ring-[hsl(var(--accent)/0.3)] transition-all">
            {/* 1. Emoji button (far left inside) */}
            <div className="relative shrink-0" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(v => !v)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  showEmojiPicker ? 'bg-[hsl(var(--accent))] text-white' : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--bg-secondary))]'
                }`}
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              {/* Emoji picker panel */}
              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 w-72 bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
                  {/* Category tabs */}
                  <div className="flex border-b border-[hsl(var(--border))] px-2 pt-2 gap-1">
                    {EMOJI_PICKER_CATEGORIES.map((cat, i) => (
                      <button key={i} onClick={() => setEmojiPickerTab(i)}
                        className={`flex-1 h-8 rounded-lg text-base transition-colors ${emojiPickerTab === i ? 'bg-[hsl(var(--accent)/0.15)]' : 'hover:bg-[hsl(var(--bg-tertiary))]'}`}>
                        {cat.label}
                      </button>
                    ))}
                  </div>
                  {/* Emoji grid */}
                  <div className="p-2 grid grid-cols-8 gap-0.5 max-h-48 overflow-y-auto">
                    {EMOJI_PICKER_CATEGORIES[emojiPickerTab].emojis.map((emoji, i) => (
                      <button key={i}
                        onClick={() => {
                          if (editingMsg) setEditContent(c => c + emoji);
                          else setInput(c => c + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="h-9 rounded-lg text-xl hover:bg-[hsl(var(--bg-tertiary))] transition-colors flex items-center justify-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Text input (middle) */}
            <input
              ref={inputRef}
              value={editingMsg ? editContent : input}
              onChange={e => (editingMsg ? setEditContent(e.target.value) : setInput(e.target.value))}
              onKeyDown={handleKeyDown}
              placeholder={editingMsg ? 'Edit message...' : 'Type a message...'}
              className="flex-1 h-9 bg-transparent border-0 px-2 text-sm text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none min-w-0"
            />

            {/* 3. Paperclip / Attachment Button (far right inside) */}
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                setShowAttachMenu(!showAttachMenu);
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0 ${
                showAttachMenu
                  ? 'bg-[hsl(var(--accent))] text-white'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--bg-secondary))]'
              }`}
              title="Attach media, files & quick cards"
            >
              <Paperclip className="w-4.5 h-4.5 -rotate-45" />
            </button>

            {/* 4. Live Camera Button (far right inside) */}
            <button
              type="button"
              onClick={openLiveCamera}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--bg-secondary))] transition-all shrink-0"
              title="Take Photo"
            >
              <Camera className="w-4.5 h-4.5" />
            </button>
          </div>
        )}

        {/* ── MIC ICON THAT TRANSFORMS TO SEND BUTTON (FAR RIGHT OUTSIDE) ────── */}
        {isRecordingVoice ? (
          <button
            type="button"
            onClick={stopAndSendVoiceRecording}
            className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-md shrink-0 animate-in zoom-in-90 active:scale-95"
            title="Send Voice Memo"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        ) : hasTypedContent ? (
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending}
            className="w-11 h-11 rounded-full bg-[hsl(var(--accent))] text-white flex items-center justify-center hover:opacity-90 transition-all shadow-md shrink-0 animate-in zoom-in-90 active:scale-95"
            title="Send Message"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={startVoiceRecording}
            className="w-11 h-11 rounded-full bg-[hsl(var(--bg-tertiary))] text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent)/0.15)] flex items-center justify-center transition-all shrink-0 active:scale-95 border border-[hsl(var(--border))]"
            title="Record Voice Note"
          >
            <Mic className="w-4.5 h-4.5" />
          </button>
        )}
      </div>

      {/* ── LIVE CAMERA PHOTO CAPTURE MODAL ─────────────────────────────── */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/20 rounded-3xl p-5 max-w-lg w-full space-y-4 shadow-2xl animate-fade-in text-white relative">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Camera className="w-4.5 h-4.5 text-[hsl(var(--accent))]" />
                <span>Take Photo</span>
              </div>
              <div className="flex items-center gap-2">
                {!capturedPhoto && (
                  <button
                    type="button"
                    onClick={() => {
                      const next = cameraFacingMode === 'user' ? 'environment' : 'user';
                      setCameraFacingMode(next);
                      startCameraStream(next);
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Flip camera"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={closeLiveCamera}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Viewfinder / Photo Preview */}
            <div className="relative aspect-[4/3] bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-white/10 shadow-inner">
              {cameraError ? (
                <div className="p-6 text-center text-rose-400 text-xs space-y-2">
                  <p>⚠️ {cameraError}</p>
                  <button
                    onClick={() => startCameraStream(cameraFacingMode)}
                    className="px-3 py-1.5 rounded-xl bg-white/10 text-white hover:bg-white/20 font-bold"
                  >
                    Retry Access
                  </button>
                </div>
              ) : capturedPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={capturedPhoto} alt="Captured" className="w-full h-full object-cover" />
              ) : (
                <video
                  ref={cameraVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? '-scale-x-100' : ''}`}
                />
              )}
            </div>

            {/* Photo Caption or Action Buttons */}
            {capturedPhoto ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={photoCaption}
                  onChange={e => setPhotoCaption(e.target.value)}
                  placeholder="Add a caption... (optional)"
                  className="w-full h-10 px-4 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[hsl(var(--accent))]"
                  onKeyDown={e => { if (e.key === 'Enter') sendCapturedPhoto(); }}
                />
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={retakePhoto}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Retake
                  </button>
                  <button
                    type="button"
                    onClick={sendCapturedPhoto}
                    className="flex-1 py-2.5 rounded-xl bg-[hsl(var(--accent))] hover:opacity-90 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Photo
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-2">
                <button
                  type="button"
                  onClick={takePhotoSnapshot}
                  disabled={Boolean(cameraError)}
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/40 active:scale-95 transition-all shadow-xl disabled:opacity-40"
                  title="Capture photo"
                >
                  <span className="w-12 h-12 rounded-full bg-white block" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MESSAGE INFO MODAL ──────────────────────────────────────────── */}
      {infoMsg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[hsl(var(--border))] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setInfoMsg(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-[hsl(var(--text-secondary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h3 className="font-extrabold text-sm text-[hsl(var(--text-primary))] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[hsl(var(--accent))]" /> Message Info
                </h3>
              </div>
              <button
                onClick={() => setInfoMsg(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--bg-tertiary))] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* 1. Message Preview Box */}
              <div className="p-4 rounded-2xl bg-[hsl(var(--bg-primary))] border border-[hsl(var(--border))] space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[hsl(var(--text-tertiary))]">
                  <span className="font-bold text-[hsl(var(--accent))]">
                    {infoMsg.sender_id === currentUserId ? 'You' : infoMsg.sender?.full_name || 'Sender'}
                  </span>
                  <span>{formatDateDivider(infoMsg.created_at)} • {formatTimestamp(infoMsg.created_at)}</span>
                </div>

                {/* Message Content / Attachment preview */}
                {infoMsg.attachment ? (
                  infoMsg.attachment.type === 'image' ? (
                    <div className="space-y-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={infoMsg.attachment.url} alt={infoMsg.attachment.name} className="max-h-48 rounded-xl object-cover" />
                      {infoMsg.attachment.sub && <p className="text-xs text-[hsl(var(--text-primary))]">{infoMsg.attachment.sub}</p>}
                    </div>
                  ) : infoMsg.attachment.type === 'audio' ? (
                    <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] flex items-center gap-2.5 text-xs">
                      <Music className="w-4 h-4 text-[hsl(var(--accent))]" />
                      <span className="font-bold">Voice Note ({infoMsg.attachment.duration || '0:05'})</span>
                    </div>
                  ) : infoMsg.attachment.type === 'call' ? (
                    (() => {
                      const isMeInfo = infoMsg.sender_id === currentUserId;
                      const isVideo = infoMsg.attachment.name?.toLowerCase().includes('video') || infoMsg.attachment.call_type === 'video';
                      const isUnanswered = infoMsg.attachment.sub === 'missed' || infoMsg.attachment.sub === 'declined' || infoMsg.attachment.sub === 'unanswered';
                      const callTitle = isMeInfo
                        ? (isVideo ? 'Outgoing Video Call' : 'Outgoing Voice Call')
                        : isUnanswered
                          ? (isVideo ? 'Missed Video Call' : 'Missed Voice Call')
                          : (isVideo ? 'Incoming Video Call' : 'Incoming Voice Call');

                      return (
                        <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] flex items-center gap-2.5 text-xs">
                          {isMeInfo ? (
                            <PhoneOutgoing className="w-4 h-4 text-[hsl(var(--accent))]" />
                          ) : isUnanswered ? (
                            <PhoneMissed className="w-4 h-4 text-rose-500" />
                          ) : (
                            <PhoneIncoming className="w-4 h-4 text-emerald-500" />
                          )}
                          <span className="font-bold">{callTitle}{infoMsg.attachment.duration ? ` (${infoMsg.attachment.duration})` : isUnanswered ? ' (Unanswered)' : ''}</span>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="p-2.5 rounded-xl bg-[hsl(var(--bg-secondary))] flex items-center gap-2.5 text-xs">
                      <FileText className="w-4 h-4 text-[hsl(var(--accent))]" />
                      <span className="font-bold truncate">{infoMsg.attachment.name}</span>
                    </div>
                  )
                ) : (
                  <p className="text-xs text-[hsl(var(--text-primary))] whitespace-pre-line leading-relaxed">
                    {infoMsg.content}
                  </p>
                )}
              </div>

              {/* 2. Read Status Section */}
              <div className="rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] overflow-hidden">
                <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-sky-400" />
                    <span className="text-xs font-bold text-[hsl(var(--text-primary))]">Read</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400">
                    {channel?.type === 'group'
                      ? `${(infoMsg.read_by || []).length} / ${(channel.participants || []).filter(p => p.id !== infoMsg.sender_id).length}`
                      : (infoMsg.read_by || []).length > 0 ? 'Read' : 'Unread'}
                  </span>
                </div>

                {/* Readers list */}
                <div className="divide-y divide-[hsl(var(--border))]">
                  {channel?.type === 'group' ? (
                    (() => {
                      const readers = (channel.participants || []).filter(p => (infoMsg.read_by || []).includes(p.id) && p.id !== infoMsg.sender_id);
                      if (readers.length === 0) {
                        return (
                          <div className="p-4 text-center text-xs text-[hsl(var(--text-tertiary))]">
                            No group members have read this message yet.
                          </div>
                        );
                      }
                      return readers.map(user => (
                        <div key={user.id} className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(user.id)}`}>
                              {user.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : getInitials(user.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{user.full_name}</p>
                              <p className="text-[10px] text-[hsl(var(--text-tertiary))] capitalize">{user.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] font-bold text-sky-400">
                            <CheckCheck className="w-3.5 h-3.5" /> Read
                          </div>
                        </div>
                      ));
                    })()
                  ) : (
                    (() => {
                      const isRead = (infoMsg.read_by || []).length > 0 || (otherParticipant && (infoMsg.read_by || []).includes(otherParticipant.id));
                      return (
                        <div className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(otherParticipant?.id || '1')}`}>
                              {otherParticipant?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={otherParticipant.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : getInitials(otherParticipant?.full_name || 'U')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{otherParticipant?.full_name || 'Recipient'}</p>
                              <p className="text-[10px] text-[hsl(var(--text-tertiary))] capitalize">{otherParticipant?.role || 'User'}</p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${isRead ? 'text-sky-400' : 'text-[hsl(var(--text-tertiary))]'}`}>
                            {isRead ? (
                              <><CheckCheck className="w-3.5 h-3.5" /> Read</>
                            ) : (
                              <span>Not read yet</span>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>

              {/* 3. Delivered Status Section */}
              <div className="rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] overflow-hidden">
                <div className="px-4 py-3 border-b border-[hsl(var(--border))] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-[hsl(var(--text-tertiary))]" />
                    <span className="text-xs font-bold text-[hsl(var(--text-primary))]">Delivered</span>
                  </div>
                  <span className="text-[10px] text-[hsl(var(--text-tertiary))]">
                    {formatDateDivider(infoMsg.created_at)} at {formatTimestamp(infoMsg.created_at)}
                  </span>
                </div>

                {/* Delivered list for groups */}
                {channel?.type === 'group' && (
                  <div className="divide-y divide-[hsl(var(--border))] max-h-40 overflow-y-auto">
                    {(() => {
                      const unreadMembers = (channel.participants || []).filter(p => !(infoMsg.read_by || []).includes(p.id) && p.id !== infoMsg.sender_id);
                      if (unreadMembers.length === 0) {
                        return (
                          <div className="p-3 text-center text-xs text-[hsl(var(--text-tertiary))]">
                            All group members have read this message.
                          </div>
                        );
                      }
                      return unreadMembers.map(user => (
                        <div key={user.id} className="p-3 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColor(user.id)}`}>
                              {user.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : getInitials(user.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[hsl(var(--text-primary))] truncate">{user.full_name}</p>
                              <p className="text-[10px] text-[hsl(var(--text-tertiary))] capitalize">{user.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-[hsl(var(--text-tertiary))]">
                            <CheckCheck className="w-3.5 h-3.5" /> Delivered
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>

              {/* 4. Reactions summary (if any) */}
              {infoMsg.reactions && Object.keys(infoMsg.reactions).length > 0 && (
                <div className="rounded-2xl bg-[hsl(var(--bg-tertiary)/0.5)] border border-[hsl(var(--border))] p-4 space-y-2">
                  <span className="text-xs font-bold text-[hsl(var(--text-primary))] flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-[hsl(var(--accent))]" /> Reactions
                  </span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {Object.entries(infoMsg.reactions).map(([emoji, userIds]) => (
                      <div key={emoji} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[hsl(var(--bg-secondary))] border border-[hsl(var(--border))] text-xs">
                        <span className="text-base">{emoji}</span>
                        <span className="font-bold text-[hsl(var(--text-primary))]">{userIds.length}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Inline icon component for empty state
function MessageSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  );
}
