import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "../hooks/useResetPassword";
import { resetPasswordSchema, type ResetPasswordFormValues } from "../services/auth.schema";
import axios from "axios";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const { resetPassword, isPending, error } = useResetPassword();

  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      await resetPassword({
        token,
        password: data.password,
      });
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
              Create New Password
            </h2>
            <p className="text-[#64748b] text-xs mt-2 font-medium">
              Specify your new secure credentials below.
            </p>
          </div>

          {!token ? (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 p-4 rounded-2xl text-xs font-semibold text-center w-full">
              Invalid Request. No reset token was found in the URL.
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full space-y-6">
              {errorMessage && (
                <p className="text-center text-red-500 text-xs font-bold">
                  {errorMessage}
                </p>
              )}

              {/* Password */}
              <div className="relative group">
                <label className="absolute -top-6 left-0 text-[10px] font-bold text-slate-400 group-focus-within:text-[#41B3B4] transition-colors uppercase tracking-wider">
                  New Password
                </label>
                <div className="flex items-center border-b-2 border-slate-200 focus-within:border-[#41B3B4] transition-all py-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    disabled={isPending}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-slate-700 placeholder-slate-300 text-sm py-1 font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-[#41B3B4] transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="h-[18px] leading-[18px] overflow-hidden mt-1">
                  {errors.password && (
                    <p className="text-[10px] font-bold text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <label className="absolute -top-6 left-0 text-[10px] font-bold text-slate-400 group-focus-within:text-[#41B3B4] transition-colors uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="flex items-center border-b-2 border-slate-200 focus-within:border-[#41B3B4] transition-all py-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    disabled={isPending}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-0 outline-none focus:ring-0 text-slate-700 placeholder-slate-300 text-sm py-1 font-sans"
                  />
                </div>
                <div className="h-[18px] leading-[18px] overflow-hidden mt-1">
                  {errors.confirmPassword && (
                    <p className="text-[10px] font-bold text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-4 bg-[#41B3B4] hover:bg-[#369B9C] text-white rounded-xl font-bold text-xs tracking-widest transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 cursor-pointer mt-4 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>RESET PASSWORD</span>
                )}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
