import { Suspense } from "react";
import { LoginForm } from "@/modules/auth/components/LoginForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Customer Sign In | G-Store Online Shopping",
  description: "Sign in to your customer account on G-Store to track orders and manage addresses.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
