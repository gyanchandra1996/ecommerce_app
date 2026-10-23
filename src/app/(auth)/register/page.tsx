import { Suspense } from "react";
import { RegisterForm } from "@/modules/auth/components/RegisterForm";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Register Account | Tagateway E-Commerce",
  description: "Create an administrator or store manager account",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
