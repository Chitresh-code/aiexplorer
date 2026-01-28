"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";

type AutoTextareaProps = React.ComponentPropsWithoutRef<typeof Textarea>;

export const AutoTextarea = React.forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ value, onChange, ...props }, ref) => {
    const innerRef = React.useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const resize = () => {
      if (!innerRef.current) return;
      innerRef.current.style.height = "auto";
      innerRef.current.style.height = `${innerRef.current.scrollHeight}px`;
    };

    React.useLayoutEffect(() => {
      resize();
    }, [value]);

    return (
      <Textarea
        ref={setRefs}
        value={value}
        onChange={onChange}
        {...props}
      />
    );
  },
);

AutoTextarea.displayName = "AutoTextarea";
