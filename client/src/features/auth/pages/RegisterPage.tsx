import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../hooks/useRegister";
import { registerSchema, type RegisterFormValues } from "../services/auth.schema";
import axios from "axios";
import { Link } from "react-router-dom";

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans text-slate-600 antialiased">
      {/* --- Left Panel: Branding & Value Proposition (Large Screens Only) --- */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950 p-16 text-white relative overflow-hidden">
        {/* Neon Blob Animations */}
        <div className="absolute top-1/4 -left-12 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl animate-blob" />
        <div className="absolute bottom-1/4 -right-12 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-blob [animation-delay:2s]" />

        {/* Brand Logo & Header */}
        <div className="flex items-center gap-3.5 relative z-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 text-white shadow-lg shadow-teal-500/25">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4V20" />
              <path d="M4 12H20" />
              <circle cx="16" cy="8" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-slate-100 to-teal-300 bg-clip-text text-transparent">
              RadioLogist
            </span>
            <p className="text-[10px] font-bold text-teal-400/80 tracking-widest uppercase">
              Platform
            </p>
          </div>
        </div>

        {/* Main Content & Benefits List */}
        <div className="my-auto space-y-12 relative z-10 max-w-lg">
          <div className="space-y-4.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3.5 py-1 text-[10px] font-bold text-teal-300 border border-teal-500/20 uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-ping" />
              Clinical Onboarding
            </span>
            <h2 className="text-4xl font-extrabold tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-teal-100 bg-clip-text text-transparent">
              Elevate Radiology Training & Diagnostics
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Join a modern diagnostic network designed for healthcare professionals. Create structured cases, collaborate with peers, and assess clinical skills.
            </p>
          </div>

          {/* Benefits Checkmarks */}
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Create & Manage Cases</h4>
                <p className="text-xs text-slate-400 mt-1">Publish training cases with modalities, structured descriptions, and interactive assessments.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Collaborate with Clinicians</h4>
                <p className="text-xs text-slate-400 mt-1">Connect students, instructors, and specialists through real-time commenting and reviews.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Structured Assessments</h4>
                <p className="text-xs text-slate-400 mt-1">Design multiple-choice questionnaires with scoring metrics and instant learning feedback.</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Left Panel Footer */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/80 pt-6 relative z-10">
          <span>&copy; 2026 RadioLogist Platform</span>
          <span className="flex items-center gap-1.5 text-teal-500 font-semibold bg-teal-950/40 border border-teal-900/60 rounded-full px-3 py-1">
            <svg className="h-3 w-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 11.388a.75.75 0 011.096-.188 12.02 12.02 0 0013.476 0 .75.75 0 01.91 1.196 13.52 13.52 0 01-16.57 0 .75.75 0 01-.91-1.008z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M10 3a7 7 0 100 14 7 7 0 000-14zm-1.5 5.25a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5zm3.75 0a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clipRule="evenodd" />
            </svg>
            HIPAA Compliant System
          </span>
        </div>
      </div>

      {/* --- Right Panel: Create Account Form --- */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 bg-slate-50 min-h-screen">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="flex items-center gap-3 lg:hidden mb-10 self-start">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-blue-500 text-white shadow-lg shadow-teal-500/25">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4V20" />
              <path d="M4 12H20" />
              <circle cx="16" cy="8" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <div>
            <span className="text-md font-extrabold tracking-wider text-slate-800">
              RadioLogist
            </span>
            <p className="text-[8px] font-bold text-teal-600 tracking-widest uppercase">
              Platform
            </p>
          </div>
        </div>

        {/* Clean Onboarding Card */}
        <div className="w-full max-w-[460px] bg-white border border-slate-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-3xl p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              Create Clinician Account
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Get started with your medical credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="truncate">{errorMessage}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  {...register("name")}
                  disabled={isPending}
                  placeholder="Dr. Jane Smith"
                  className={`input-standard bg-slate-50/50 hover:bg-slate-100/30 transition-colors focus:bg-white ${errors.name ? "border-rose-300 focus:border-rose-500 focus:ring-rose-50/50 bg-rose-50/10" : ""}`}
                />
                <div className="h-[18px] leading-[18px] overflow-hidden mt-0.5">
                  {errors.name && (
                    <p className="text-[10px] font-bold text-rose-500 ml-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Medical Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  disabled={isPending}
                  placeholder="name@radiology.com"
                  className={`input-standard bg-slate-50/50 hover:bg-slate-100/30 transition-colors focus:bg-white ${errors.email ? "border-rose-300 focus:border-rose-500 focus:ring-rose-50/50 bg-rose-50/10" : ""}`}
                />
                <div className="h-[18px] leading-[18px] overflow-hidden mt-0.5">
                  {errors.email && (
                    <p className="text-[10px] font-bold text-rose-500 ml-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                  Secure Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    disabled={isPending}
                    placeholder="••••••••"
                    className={`input-standard bg-slate-50/50 hover:bg-slate-100/30 transition-colors focus:bg-white pr-10 ${errors.password ? "border-rose-300 focus:border-rose-500 focus:ring-rose-50/50 bg-rose-50/10" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-teal-600 transition-colors focus:outline-none cursor-pointer flex items-center justify-center"
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
                <div className="h-[18px] leading-[18px] overflow-hidden mt-0.5">
                  {errors.password && (
                    <p className="text-[10px] font-bold text-rose-500 ml-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="btn-primary w-full py-3.5 mt-6 cursor-pointer"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Links */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-xs text-slate-500 font-medium">
              Already a member?{" "}
              <Link
                to="/login"
                className="text-teal-600 font-bold hover:text-teal-700 transition-colors underline-offset-4 hover:underline cursor-pointer"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        {/* Mobile Footer (Hidden on Desktop) */}
        <p className="text-[11px] text-slate-400 text-center mt-8 font-medium lg:hidden">
          &copy; 2026 RadioLogist Platform. HIPAA Compliant.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
