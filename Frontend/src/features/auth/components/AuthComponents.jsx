import React, { useState } from 'react';

export const PremiumInput = ({ label, type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="relative w-full group mb-6">
      <input
        type={inputType}
        className="block w-full px-0 pt-5 pb-2 text-white bg-transparent border-b border-gray-700 appearance-none focus:outline-none focus:border-[#E5B300] focus:ring-0 peer transition-colors duration-300 text-sm sm:text-base font-light placeholder-transparent
        /* This magic line prevents the ugly white browser autofill background in dark mode */
        [&-webkit-autofill]:shadow-[0_0_0_1000px_#0a0a0a_inset] [&-webkit-autofill]:[-webkit-text-fill-color:white]"
        placeholder={label}
        {...props}
      />
      <label className="absolute text-gray-500 duration-300 transform -translate-y-4 scale-75 top-5 -z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-4 peer-focus:text-[#E5B300] font-sans text-xs tracking-wider uppercase font-bold">
        {label}
      </label>
      
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-0 top-5 text-[10px] text-gray-500 hover:text-[#E5B300] transition-colors duration-200 font-bold tracking-widest uppercase"
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      )}
    </div>
  );
};

export const PremiumCheckbox = ({ label, ...props }) => (
  <label className="flex items-center cursor-pointer group mt-4 mb-8">
    <div className="relative flex items-center justify-center w-4 h-4 mr-3 border border-gray-600 rounded-sm group-hover:border-[#E5B300] transition-colors duration-300 bg-[#0a0a0a]">
      <input type="checkbox" className="absolute opacity-0 cursor-pointer peer w-full h-full" {...props} />
      {/* The checkmark block */}
      <div className="w-2 h-2 bg-[#E5B300] opacity-0 peer-checked:opacity-100 transition-all duration-200 ease-in-out scale-50 peer-checked:scale-100" />
    </div>
    <span className="text-xs font-sans text-gray-400 group-hover:text-white transition-colors duration-300 tracking-wide">
      {label}
    </span>
  </label>
);

export const ActionButton = ({ children, ...props }) => (
  <button
    className="w-full py-3.5 mt-4 text-black font-bold text-xs sm:text-sm tracking-[0.15em] uppercase bg-[#E5B300] hover:bg-[#ffcc00] rounded hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-10px_rgba(229,179,0,0.5)] transition-all duration-300 ease-out"
    {...props}
  >
    {children}
  </button>
);