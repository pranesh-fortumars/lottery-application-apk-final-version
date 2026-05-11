import React, { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import { User, Mail, Phone, ShieldCheck, ChevronLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const PersonalInfoPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Profile information updated successfully!');
    navigate('/settings');
  };

  return (
    <PageWrapper title="PERSONAL INFO" showNav={false}>
      <div className="bg-[#f8f9fa] min-h-screen pb-24">
        {/* Header */}
        <div className="bg-[#ff0033] h-[70px] flex items-center px-4 text-white shadow-md relative z-10">
          <button onClick={() => navigate('/settings')} className="p-2 -ml-2 active:scale-95 transition-all">
            <ChevronLeft size={28} />
          </button>
          <h1 className="text-xl font-black font-condensed tracking-tighter uppercase italic ml-2">Edit Profile</h1>
        </div>

        <div className="p-6 space-y-6 max-w-lg mx-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mt-4">
            <div className="w-24 h-24 bg-white p-1 rounded-full shadow-xl mb-4 relative">
               <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 text-[#ff0033]">
                 <User size={40} />
               </div>
               <div className="absolute bottom-0 right-0 bg-[#ff0033] p-2 rounded-full text-white shadow-lg border-2 border-white">
                 <ShieldCheck size={14} />
               </div>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Verified Member</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Full Name</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff0033] transition-colors"><User size={18} /></div>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full h-14 bg-white border border-gray-200 rounded-2xl pl-12 pr-4 font-bold text-gray-900 outline-none focus:border-[#ff0033] focus:ring-2 focus:ring-[#ff0033]/10 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Phone Number</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#ff0033] transition-colors"><Phone size={18} /></div>
                <input 
                  type="tel" 
                  name="mobile"
                  value={formData.mobile}
                  disabled
                  className="w-full h-14 bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 font-bold text-gray-500 outline-none opacity-70 cursor-not-allowed shadow-sm"
                />
              </div>
              <p className="text-[9px] font-bold text-gray-400 ml-2 mt-1">Phone number acts as your account ID and cannot be changed.</p>
            </div>

            <button type="submit" className="w-full bg-[#ff0033] text-white h-14 rounded-2xl font-black uppercase tracking-widest text-sm mt-8 shadow-xl shadow-red-500/20 active:scale-95 transition-all">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PersonalInfoPage;
