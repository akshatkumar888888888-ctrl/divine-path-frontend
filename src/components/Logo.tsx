import React from 'react';

interface LogoProps {
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 100 100" 
      className={className}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hand-drawn bubbly circle background */}
      <path 
        d="M92 50C92 73.1959 73.1959 92 50 92C26.8041 92 8 73.1959 8 50C8 26.8041 26.8041 8 50 8C73.1959 8 92 26.8041 92 50Z" 
        fill="#00CBD6" 
        stroke="black" 
        strokeWidth="4"
        strokeLinejoin="round"
      />
      
      {/* Atomic Orbital doodle */}
      <ellipse 
        cx="50" cy="50" rx="40" ry="15" 
        stroke="black" 
        strokeWidth="3" 
        className="rotate-[45deg] origin-center opacity-30" 
      />
      
      {/* Bubbly S */}
      <path 
        d="M60 35C60 30 55 28 50 28C45 28 40 30 40 35C40 40 55 42 55 50C55 58 45 62 38 60" 
        stroke="white" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M60 35C60 30 55 28 50 28C45 28 40 30 40 35C40 40 55 42 55 50C55 58 45 62 38 60" 
        stroke="black" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Bubbly N */}
      <path 
        d="M45 72V45L65 72V45" 
        stroke="white" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path 
        d="M45 72V45L65 72V45" 
        stroke="black" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />

      {/* Shine Doodle */}
      <path 
        d="M30 20C30 20 32 15 35 15" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
    </svg>
  );
};
