import * as React from 'react';
import { Text as RNText, TextProps } from 'react-native';

import { cn } from '@/lib/cn';

const Text = React.forwardRef<RNText, TextProps>(({ className, ...props }, ref) => (
  <RNText ref={ref} className={cn('text-neutral-900', className)} {...props} />
));
Text.displayName = 'Text';

export { Text };