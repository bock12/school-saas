import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDocs, limit, or } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../firebase';
import { Channel, Message, User } from '../../types/chat';
import { Organization, UserProfile, ClassSection } from '../../types';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import SchoolStatusModal from './SchoolStatusModal';
import ChatPrivacyModal from './ChatPrivacyModal';
import { updateUserActiveStatus } from '../../lib/presence';
import { Search, X, Plus, Users, MessageSquare, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { usePersistentState } from '../../hooks/usePersistentState';

interface ChatInterfaceProps {
  organization: Organization;
  userProfile: UserProfile;
  onBack?: () => void;
}

export default function ChatInterface({ organization, userProfile, onBack }: ChatInterfaceProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [classSections, setClassSections] = useState<ClassSection[]>([]);

  // Fetch departments and class sections for filtering
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const deptSnap = await getDocs(collection(db, 'organizations', organization.id, 'departments'));
        setDepartments(deptSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const sectionSnap = await getDocs(collection(db, 'organizations', organization.id, 'class_sections'));
        setClassSections(sectionSnap.docs.map(d => ({ id: d.id, ...d.data() } as ClassSection)));
      } catch (err) {
        console.error("Error fetching chat metadata:", err);
      }
    };

    fetchMetadata();
  }, [organization.id]);

  const currentUser: User = {
    id: userProfile.uid,
    name: userProfile.displayName,
    email: userProfile.email || '',
    role: userProfile.role,
    profileImage: userProfile.photoURL || null
  };

  // Fetch channels
  useEffect(() => {
    if (!userProfile.uid) return;

    const q = query(
      collection(db, 'channels'),
      where('organizationId', '==', organization.id),
      where('participantIds', 'array-contains', userProfile.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const channelsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Channel[];
      setChannels(channelsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'channels');
    });

    return () => unsubscribe();
  }, [userProfile.uid, organization.id]);

  // Fetch messages for active channel
  useEffect(() => {
    if (!activeChannelId) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'channels', activeChannelId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messagesData);

      // Mark messages as delivered and read for recipient
      messagesData.forEach(async (msg) => {
        if (msg.fromUserId !== userProfile.uid) {
          const updates: any = {};
          if (!msg.delivered) {
            updates.delivered = true;
            updates.deliveredAt = new Date().toISOString();
          }
          if (!msg.read) {
            updates.read = true;
            updates.readAt = new Date().toISOString();
          }
          if (Object.keys(updates).length > 0) {
            try {
              await updateDoc(doc(db, 'channels', activeChannelId, 'messages', msg.id), updates);
            } catch (err) {
              console.error("Error updating message status:", err);
            }
          }
        }
      });
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `channels/${activeChannelId}/messages`);
    });

    return () => unsubscribe();
  }, [activeChannelId, userProfile.uid]);

  // Real-time presence heartbeat & activity tracking
  useEffect(() => {
    if (!userProfile.uid) return;

    let isSubscribed = true;

    const handlePing = () => {
      if (!isSubscribed) return;
      if (document.visibilityState === 'visible') {
        updateUserActiveStatus(userProfile.uid, true);
      } else {
        updateUserActiveStatus(userProfile.uid, false);
      }
    };

    // Initial ping
    handlePing();

    // Regular interval
    const interval = setInterval(handlePing, 15000);

    // Event listeners for window visibility and unload
    const handleVisibilityChange = () => {
      handlePing();
    };

    const handleBeforeUnload = () => {
      updateUserActiveStatus(userProfile.uid, false);
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('mousemove', handlePing, { passive: true });
    window.addEventListener('keydown', handlePing, { passive: true });

    return () => {
      isSubscribed = false;
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mousemove', handlePing);
      window.removeEventListener('keydown', handlePing);
      updateUserActiveStatus(userProfile.uid, false);
    };
  }, [userProfile.uid]);

  // Fetch available users for new chat & groups
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 1. Fetch class_students junction for student-class mapping
        const classStudentsMap: Record<string, string> = {};
        try {
          const csSnap = await getDocs(collection(db, 'organizations', organization.id, 'class_students'));
          csSnap.docs.forEach(d => {
            const data = d.data();
            if (data.studentId && data.sectionId) {
              classStudentsMap[data.studentId] = data.sectionId;
            }
          });
        } catch (e) {
          console.warn("Could not fetch class_students:", e);
        }

        // 2. Fetch users collection (staff, teachers, admins, registered students/parents)
        const usersQ = query(
          collection(db, 'users'),
          where('organizationId', '==', organization.id)
        );
        const usersSnap = await getDocs(usersQ);
        
        const userMap = new Map<string, UserProfile>();
        usersSnap.docs.forEach(doc => {
          const data = doc.data();
          const uid = doc.id;
          const name = data.displayName || data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User';
          
          userMap.set(uid, {
            uid,
            id: uid,
            displayName: name,
            email: data.email || '',
            role: data.role || 'student',
            photoURL: data.photoURL || data.profileImage || null,
            gradeLevel: data.gradeLevel || data.grade || '',
            department: data.department || data.departmentId || '',
            classSectionId: data.classSectionId || data.classId || classStudentsMap[uid] || classStudentsMap[data.entityId || ''] || '',
            organizationId: organization.id,
            entityId: data.entityId || ''
          } as UserProfile);
        });

        // 3. Fetch student records from organization
        try {
          const studentsSnap = await getDocs(collection(db, 'organizations', organization.id, 'students'));
          studentsSnap.docs.forEach(doc => {
            const sData = doc.data();
            const sId = doc.id;
            const sName = `${sData.firstName || ''} ${sData.lastName || ''}`.trim() || sData.fullName || sData.displayName || 'Student';
            const sEmail = sData.email || '';
            const sSectionId = sData.classSectionId || sData.classId || sData.sectionId || classStudentsMap[sId] || classStudentsMap[sData.studentId || ''] || '';

            // Check if there is already a user account matching this student
            let matchedUserKey: string | null = null;
            for (const [uid, uProf] of userMap.entries()) {
              if (
                uid === sId ||
                uProf.entityId === sId ||
                (sData.studentId && uProf.entityId === sData.studentId) ||
                (sEmail && uProf.email && uProf.email.toLowerCase() === sEmail.toLowerCase())
              ) {
                matchedUserKey = uid;
                break;
              }
            }

            if (matchedUserKey) {
              // Enrich matched user record
              const existing = userMap.get(matchedUserKey)!;
              existing.gradeLevel = existing.gradeLevel || sData.gradeLevel || sData.grade || '';
              existing.department = existing.department || sData.department || sData.departmentId || '';
              existing.classSectionId = existing.classSectionId || sSectionId;
              if (!existing.photoURL && (sData.photoURL || sData.profilePhoto)) {
                existing.photoURL = sData.photoURL || sData.profilePhoto;
              }
            } else {
              // Add student record as a user profile
              userMap.set(sId, {
                uid: sId,
                id: sId,
                displayName: sName,
                email: sEmail,
                role: 'student',
                photoURL: sData.photoURL || sData.profilePhoto || null,
                gradeLevel: sData.gradeLevel || sData.grade || '',
                department: sData.department || sData.departmentId || '',
                classSectionId: sSectionId,
                organizationId: organization.id,
                entityId: sId
              } as UserProfile);
            }
          });
        } catch (e) {
          console.warn("Could not fetch organization students:", e);
        }

        const allUsers = Array.from(userMap.values());

        // Exclude current user
        const finalUsers = allUsers.filter(u => 
          u.uid !== userProfile.uid && 
          u.id !== userProfile.uid && 
          (u.email && userProfile.email ? u.email.toLowerCase() !== userProfile.email.toLowerCase() : true)
        );

        setAvailableUsers(finalUsers);
      } catch (err) {
        console.error("Error fetching available users", err);
      }
    };

    if (showNewMessageModal || showNewChannelModal) {
      fetchUsers();
    }
  }, [showNewMessageModal, showNewChannelModal, organization.id, userProfile.uid, userProfile.email]);

  const handleSendMessage = async (content: string, attachment?: any, replyTo?: any) => {
    if (!activeChannelId) return;

    let cleanAttachment = null;
    if (attachment) {
      const { blob, file, ...rest } = attachment;
      cleanAttachment = JSON.parse(JSON.stringify(rest));
    }

    const messageData: any = {
      channelId: activeChannelId,
      fromUserId: userProfile.uid,
      sender: currentUser,
      content,
      attachment: cleanAttachment,
      createdAt: new Date().toISOString(),
      delivered: false,
      read: false
    };

    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    try {
      await addDoc(collection(db, 'channels', activeChannelId, 'messages'), messageData);
      
      // Update channel's last message
      await updateDoc(doc(db, 'channels', activeChannelId), {
        lastMessage: {
          id: 'temp', // Firestore will generate real ID
          content: attachment ? `Sent an attachment: ${attachment.name}` : content,
          createdAt: new Date().toISOString(),
          fromUserId: userProfile.uid
        },
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const startDirectMessage = async (targetUser: UserProfile) => {
    // Check if DM already exists
    const existingChannel = channels.find(c => 
      c.type === 'direct' && 
      c.participantIds?.includes(targetUser.uid) && 
      c.participantIds?.includes(userProfile.uid)
    );

    if (existingChannel) {
      setActiveChannelId(existingChannel.id);
      setShowNewMessageModal(false);
      return;
    }

    // Create new DM channel
    const participants: User[] = [
      currentUser,
      {
        id: targetUser.uid,
        name: targetUser.displayName,
        email: targetUser.email || '',
        role: targetUser.role,
        profileImage: targetUser.photoURL || null
      }
    ];

    const newChannelData = {
      type: 'direct',
      organizationId: organization.id,
      participantIds: [userProfile.uid, targetUser.uid],
      participants,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userProfile.uid
    };

    try {
      const docRef = await addDoc(collection(db, 'channels'), newChannelData);
      setActiveChannelId(docRef.id);
      setShowNewMessageModal(false);
    } catch (err) {
      console.error("Error creating DM:", err);
    }
  };

  const createGroupChannel = async (name: string, selectedUserIds: string[], avatarUrl?: string) => {
    const participants: User[] = availableUsers
      .filter(u => selectedUserIds.includes(u.uid))
      .map(u => ({
        id: u.uid,
        name: u.displayName,
        email: u.email,
        role: u.role,
        profileImage: u.photoURL
      }));

    participants.push(currentUser);

    const newChannelData = {
      name,
      type: 'group',
      organizationId: organization.id,
      participantIds: [...selectedUserIds, userProfile.uid],
      participants,
      adminIds: [userProfile.uid],
      onlyAdminsCanPost: false,
      avatarUrl: avatarUrl || '',
      icon: avatarUrl || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userProfile.uid
    };

    try {
      const docRef = await addDoc(collection(db, 'channels'), newChannelData);
      setActiveChannelId(docRef.id);
      setShowNewChannelModal(false);
    } catch (err) {
      console.error("Error creating group:", err);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[100dvh] md:h-[700px] min-h-0 bg-white md:rounded-[40px] md:border border-[#e5e5e5] md:shadow-xl overflow-hidden min-w-0 fixed inset-0 z-[100] md:relative md:inset-auto md:z-auto">
      <div className={`${activeChannelId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-72 lg:w-80 xl:w-88 shrink-0 h-full min-w-0`}>
        <ChatSidebar 
          channels={channels}
          activeChannelId={activeChannelId}
          onSelectChannel={setActiveChannelId}
          onNewMessage={() => setShowNewMessageModal(true)}
          onNewChannel={() => setShowNewChannelModal(true)}
          onOpenStatusModal={() => setShowStatusModal(true)}
          onOpenPrivacyModal={() => setShowPrivacyModal(true)}
          currentUser={currentUser}
          onBack={onBack}
        />
      </div>
      
      <div className={`${!activeChannelId ? 'hidden md:flex' : 'flex'} flex-col flex-1 h-full min-w-0 w-full`}>
        <ChatWindow 
          channel={channels.find(c => c.id === activeChannelId) || null}
          messages={messages}
          allChannels={channels}
          onSendMessage={handleSendMessage}
          currentUser={currentUser}
          onClose={() => setActiveChannelId(null)}
        />
      </div>

      {/* Chat Privacy & Online Status Modal */}
      <ChatPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        userProfile={userProfile}
      />

      {/* New Message Modal */}
      <AnimatePresence>
        {showNewMessageModal && (
          <NewMessageModal 
            users={availableUsers}
            departments={departments}
            classSections={classSections}
            onSelectUser={(user) => {
              startDirectMessage(user);
              setShowNewMessageModal(false);
            }}
            onClose={() => setShowNewMessageModal(false)}
          />
        )}
      </AnimatePresence>

      {/* New Group Modal */}
      <AnimatePresence>
        {showNewChannelModal && (
          <NewChannelModal 
            users={availableUsers}
            departments={departments}
            classSections={classSections}
            onCreate={createGroupChannel}
            onClose={() => setShowNewChannelModal(false)}
          />
        )}
      </AnimatePresence>

      {/* School Statuses / Stories Modal */}
      <SchoolStatusModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        organizationId={organization.id}
        currentUser={currentUser}
      />
    </div>
  );
}

function NewChannelModal({ users, departments, classSections, onCreate, onClose }: { 
  users: UserProfile[], 
  departments: any[],
  classSections: ClassSection[],
  onCreate: (name: string, userIds: string[], avatarUrl?: string) => void, 
  onClose: () => void 
}) {
  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = usePersistentState<'all' | 'students' | 'staff'>('tab_ChatInterface', 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilters, setStudentFilters] = useState({
    level: '',
    department: '',
    class: ''
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) setAvatarUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const toggleUser = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'students' && user.role !== 'student') return false;
    if (activeTab === 'staff' && !['teacher', 'school_admin', 'exam_officer'].includes(user.role)) return false;

    // Student specific filters
    if (activeTab === 'students') {
      // Note: UserProfile doesn't directly have level/department/class. 
      // In a real app, we'd need to join with Student record or have these on UserProfile.
      // For now, we'll assume they might be present or we'll filter if they exist.
      if (studentFilters.level && (user as any).gradeLevel !== studentFilters.level) return false;
      if (studentFilters.department && (user as any).department !== studentFilters.department) return false;
      if (studentFilters.class && (user as any).classSectionId !== studentFilters.class) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-[#e5e5e5]"
      >
        <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#f9f9f9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">Create Group</h3>
              <p className="text-[10px] text-[#9e9e9e] font-bold uppercase tracking-widest">Collaborate with your team</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f5] rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-[250px_1fr] gap-6">
          {/* Left Side: Group Info */}
          <div className="space-y-6">
            {/* Group Photo Upload */}
            <div>
              <label className="block text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest mb-2">Group Avatar Photo</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAvatarFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group w-14 h-14 rounded-2xl bg-blue-50 border-2 border-dashed border-blue-300 hover:border-blue-500 flex items-center justify-center cursor-pointer overflow-hidden transition-all shrink-0"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-5 h-5 text-blue-600" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[9px] font-bold">
                    Upload
                  </div>
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5" /> Upload Image
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      className="mt-1 text-[10px] text-red-500 hover:underline font-bold block"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#1a1a1a] uppercase tracking-widest mb-2">Group Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Science Faculty"
                className="w-full px-4 py-3 rounded-xl border border-[#e5e5e5] focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm"
              />
            </div>

            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Selected Members</h4>
              <div className="flex flex-wrap gap-2">
                {selectedIds.length === 0 ? (
                  <p className="text-[10px] text-blue-400 italic">No members selected yet</p>
                ) : (
                  selectedIds.map(id => {
                    const user = users.find(u => u.uid === id);
                    return (
                      <div key={id} className="px-2 py-1 bg-white rounded-lg border border-blue-200 text-[10px] font-bold flex items-center gap-1">
                        {user?.displayName}
                        <button onClick={() => toggleUser(id)} className="hover:text-red-500">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <button
              onClick={() => onCreate(name, selectedIds, avatarUrl)}
              disabled={!name.trim() || selectedIds.length === 0}
              className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:bg-[#e5e5e5] disabled:shadow-none transition-all cursor-pointer"
            >
              Create Group
            </button>
          </div>

          {/* Right Side: Member Selection */}
          <div className="flex flex-col h-[400px]">
            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#f5f5f5] rounded-xl mb-4">
              {(['all', 'students', 'staff'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all ${
                    activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-[#9e9e9e] hover:text-[#1a1a1a]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="space-y-3 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
                <input 
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e5e5e5] focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm"
                />
              </div>

              {activeTab === 'students' && (
                <div className="grid grid-cols-3 gap-2">
                  <select 
                    value={studentFilters.level}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, level: e.target.value }))}
                    className="px-2 py-2 rounded-lg border border-[#e5e5e5] text-[10px] font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="">All Levels</option>
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SSS 1">SSS 1</option>
                    <option value="SSS 2">SSS 2</option>
                    <option value="SSS 3">SSS 3</option>
                  </select>
                  <select 
                    value={studentFilters.department}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, department: e.target.value }))}
                    className="px-2 py-2 rounded-lg border border-[#e5e5e5] text-[10px] font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="">All Depts</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <select 
                    value={studentFilters.class}
                    onChange={(e) => setStudentFilters(prev => ({ ...prev, class: e.target.value }))}
                    className="px-2 py-2 rounded-lg border border-[#e5e5e5] text-[10px] font-bold focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="">All Classes</option>
                    {classSections.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-[#1a1a1a]">No members found</p>
                  <p className="text-[10px] text-[#9e9e9e]">Try adjusting your filters or search term</p>
                </div>
              ) : (
                filteredUsers.map(user => (
                  <button
                    key={user.uid}
                    onClick={() => toggleUser(user.uid)}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left border ${
                      selectedIds.includes(user.uid) 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-[#f9f9f9] border-transparent'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xs overflow-hidden">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user.displayName.charAt(0)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate">{user.displayName}</h4>
                      <p className="text-[9px] text-[#9e9e9e] font-bold uppercase tracking-widest">{user.role}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      selectedIds.includes(user.uid) ? 'bg-blue-600 border-blue-600' : 'border-[#e5e5e5]'
                    }`}>
                      {selectedIds.includes(user.uid) && <Plus className="w-3 h-3 text-white rotate-45" />}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function NewMessageModal({ 
  users, 
  departments, 
  classSections, 
  onSelectUser, 
  onClose 
}: { 
  users: UserProfile[], 
  departments: any[],
  classSections: ClassSection[],
  onSelectUser: (user: UserProfile) => void, 
  onClose: () => void 
}) {
  const [activeTab, setActiveTab] = usePersistentState<'all' | 'students' | 'staff'>('tab_NewMessageModal', 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [studentFilters, setStudentFilters] = useState({
    level: '',
    department: '',
    class: ''
  });

  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'students' && user.role !== 'student') return false;
    if (activeTab === 'staff' && !['teacher', 'school_admin', 'exam_officer', 'admin', 'super_admin'].includes(user.role)) return false;

    // Student specific filters
    if (activeTab === 'students') {
      if (studentFilters.level && (user as any).gradeLevel !== studentFilters.level) return false;
      if (studentFilters.department && (user as any).department !== studentFilters.department) return false;
      if (studentFilters.class && (user as any).classSectionId !== studentFilters.class) return false;
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-[#e5e5e5]"
      >
        <div className="p-6 border-b border-[#e5e5e5] flex items-center justify-between bg-[#f9f9f9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight">New Message</h3>
              <p className="text-[10px] text-[#9e9e9e] font-bold uppercase tracking-widest">Select a user to chat with</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f5] rounded-xl transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#f5f5f5] rounded-xl">
            {(['all', 'students', 'staff'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                  activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-[#9e9e9e] hover:text-[#1a1a1a]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Student Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9e9e9e]" />
              <input 
                type="text"
                placeholder={`Search ${activeTab === 'all' ? 'members' : activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#e5e5e5] focus:ring-2 focus:ring-blue-600 outline-none transition-all text-sm"
              />
            </div>

            {activeTab === 'students' && (
              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={studentFilters.level}
                  onChange={(e) => setStudentFilters(prev => ({ ...prev, level: e.target.value }))}
                  className="px-2 py-2 rounded-lg border border-[#e5e5e5] text-[10px] font-bold focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                >
                  <option value="">All Levels</option>
                  <option value="JSS 1">JSS 1</option>
                  <option value="JSS 2">JSS 2</option>
                  <option value="JSS 3">JSS 3</option>
                  <option value="SSS 1">SSS 1</option>
                  <option value="SSS 2">SSS 2</option>
                  <option value="SSS 3">SSS 3</option>
                </select>
                <select 
                  value={studentFilters.department}
                  onChange={(e) => setStudentFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="px-2 py-2 rounded-lg border border-[#e5e5e5] text-[10px] font-bold focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                >
                  <option value="">All Depts</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
                <select 
                  value={studentFilters.class}
                  onChange={(e) => setStudentFilters(prev => ({ ...prev, class: e.target.value }))}
                  className="px-2 py-2 rounded-lg border border-[#e5e5e5] text-[10px] font-bold focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
                >
                  <option value="">All Classes</option>
                  {classSections.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* User List */}
          <div className="max-h-[320px] min-h-[200px] overflow-y-auto custom-scrollbar pr-1 space-y-2">
            {filteredUsers.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <Search className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-xs font-bold text-[#1a1a1a]">No members found</p>
                <p className="text-[10px] text-[#9e9e9e]">Try adjusting your filters or search term</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.uid}
                  onClick={() => onSelectUser(user)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-blue-50/60 border border-transparent hover:border-blue-100 transition-all text-left group cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                    ) : (
                      user.displayName.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#1a1a1a] truncate group-hover:text-blue-600 transition-colors">{user.displayName}</h4>
                    <p className="text-[10px] text-[#9e9e9e] font-bold uppercase tracking-widest">{user.role}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
