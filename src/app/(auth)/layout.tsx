import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Subtle modern background blur circles */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl" />
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}
