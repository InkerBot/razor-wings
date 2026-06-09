import type {ReactNode} from "react";

type ViewAnimation = "forward" | "backward" | "fade" | false;

export function ViewTransition({children}: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-[0] flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}

export function ViewPanel({
                            children,
                            animation = false,
                            className = "",
                          }: {
  children: ReactNode;
  animation?: ViewAnimation;
  className?: string;
}) {
  const animationClass = animation === "forward"
    ? "[animation:slideFromRight_var(--rw-anim-duration,220ms)_cubic-bezier(0.22,0.61,0.36,1)_forwards]"
    : animation === "backward"
      ? "[animation:slideFromLeft_var(--rw-anim-duration,220ms)_cubic-bezier(0.22,0.61,0.36,1)_forwards]"
      : animation === "fade"
        ? "[animation:fadeScaleIn_var(--rw-anim-duration,220ms)_ease_forwards]"
        : "";

  return (
    <div
      className={[
        "flex flex-1 flex-col overflow-x-hidden overflow-y-auto [transition:opacity_var(--rw-anim-duration,220ms)_ease,transform_var(--rw-anim-duration,220ms)_cubic-bezier(0.22,0.61,0.36,1)]",
        animationClass,
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </div>
  );
}
