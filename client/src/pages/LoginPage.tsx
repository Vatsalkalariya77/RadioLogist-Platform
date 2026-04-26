import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../features/auth/hooks/useLogin";
import { loginSchema, type LoginFormValues } from "../features/auth/auth.schema";
import axios from "axios";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const { login, isPending, error } = useLogin();

  const onSubmit = (data: LoginFormValues) => {
    login(data);
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
      {/* --- BACKGROUND ELEMENTS --- */}

      {/* Blurred glow shapes */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#64C6C7] rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#64C6C7] rounded-full blur-[120px] opacity-60"></div>
      <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-[#81D4D5] rounded-full blur-[100px] opacity-40"></div>

      {/* Floating Medical Icons */}
      {/* DNA Icon */}
      <div className="absolute left-[15%] top-[40%] w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg animate-pulse">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.7 18.1 L19.3 5.9" />
          <path d="M4.7 5.9 L19.3 18.1" />
          <path d="M9.2 14.3 L14.8 9.7" />
          <path d="M9.2 9.7 L14.8 14.3" />
          <circle cx="4.7" cy="5.9" r="2" fill="white" />
          <circle cx="19.3" cy="5.9" r="2" fill="white" />
          <circle cx="4.7" cy="18.1" r="2" fill="white" />
          <circle cx="19.3" cy="18.1" r="2" fill="white" />
        </svg>
      </div>

      {/* Heartbeat Icon */}
      <div className="absolute left-[40%] top-[10%] w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>

      {/* Stethoscope Icon */}
      <div className="absolute right-[15%] bottom-[30%] w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.8 2.3 C4.8 2.3 4.8 10 4.8 10 C4.8 13.9 7.9 17 11.8 17 C15.7 17 18.8 13.9 18.8 10 C18.8 10 18.8 2.3 18.8 2.3" />
          <circle cx="11.8" cy="19.5" r="2.5" />
          <path d="M11.8 17 V22" />
          <circle cx="4.8" cy="2.3" r="1.5" />
          <circle cx="18.8" cy="2.3" r="1.5" />
        </svg>
      </div>

      {/* EKG Heartbeat Line at bottom */}
      <div className="absolute bottom-[10%] left-0 w-full opacity-40 pointer-events-none">
        <svg width="100%" height="150" viewBox="0 0 1000 150" preserveAspectRatio="none">
          <path
            d="M0,75 L300,75 L320,40 L340,110 L360,20 L380,130 L400,75 L700,75 L720,10 L740,140 L760,75 L1000,75"
            fill="none"
            stroke="white"
            strokeWidth="3"
          />
        </svg>
      </div>

      {/* --- LOGIN CARD --- */}
      <div className="relative w-full max-w-[480px] px-6">
        <div className="bg-white/95 backdrop-blur-sm rounded-[40px] shadow-2xl p-10 flex flex-col items-center">

          {/* Medical Cross Logo */}
          <div className="mb-10 text-[#41B3B4]">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 4V20" />
              <path d="M4 12H20" />
              <circle cx="16" cy="8" r="1.5" fill="currentColor" />
            </svg>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-[32px] font-bold text-[#1e293b] leading-tight">
              Welcome Back!
            </h2>
            <p className="text-[#64748b] text-sm mt-2 font-medium">
              Login to continue to your account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full space-y-10">
            {errorMessage && (
              <p className="text-center text-red-500 text-xs font-bold -mt-6">
                {errorMessage}
              </p>
            )}

            <div className="space-y-10">
              {/* Email Field */}
              <div className="relative group">
                <label className="absolute -top-6 left-0 text-[11px] font-bold text-[#41B3B4] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex items-center border-b-2 border-gray-200 focus-within:border-[#41B3B4] transition-all py-2">
                  <input
                    type="email"
                    {...register("email")}
                    disabled={isPending}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-300 text-sm py-1"
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

              {/* Password Field */}
              <div className="relative group">
                <label className="absolute -top-6 left-0 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <div className="flex items-center border-b-2 border-gray-200 focus-within:border-[#41B3B4] transition-all py-2">
                  <input
                    type="password"
                    {...register("password")}
                    disabled={isPending}
                    placeholder="••••••••"
                    className="w-full bg-transparent outline-none text-slate-700 placeholder-slate-300 text-sm py-1"
                  />
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <div className="flex justify-end mt-2">
                  <button type="button" className="text-[10px] font-bold text-[#41B3B4] hover:opacity-80 transition-opacity">
                    Forgot Password?
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
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-4 bg-[#41B3B4] hover:bg-[#369B9C] text-white rounded-xl font-bold text-sm tracking-widest transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 mt-4"
            >
              {isPending ? "PROCESSING..." : "SIGN IN"}
            </button>
          </form>

          <div className="mt-12 text-sm text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-[#41B3B4] font-bold hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
