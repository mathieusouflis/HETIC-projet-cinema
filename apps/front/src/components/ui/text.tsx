interface TextProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  weight?: "regular" | "medium" | "semibold";
  color?: string;
  className?: string;
}

export default function Text({ children, size = "md", weight = "regular", color = "black", className = "" }: TextProps) {
  const sizes = { sm: "text-[12px]", md: "text-[14px]", lg: "text-[16px]" };
  const weights = { regular: "font-normal", medium: "font-medium", semibold: "font-semibold" };
  return <p className={`${sizes[size]} ${weights[weight]} text-[${color}] ${className}`}>{children}</p>;
}