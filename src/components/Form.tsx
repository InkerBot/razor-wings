import type {ReactNode} from "react";
import {cn} from "@/util/cn";

export function FormSectionTitle({
                                   children,
                                   className = "",
                                 }: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rw-form-section-title",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function FormField({
                            label,
                            children,
                            controlClassName = "",
                          }: {
  label: ReactNode;
  children: ReactNode;
  controlClassName?: string;
}) {
  return (
    <div className="rw-form-field">
      <label className="rw-form-label">
        {label}
      </label>
      <div className={cn("rw-form-control", controlClassName)}>
        {children}
      </div>
    </div>
  );
}
