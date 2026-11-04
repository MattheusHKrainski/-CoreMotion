import React, { useId } from 'react';

interface BrandMarkProps {
  className?: string;
}

export default function BrandMark({ className = 'w-9 h-9' }: BrandMarkProps) {
  const gradId = useId();

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={`${className} shrink-0 drop-shadow-md`}
    >
      <defs>
        <linearGradient id={gradId} x1="12%" y1="12%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#12141b" />
          <stop offset="35%" stopColor="#2b1015" />
          <stop offset="66%" stopColor="#9e0d12" />
          <stop offset="100%" stopColor="#ef0000" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="24"
        fill={`url(#${gradId})`}
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="2"
      />
      <path
        d="M 65.4 33.3 A 18.5 22.5 0 1 0 65.4 66.7"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="11.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
