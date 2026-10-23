import React from "react";

export function AdminFooter() {
  return (
    <footer className="mt-auto py-4 px-6 border-t border-slate-200/80 bg-white text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
      <p>
        Copyright <span className="font-semibold text-slate-700">tag31 test Aug13-2025</span> © 2026 Version:{" "}
        <span className="font-mono text-slate-600">988b14b</span>
      </p>
      <div className="flex items-center space-x-4 text-slate-400">
        <span className="hover:text-slate-600 transition cursor-pointer">Documentation</span>
        <span className="hover:text-slate-600 transition cursor-pointer">Support</span>
      </div>
    </footer>
  );
}
