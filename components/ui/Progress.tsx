import * as React from 'react';
import { View, ViewProps } from 'react-native';

interface ProgressProps extends ViewProps {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<View, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <View
        ref={ref}
        className={`relative h-4 w-full overflow-hidden rounded-full bg-neutral-100 ${className}`}
        {...props}
      >
        <View
          className={`h-full bg-neutral-900 transition-all ${indicatorClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </View>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };