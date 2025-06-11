"use client";

import { ReactNode, useState, useEffect } from "react";

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };

    updateTime(); // Set time immediately on mount
    const intervalId = setInterval(updateTime, 60 * 1000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
        <div className="bg-black rounded-[2.5rem] p-1">
          <div className="bg-background rounded-[2rem] overflow-hidden shadow-inner">
            {/* Status Bar */}
            <div className="h-11 bg-background/95 backdrop-blur-sm border-b border-border/30 flex items-center justify-between px-6 text-sm font-medium">
              <span>{currentTime}</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                <span>100%</span>
              </div>
            </div>

            {/* Instagram Header */}
            <div className="h-14 border-b border-border/30 flex items-center justify-center bg-background/95 backdrop-blur-sm">
              <h2 className="font-semibold text-lg">Your Profile</h2>
            </div>

            {/* Grid Content */}
            <div className="h-[calc(100%-4rem)] overflow-y-auto">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 