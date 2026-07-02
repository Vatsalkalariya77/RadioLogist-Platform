import { getInitials } from "../../utils/name";

interface UserAvatarProps {
  name: string;
  className?: string;
}

export default function UserAvatar({ name, className = "" }: UserAvatarProps) {
  console.log("TRACE 10: UserAvatar props name:", name);
  const hasTextColor = className.includes("text-");
  const hasBgColor = className.includes("bg-");
  const hasBorder = className.includes("border-");

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-extrabold text-xs shadow-sm ${
        hasBgColor ? "" : "bg-teal-500/10"
      } ${
        hasTextColor ? "" : "text-teal-600"
      } ${
        hasBorder ? "" : "border border-teal-500/20"
      } ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
