"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger
const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> & { container?: Element | null }
>(
  (
    {
      className,
      align = "start",
      side = "bottom",
      sideOffset = 0,
      container,
      ...props
    },
    ref
  ) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        avoidCollisions={true}
        collisionPadding={8}
        // @ts-ignore
        container={container}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-2 text-popover-foreground shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[side=bottom]:slide-in-from-top-2",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
)

PopoverContent.displayName = "PopoverContent"

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor
}
