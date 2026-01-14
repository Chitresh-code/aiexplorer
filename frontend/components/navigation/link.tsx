'use client';

import React from 'react';
import { useNavigate } from '../../hooks/use-navigate';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  state?: unknown;
  children: React.ReactNode;
}

export const Link: React.FC<LinkProps> = ({ href, state, children, ...props }) => {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigate(href, { state });
  };

  return (
    <a href={href} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
