import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChangePassword } from "../hooks/useChangePassword";
import { changePasswordSchema, type ChangePasswordFormValues } from "../services/auth.schema";
import PageHeader from "../../../components/common/PageHeader";
import axios from "axios";

export default function ChangePasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const { changePassword, isPending, error } = useChangePassword();

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
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
    <div className="space-y-6 max-w-lg mx-auto">
      <PageHeader
        title="Change Password"
        description="Update your account credentials to keep your profile secure."
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Current Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("currentPassword")}
              disabled={isPending}
              placeholder="••••••••"
              className={`input-standard ${errors.currentPassword ? "border-rose-350 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10" : ""}`}
            />
            {errors.currentPassword && (
              <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("newPassword")}
              disabled={isPending}
              placeholder="••••••••"
              className={`input-standard ${errors.newPassword ? "border-rose-350 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10" : ""}`}
            />
            {errors.newPassword && (
              <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Confirm New Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              disabled={isPending}
              placeholder="••••••••"
              className={`input-standard ${errors.confirmPassword ? "border-rose-350 focus:border-rose-500 focus:ring-rose-500/10 bg-rose-50/10" : ""}`}
            />
            {errors.confirmPassword && (
              <p className="text-[10px] font-bold text-rose-500 mt-1 ml-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Show Passwords Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="show-passwords"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer h-4 w-4"
            />
            <label htmlFor="show-passwords" className="text-xs font-medium text-slate-500 select-none cursor-pointer">
              Show Passwords
            </label>
          </div>

          {/* Action buttons */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full btn-primary py-3 px-4 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            {isPending && (
              <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            <span>{isPending ? "Updating..." : "UPDATE PASSWORD"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
