import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { Phone, Lock, ChevronRight, ChevronLeft } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');

  return (
    <PageWrapper title="RESET PASSWORD" showNav={false}>
      <div className="bg-white min-h-screen p-4 flex flex-col items-center pt-8">
        <button 
          onClick={() => navigate(-1)} 
          className="self-start flex items-center gap-2 text-gray-400 hover:text-[#ff0000] font-black text-[10px] uppercase tracking-widest transition-colors mb-6 active:scale-95"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <form className="w-full space-y-4" onSubmit={(e) => e.preventDefault()}>
          {/* Mobile Number Input Group */}
          <div className="flex border border-gray-200 rounded-2xl overflow-hidden h-14 bg-gray-50/50 shadow-sm focus-within:border-[#f42464]/30 transition-all">
            <div className="bg-gray-100/50 px-5 flex items-center justify-center border-r border-gray-100 text-gray-400 font-black text-[10px] uppercase tracking-widest">
              +91
            </div>
            <input 
              className="flex-grow px-4 outline-none border-none focus:ring-0 text-sm font-bold text-gray-700 bg-transparent placeholder:text-gray-300" 
              placeholder="Enter mobile number" 
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </div>

          <button className="w-full bg-[#ff0000] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" type="button">
             GET OTP <ChevronRight size={16} />
          </button>

          {/* OTP Input Group */}
          <div className="flex border border-gray-200 rounded-2xl overflow-hidden h-14 bg-gray-50/50 shadow-sm focus-within:border-[#f42464]/30 transition-all mt-8">
            <div className="bg-gray-100/50 px-5 flex items-center justify-center border-r border-gray-100 text-gray-400">
               <Lock size={16} />
            </div>
            <input 
              className="flex-grow px-4 outline-none border-none focus:ring-0 text-sm font-bold text-gray-700 bg-transparent placeholder:text-gray-300" 
              placeholder="Enter OTP here" 
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>

          <button className="w-full bg-[#ff0000] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2" type="button">
             CONFIRM OTP <ChevronRight size={16} />
          </button>
        </form>

        <div className="mt-auto py-10 opacity-30 text-center">
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400 italic">India's Largest Prizes Agency</p>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ResetPasswordPage;
