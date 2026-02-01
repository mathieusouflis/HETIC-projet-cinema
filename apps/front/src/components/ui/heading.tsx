interface HeadingProps {
  children: React.ReactNode;
  size?: "xl" | "lg";
  className?: string;
}

export default function Heading({ children, size = "xl", className = "" }: HeadingProps) {
  const base = "font-Inter font-bold";
  const sizes = {
    xl: "text-[24px]",
    lg: "text-[20px]",
  };
  return <h1 className={`${base} ${sizes[size]} ${className}`}>{children}</h1>;
}