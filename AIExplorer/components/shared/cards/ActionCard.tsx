import type { ComponentType } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number }>;

interface ActionCardProps {
  icon: IconComponent;
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  className?: string;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
  className,
}: ActionCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        'group relative flex h-full flex-col justify-between overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[clamp(1.002,0.5vw,1.01)] min-h-[180px]',
        onClick && 'cursor-pointer',
        className
      )}
    >
      <div className={`absolute right-[-20%] top-[-20%] h-[clamp(5rem,15vw,7rem)] w-[clamp(5rem,15vw,7rem)] rounded-full bg-[#d4e000]/10 opacity-50 blur-3xl transition-all duration-500 group-hover:scale-125`} />

      <CardHeader className="relative space-y-[clamp(1.25rem,2.5vw,1.5rem)] pb-[clamp(1rem,2.5vw,1.25rem)] pt-[clamp(1.5rem,3.5vw,2rem)]">
        <div className={`inline-flex h-[clamp(3.5rem,6vw,4rem)] w-[clamp(3.5rem,6vw,4rem)] items-center justify-center rounded-xl bg-[#d4e000]/10 text-gray-800 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-[#d4e000]/20`}>
          <Icon size={32} strokeWidth={1.5} />
        </div>
        <CardTitle className="text-[clamp(1.25rem,2.5vw,1.375rem)] font-bold text-gray-900 leading-tight">{title}</CardTitle>
        <CardDescription className="text-[clamp(1rem,2vw,1.125rem)] text-gray-600 leading-relaxed">{description}</CardDescription>
      </CardHeader>
      {buttonText && (
        <CardFooter className="relative pt-0 pb-[clamp(1.5rem,3.5vw,2rem)] px-[clamp(1rem,2vw,1.5rem)]">
          <Button
            variant="default"
            className="w-full bg-gradient-to-r from-[#d4e000] to-[#c0cc00] text-gray-900 hover:from-[#c0cc00] hover:to-[#a8b800] shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[clamp(1.002,0.5vw,1.01)] font-semibold py-[clamp(0.625rem,1.5vw,0.75rem)] text-[clamp(1rem,2vw,1.125rem)]"
          >
            {buttonText}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
