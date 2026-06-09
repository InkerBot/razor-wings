import type {ButtonHTMLAttributes, ReactNode} from "react";
import {cn} from "../util/cn";

type ButtonVariant = "default" | "primary" | "secondary" | "danger";
type ButtonSize = "default" | "small";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export default function Button({
                                 variant = "default",
                                 size = "default",
                                 className = "",
                                 children,
                                 ...props
                               }: ButtonProps) {
  return (
    <button
      className={cn(
        "rw-button",
        variant !== "default" && `rw-button--${variant}`,
        size === "small" && "rw-button--small",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
