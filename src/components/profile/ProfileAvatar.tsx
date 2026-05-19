import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProfileAvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

export const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  src,
  name,
  size = 'md',
  showStatus = true,
  isOnline = true,
  className
}) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AD';
  };

  const sizeClasses = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm font-semibold',
    lg: 'h-16 w-16 text-xl font-bold',
    xl: 'h-24 w-24 text-3xl font-bold',
    '2xl': 'h-32 w-32 text-4xl font-bold',
  };

  const statusSizeClasses = {
    xs: 'h-1.5 w-1.5 right-0 bottom-0 border-[1px]',
    sm: 'h-2 w-2 right-0 bottom-0 border-[1.5px]',
    md: 'h-3 w-3 right-0.5 bottom-0.5 border-2',
    lg: 'h-4 w-4 right-1 bottom-0.5 border-2',
    xl: 'h-6 w-6 right-2 bottom-1 border-3',
    '2xl': 'h-8 w-8 right-2.5 bottom-1.5 border-4',
  };

  const initials = getInitials(name);

  return (
    <div className={cn("relative inline-block select-none", className)}>
      <div 
        className={cn(
          "rounded-full overflow-hidden flex items-center justify-center border border-gray-100 bg-emerald-50 text-emerald-800 transition-all duration-300 font-sans shadow-inner",
          sizeClasses[size]
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="h-full w-full object-cover transition-opacity duration-300"
            onError={(e) => {
              // Fail-safe if image url is broken
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {showStatus && (
        <span 
          className={cn(
            "absolute rounded-full border-white shadow-sm transition-colors duration-300",
            isOnline ? "bg-emerald-500 animate-pulse" : "bg-gray-400",
            statusSizeClasses[size]
          )}
        >
          {isOnline && (
            <motion.span 
              className="absolute inset-0 rounded-full bg-emerald-500 opacity-75"
              animate={{ scale: [1, 2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
          )}
        </span>
      )}
    </div>
  );
};

export default ProfileAvatar;
