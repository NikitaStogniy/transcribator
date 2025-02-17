interface IconProps {
  path: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "icon-sm",
  md: "icon-md",
  lg: "icon-lg",
};

export default function Icon({ path, size = "md", className = "" }: IconProps) {
  return (
    <svg
      className={`icon ${sizeMap[size]} ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d={path}
      />
    </svg>
  );
}

// Add styles to your global CSS file:
/*
.icon {
  display: inline-block;
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.icon-md {
  width: 20px;
  height: 20px;
}

.icon-lg {
  width: 24px;
  height: 24px;
}
*/
