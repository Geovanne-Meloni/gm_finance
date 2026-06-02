import * as React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  View,
} from "react-native";

import { cn } from "@/lib/cn";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
}

const Button = React.forwardRef<View, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      label,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const variants = {
      default: "bg-slate-900",
      destructive: "bg-red-500",
      outline: "border border-slate-200 bg-transparent",
      secondary: "bg-slate-200",
      ghost: "bg-transparent",
      link: "bg-transparent",
    };

    const sizes = {
      default: "px-5 py-3",
      sm: "px-3 py-2",
      lg: "px-8 py-4",
      icon: "p-3",
    };

    const textVariants = {
      default: "text-white font-medium",
      destructive: "text-white font-medium",
      outline: "text-slate-900 font-medium",
      secondary: "text-slate-900 font-medium",
      ghost: "text-slate-900 font-medium",
      link: "text-slate-900 underline font-medium",
    };

    return (
      <TouchableOpacity
        ref={ref as any}
        activeOpacity={0.85}
        disabled={disabled}
        className={cn(
          "flex flex-row items-center justify-center rounded-md",
          variants[variant],
          sizes[size],
          disabled && "opacity-45",
          className,
        )}
        {...props}
      >
        {label ? (
          <Text className={textVariants[variant]}>{label}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  },
);
Button.displayName = "Button";

export { Button };
