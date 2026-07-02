import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "../services/auth.schema";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const { forgotPassword, isPending, error } = useForgotPassword();

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      await forgotPassword(data.email);
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  const errorMessage = error
    ? axios.isAxiosError(error)
      ? error.response?.data?.message || error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong"
    : null;

  return (
    <div className="fixed inset-0 h-screen w-full flex items-center justify-center bg-[#41B3B4] overflow-hidden font-sans">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#64C6C7] rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#64C6C7] rounded-full blur-[120px] opacity-60"></div>
      
      <div className="relative w-full max-w-[480px] px-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-[40px] shadow-2xl p-10 flex flex-col items-center">
          
          {/* Logo */}
          <div className="mb-10 text-[#41B3B4]">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4V20" />
              <path d="M4 12H20" />
              <circle cx="16" cy="8" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <div className="text-center mb-10 w-full">
            <h2 className="text-2xl font-bold text-[#1e293b] leading-tight">
              Reset Password
            </h2>
            <p className="text-[#64748b] text-xs mt-2 font-medium">
              Enter your email address to receive password reset instructions.
            </p>
          </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full space-y-8">
              {errorMessage && (
                <p className="text-center text-red-500 text-xs font-bold">
                  {errorMessage}
                </p>
              )}

              <div className="relative group">
                <label className="absolute -top-6 left-0 text-[10px] font-bold text-slate-400 group-focus-within:text-[#41B3B4] transition-colors uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex items-center border-b-2 border-slate-200 focus-within:border-[#41B3B4] transition-all py-2">
                  <input
                    type="email"
                    {...register("email")}
                    disabled={isPending}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-slate-700 placeholder-slate-300 text-sm py-1 font-sans"
                  />
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="h-[18px] leading-[18px] overflow-hidden mt-1">
                  {errors.email && (
                    <p className="text-[10px] font-bold text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-[#41B3B4] hover:bg-[#369B9C] text-white rounded-xl font-bold text-xs tracking-widest transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 cursor-pointer flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>SEND RESET LINK</span>
                )}
              </button>
            </form>

          <div className="mt-8 text-sm text-slate-500">
            Remember your password?{" "}
            <Link to="/login" className="text-[#41B3B4] font-bold hover:underline">
              Sign In
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
