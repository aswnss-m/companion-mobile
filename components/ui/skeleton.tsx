import { cn } from '@/lib/utils';
import { View } from 'react-native';

/** Static placeholder (design.md States: loading mirrors the layout, no pulsing). */
function Skeleton({ className, ...props }: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return <View className={cn('bg-paper-3 rounded-md', className)} {...props} />;
}

export { Skeleton };
