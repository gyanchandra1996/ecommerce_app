import { Suspense } from "react";
import { CustomerRegisterForm } from "@/modules/auth/components/CustomerRegisterForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Create Account | emox Store",
  description: "Register a customer account with mobile number, address, and postal autofill.",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <CustomerRegisterForm />
    </Suspense>
  );
}
