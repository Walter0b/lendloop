import mark from "@/assets/logo-mark.svg";
import wide from "@/assets/logo-mark.svg";

type Props = { variant?: "mark" | "wide"; className?: string };

// Cut from assets/logo.svg without the white background. "wide" is the mark beside the LendLoop wordmark.
export function Logo({ variant = "mark", className }: Props) {
  const file = variant === "wide" ? wide : mark;
  return <img src={file.src} width={file.width} height={file.height} alt="LendLoop" className={className} />;
}
