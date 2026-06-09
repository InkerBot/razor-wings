import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import {cn} from "../util/cn";

export function TextInput({
                            className = "",
                            ...props
                          }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn("rw-input", className)}
      {...props}
    />
  );
}

export function Textarea({
                           className = "",
                           ...props
                         }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn("rw-textarea", className)}
      {...props}
    />
  );
}

export function RangeInput({
                             className = "",
                             ...props
                           }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="range"
      className={cn("rw-range", className)}
      {...props}
    />
  );
}

export function Select({
                         className = "",
                         children,
                         ...props
                       }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn("rw-select", className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function InlineLabel({
                              children,
                              className = "",
                              ...props
                            }: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={cn("rw-inline-label", className)}
      {...props}
    >
      {children}
    </label>
  );
}
