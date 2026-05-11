import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { Bell, Lock, Shield, User, ChevronRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const settingsOptions = [
    { icon: <User size={20} />, label: 'Personal Information', desc: 'Update your profile details', onClick: () => navigate('/settings/personal-info') },
    { icon: <Lock size={20} />, label: 'Change Password', desc: 'Secure your account', onClick: () => navigate('/reset-password') },
    { icon: <Bell size={20} />, label: 'Notifications', desc: 'Manage push & email alerts', onClick: () => navigate('/settings/notifications') },
    { icon: <Shield size={20} />, label: 'Privacy & Security', desc: 'Two-factor auth & devices', onClick: () => navigate('/settings/privacy') },
    { icon: <HelpCircle size={20} />, label: 'Help & Support', desc: 'Contact Diamond Secretariat', onClick: () => navigate('/settings/help') }
  ];

  return (
    <PageWrapper title="ACCOUNT SETTINGS" showNav={true} showBack={true}>
      <div className="bg-[#f8f9fa] min-h-screen p-4 pb-24">
        
        {/* Header Graphic */}
        <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden mb-6 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-[#ff0033]/20 transition-colors"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-black font-condensed tracking-tighter uppercase italic leading-none">Security Configuration</h2>
            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Manage preferences for {user?.name || 'your account'}</p>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 mb-2 italic">General Preferences</p>
          
          {settingsOptions.map((opt, idx) => (
            <div 
              key={idx} 
              onClick={opt.onClick}
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-95 transition-all cursor-pointer hover:border-gray-200"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-[#ff0033]/10 group-hover:text-[#ff0033] transition-colors border border-gray-100">
                  {opt.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight italic">{opt.label}</h3>
                  <p className="text-[10px] font-medium text-gray-400 mt-0.5">{opt.desc}</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-300 group-hover:text-[#ff0033] transition-colors" />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center opacity-30">
           <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] italic">Diamond Security Protocol v2.1</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default UserSettings;
