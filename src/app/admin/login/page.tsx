import { Suspense } from "react";
import { AdminLoginForm } from "@/modules/auth/components/AdminLoginForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Admin Login | Tagateway Enterprise Portal",
  description: "Secure administrator sign-in console for store managers and staff",
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <Suspense
        fallback={
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
          </div>
        }
      >
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
