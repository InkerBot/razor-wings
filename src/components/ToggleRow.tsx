import type {InputHTMLAttributes, ReactNode} from "react";
import {cn} from "../util/cn";

interface ToggleRowProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "children" | "onChange"> {
  children: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  card?: boolean;
  padding?: "normal" | "none";
  className?: string;
}

export default function ToggleRow({
                                    children,
                                    checked,
                                    onChange,
                                    card = false,
                                    padding = "normal",
                                    className = "",
                                    ...inputProps
                                  }: ToggleRowProps) {
  return (
    <label
      className={cn(
        "rw-toggle-row",
        padding === "normal" && "rw-toggle-row--normal",
        card && "rw-toggle-row--card",
        className,
      )}
    >
      <span>{children}</span>
      <span className="rw-toggle-shell">
        <input
          {...inputProps}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          className="rw-toggle-input"
        />
        <span className="rw-toggle-track"/>
      </span>
    </label>
  );
}

export function ToggleRowGroup({children}: { children: ReactNode }) {
  return (
    <div className="rw-toggle-group">
      {children}
    </div>
  );
}
