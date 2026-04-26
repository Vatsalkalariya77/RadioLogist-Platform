import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../features/auth/hooks/useRegister";
import { registerSchema, type RegisterFormValues } from "../features/auth/auth.schema";
import axios from "axios";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });
  const { register: registerUser, isPending, error } = useRegister();

  const onSubmit = (data: RegisterFormValues) => {
    registerUser(data);
  };

  const errorMessage = error
    ? axios.isAxiosError(error)
      ? error.response?.data?.message || error.message
      : error instanceof Error
        ? error.message
        : "Something went wrong"
    : null;

  return (
    <div className="fixed inset-0 h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-slate-50 via-blue-50 to-teal-50 overflow-hidden">
      {/* Subtle Medical Background Element */}
      <div className="absolute bottom-0 left-0 p-12 opacity-[0.03] pointer-events-none rotate-180">
        <svg width="400" height="400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
        </svg>
      </div>

      <div className="relative w-full max-w-[480px] px-6 animate-in fade-in zoom-in duration-500">
        {/* Glassmorphism Card */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-3xl p-8 md:p-10">

          {/* Header & Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200 mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Create Clinician Account
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-2 text-center">
              Join the professional radiology learning network
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {errorMessage && (
              <div className="bg-red-50/80 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errorMessage}
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  disabled={isPending}
                  placeholder="Dr. Jane Smith"
                  className={`w-full px-4 py-3 bg-white/50 border ${errors.name ? "border-red-400" : "border-slate-200"
                    } rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all duration-200 text-sm placeholder:text-slate-400 disabled:opacity-50`}
                />
                <div className="h-[18px] leading-[18px] overflow-hidden">
                  {errors.name && (
                    <p className="text-[11px] font-bold text-red-500 ml-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 ml-1">
                  Medical Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  disabled={isPending}
                  placeholder="name@radiology.com"
                  className={`w-full px-4 py-3 bg-white/50 border ${errors.email ? "border-red-400" : "border-slate-200"
                    } rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all duration-200 text-sm placeholder:text-slate-400 disabled:opacity-50`}
                />
                <div className="h-[18px] leading-[18px] overflow-hidden">
                  {errors.email && (
                    <p className="text-[11px] font-bold text-red-500 ml-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 ml-1">
                  Secure Password
                </label>
                <input
                  type="password"
                  {...register("password")}
                  disabled={isPending}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-white/50 border ${errors.password ? "border-red-400" : "border-slate-200"
                    } rounded-xl focus:ring-4 focus:ring-teal-100 focus:border-teal-500 outline-none transition-all duration-200 text-sm placeholder:text-slate-400 disabled:opacity-50`}
                />
                <div className="h-[18px] leading-[18px] overflow-hidden">
                  {errors.password && (
                    <p className="text-[11px] font-bold text-red-500 ml-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3.5 px-4 bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-200 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-6 flex justify-center items-center`}
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-[13px] text-slate-500 font-medium">
              Already a member?{" "}
              <Link
                to="/login"
                className="text-teal-600 font-bold hover:text-teal-700 transition-colors underline-offset-4 hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Simple Footer */}
        <p className="text-[11px] text-slate-400 text-center mt-8 font-medium">
          &copy; 2026 RadioLogist Platform. HIPAA Compliant System.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
