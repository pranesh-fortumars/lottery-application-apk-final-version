import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { Shield, Key, DownloadCloud, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacySecurityPage = () => {
  const navigate = useNavigate();

  const securityOptions = [
    { icon: <Key size={20} />, label: 'Two-Factor Authentication', desc: 'Add an extra layer of security', status: 'Disabled', color: 'text-gray-400' },
    { icon: <History size={20} />, label: 'Login History', desc: 'Review recent account access', status: 'Secure', color: 'text-emerald-500' },
    { icon: <DownloadCloud size={20} />, label: 'Download Account Data', desc: 'Get a copy of your info', status: 'Ready', color: 'text-blue-500' },
  ];

  return (
    <PageWrapper title="PRIVACY & SECURITY" showNav={false}>
      <div className="bg-[#f8f9fa] min-h-screen pb-24">
        {/* Header */}
        <div className="bg-[#ff0033] h-[70px] flex items-center px-4 text-white shadow-md relative z-10">
          <button onClick={() => navigate('/settings')} className="p-2 -ml-2 active:scale-95 transition-all">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-black font-condensed tracking-tighter uppercase italic ml-2">Privacy & Security</h1>
        </div>

        <div className="p-4 space-y-4 max-w-lg mx-auto mt-4">
          
          <div className="bg-gray-900 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden group mb-6">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff0033]/20 rounded-full blur-3xl"></div>
             <div className="relative z-10 flex gap-4 items-center">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-emerald-400">
                   <Shield size={28} />
                </div>
                <div>
                   <h2 className="text-xl font-black font-condensed tracking-tighter uppercase italic leading-none">Security Status</h2>
                   <p className="text-emerald-400 text-[10px] font-black uppercase tracking-widest mt-1">Good - Protected</p>
                </div>
             </div>
          </div>

          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-4 mb-2 italic">Advanced Security</p>
          
          {securityOptions.map((opt, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center justify-between group active:scale-[0.98] transition-all cursor-pointer hover:border-gray-200"
              onClick={() => alert(`Redirecting to ${opt.label} configuration...`)}
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
              <div className="flex items-center gap-2">
                 <span className={`text-[9px] font-black uppercase tracking-widest ${opt.color}`}>{opt.status}</span>
                 <ChevronRight size={16} className="text-gray-300 group-hover:text-[#ff0033] transition-colors" />
              </div>
            </div>
          ))}

          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <button className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] hover:underline underline-offset-4">
               Delete Account Permanently
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PrivacySecurityPage;
