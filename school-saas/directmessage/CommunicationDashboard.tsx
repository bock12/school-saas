import React, { useState, useEffect } from "react";
import { Organization, UserProfile } from "../../types";
import { MessageSquare, Bell, Mail, Smartphone, Plus, LayoutDashboard, X, Send, Sparkles, BarChart2 } from "lucide-react";
import { useLocation } from "react-router-dom";
import StudentCommunication from "../student/StudentCommunication";
import ChatInterface from "./ChatInterface";
import AnnouncementsHub from "../announcements/AnnouncementsHub";
import { AnnouncementForm } from "../announcements/AnnouncementForm";
import CampaignsModule from "./CampaignsModule";
import Stories from "./Stories";
import GroupPollsModule from "./GroupPollsModule";
import { usePersistentState } from '../../hooks/usePersistentState';

interface CommunicationDashboardProps {
  organization: Organization;
  userProfile?: UserProfile | null;
}

export default function CommunicationDashboard({
  organization,
  userProfile,
}: CommunicationDashboardProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = usePersistentState<
    "overview" | "messaging" | "stories" | "announcements" | "campaigns" | "polls"
  >('tab_CommunicationDashboard', "overview");
  const [showNewBroadcast, setShowNewBroadcast] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (
      tab &&
      ["overview", "messaging", "stories", "announcements", "campaigns", "polls"].includes(tab)
    ) {
      setActiveTab(tab as any);
    }
  }, [location]);

  if (userProfile?.role === "student" || userProfile?.role === "parent") {
    return (
      <StudentCommunication
        organization={organization}
        userProfile={userProfile}
      />
    );
  }

  if (!userProfile) return null;

  return (
    <div className={`space-y-4 md:space-y-8 pb-16 md:pb-0 flex flex-col ${activeTab === 'messaging' ? 'h-[calc(100vh-80px)] sm:h-[calc(100vh-100px)] md:h-auto min-h-0' : ''}`}>
      <div className={`flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 ${activeTab === "messaging" ? "hidden md:flex" : "flex"}`}>
        {activeTab !== "campaigns" && (
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-1 md:mb-2">
              Communication
            </h1>
            <p className="text-[#9e9e9e] text-xs sm:text-sm md:text-lg">
              Manage messages, announcements, emails, and SMS notifications.
            </p>
          </div>
        )}
        <div className={`flex overflow-x-auto scrollbar-none bg-white p-1 md:p-1.5 rounded-2xl border border-[#e5e5e5] shadow-xs max-w-full ${activeTab === "campaigns" ? "ml-auto" : ""}`}>
          <div className="flex gap-1 sm:gap-2 min-w-max">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "overview" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-[#9e9e9e] hover:text-[#1a1a1a]"}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("messaging")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "messaging" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-[#9e9e9e] hover:text-[#1a1a1a]"}`}
            >
              Internal Messaging
            </button>
            <button
              onClick={() => setActiveTab("stories")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "stories" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-[#9e9e9e] hover:text-[#1a1a1a]"}`}
            >
              School Stories (24h)
            </button>
            <button
              onClick={() => setActiveTab("announcements")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "announcements" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-[#9e9e9e] hover:text-[#1a1a1a]"}`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab("campaigns")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "campaigns" ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "text-[#9e9e9e] hover:text-[#1a1a1a]"}`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab("polls")}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${activeTab === "polls" ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "text-[#9e9e9e] hover:text-[#1a1a1a]"}`}
            >
              Interactive Polls 📊
            </button>
          </div>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-white p-2 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-[#e5e5e5] flex flex-col items-center text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-1">1,450</h3>
              <p className="text-[#9e9e9e] text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-tighter sm:tracking-widest mt-1 text-center leading-tight">
                Messages Sent
              </p>
            </div>
            <div className="bg-white p-2 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-[#e5e5e5] flex flex-col items-center text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-1">24</h3>
              <p className="text-[#9e9e9e] text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-tighter sm:tracking-widest mt-1 text-center leading-tight">
                Announcements
              </p>
            </div>
            <div className="bg-white p-2 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-[#e5e5e5] flex flex-col items-center text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-1">8,200</h3>
              <p className="text-[#9e9e9e] text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-tighter sm:tracking-widest mt-1 text-center leading-tight">
                Emails Delivered
              </p>
            </div>
            <div className="bg-white p-2 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-[#e5e5e5] flex flex-col items-center text-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
                <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black mb-1">3,100</h3>
              <p className="text-[#9e9e9e] text-[8px] sm:text-[10px] md:text-xs lg:text-sm font-bold uppercase tracking-tighter sm:tracking-widest mt-1 text-center leading-tight">
                SMS Sent
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[40px] border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black tracking-tight">
                  Recent Announcements
                </h3>
                <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: "School Closed - Public Holiday",
                    date: "2 hours ago",
                    type: "Holiday",
                  },
                  {
                    title: "New Grading Policy for Term 2",
                    date: "Yesterday",
                    type: "Academic",
                  },
                  {
                    title: "Annual Sports Day Registration",
                    date: "2 days ago",
                    type: "Event",
                  },
                ].map((ann, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#f9f9f9] transition-all border border-transparent hover:border-[#e5e5e5]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm">{ann.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                          {ann.type}
                        </span>
                        <span className="text-[10px] text-[#9e9e9e] font-bold">
                          {ann.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-[#e5e5e5]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black tracking-tight">
                  Quick Actions
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab("messaging")}
                  className="p-6 rounded-3xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all text-left group"
                >
                  <MessageSquare className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="font-black text-sm mb-1">New Message</h4>
                  <p className="text-xs text-blue-600/60 font-bold">
                    Direct or group chat
                  </p>
                </button>
                <button 
                  onClick={() => setActiveTab("messaging")}
                  className="p-6 rounded-3xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-all text-left group border border-emerald-200/50"
                >
                  <Sparkles className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform text-emerald-600 fill-emerald-200" />
                  <h4 className="font-black text-sm mb-1">School Stories (24h)</h4>
                  <p className="text-xs text-emerald-700/70 font-bold">
                    Share 24h visual updates
                  </p>
                </button>
                <button 
                  onClick={() => setShowNewBroadcast(true)}
                  className="p-6 rounded-3xl bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all text-left group"
                >
                  <Bell className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="font-black text-sm mb-1">Broadcast</h4>
                  <p className="text-xs text-purple-600/60 font-bold">
                    Post announcement
                  </p>
                </button>
                <button 
                  onClick={() => setActiveTab("campaigns")}
                  className="p-6 rounded-3xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-all text-left group"
                >
                  <Mail className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="font-black text-sm mb-1">Email Blast</h4>
                  <p className="text-xs text-orange-600/60 font-bold">
                    Send to all parents
                  </p>
                </button>
                <button 
                  onClick={() => setActiveTab("campaigns")}
                  className="p-6 rounded-3xl bg-green-50 text-green-600 hover:bg-green-100 transition-all text-left group"
                >
                  <Smartphone className="w-8 h-8 mb-4 group-hover:scale-110 transition-transform" />
                  <h4 className="font-black text-sm mb-1">SMS Alert</h4>
                  <p className="text-xs text-green-600/60 font-bold">
                    Urgent notifications
                  </p>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "messaging" && (
        <ChatInterface organization={organization} userProfile={userProfile} onBack={() => setActiveTab('overview')} />
      )}

      {activeTab === "stories" && (
        <Stories organizationId={organization.id} currentUser={userProfile!} isStandaloneTab />
      )}

      {activeTab === "announcements" && (
        <AnnouncementsHub
          organization={organization}
          userProfile={userProfile!}
          hideHeader
        />
      )}

      {(activeTab === "campaigns") && (
        <CampaignsModule organization={organization} />
      )}

      {activeTab === "polls" && (
        <GroupPollsModule organization={organization} userProfile={userProfile!} />
      )}

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] pb-safe z-50">
        <div className="flex justify-around items-end p-2 relative">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex flex-col items-center gap-1 p-2 w-[20%] rounded-xl transition-all ${
              activeTab === "overview" ? "text-blue-600 bg-blue-50" : "text-[#9e9e9e] hover:text-[#1a1a1a] hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("messaging")}
            className={`flex flex-col items-center gap-1 p-2 w-[20%] rounded-xl transition-all ${
              activeTab === "messaging" ? "text-blue-600 bg-blue-50" : "text-[#9e9e9e] hover:text-[#1a1a1a] hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-bold">Messages</span>
          </button>

          {/* Center Floating Action Button */}
          <div className="w-[20%] flex justify-center -mt-8 pb-2">
            <button
              onClick={() => setShowNewBroadcast(true)}
              className="flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 border-4 border-white"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex flex-col items-center gap-1 p-2 w-[20%] rounded-xl transition-all ${
              activeTab === "announcements" ? "text-blue-600 bg-blue-50" : "text-[#9e9e9e] hover:text-[#1a1a1a] hover:bg-gray-50"
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[10px] font-bold">Notices</span>
          </button>
          <button
            onClick={() => setActiveTab("campaigns")}
            className={`flex flex-col items-center gap-1 p-2 w-[20%] rounded-xl transition-all ${
              activeTab === "campaigns" ? "text-blue-600 bg-blue-50" : "text-[#9e9e9e] hover:text-[#1a1a1a] hover:bg-gray-50"
            }`}
          >
            <Send className="w-5 h-5" />
            <span className="text-[10px] font-bold">Campaigns</span>
          </button>
        </div>
      </div>

      {showNewBroadcast && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-8 py-6 border-b border-[#e5e5e5] flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">
                <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                New Broadcast
              </h2>
              <button
                onClick={() => setShowNewBroadcast(false)}
                className="p-2 text-[#9e9e9e] hover:text-[#1a1a1a] hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
              <AnnouncementForm
                organizationId={organization.id}
                userProfile={userProfile!}
                onSuccess={() => setShowNewBroadcast(false)}
                onCancel={() => setShowNewBroadcast(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
