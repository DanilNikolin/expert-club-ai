// src/components/ui/Tooltip.tsx
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type Position =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-bottom';

type TooltipProps = {
  content: string;
  children?: React.ReactNode;
  initialPosition?: Position;
};

export default function Tooltip({
  content,
  children,
  initialPosition = 'top',
}: TooltipProps) {
  const [show, setShow] = useState(false);
  const [actualPosition, setActualPosition] = useState<Position>(initialPosition);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 150);
  };

  const calculatePosition = useCallback(() => {
    if (!show || !tooltipRef.current || !targetRef.current) return;

    // Фиксируем составную позицию без попыток "умного" пересчёта
    if (initialPosition.includes('-')) {
      setActualPosition(initialPosition);
      return;
    }

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const targetRect = targetRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 16;

    let bestPosition: Position = initialPosition;
    let canFit = false;

    const positionsToTry: Position[] = ['top', 'bottom', 'left', 'right'];
    if (initialPosition === 'left' || initialPosition === 'right') {
      const other: Position = initialPosition === 'left' ? 'right' : 'left';
      positionsToTry.unshift(initialPosition);
      positionsToTry.push(other);
    }

    for (const pos of positionsToTry) {
      let fits = false;
      if (pos === 'top') {
        fits = targetRect.top - tooltipRect.height > padding;
      } else if (pos === 'bottom') {
        fits = targetRect.bottom + tooltipRect.height < viewportHeight - padding;
      } else if (pos === 'left') {
        fits = targetRect.left - tooltipRect.width > padding;
      } else if (pos === 'right') {
        fits = targetRect.right + tooltipRect.width < viewportWidth - padding;
      }
      if (fits) {
        bestPosition = pos;
        canFit = true;
        break;
      }
    }

    if (!canFit) {
      bestPosition = initialPosition;
    }

    setActualPosition(bestPosition);
  }, [show, initialPosition]);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(calculatePosition, 50);
      return () => clearTimeout(timer);
    }
  }, [show, calculatePosition]);

  useEffect(() => {
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);
    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [calculatePosition]);

  const baseClasses =
    'absolute z-50 px-3 py-2 text-sm font-sans text-text-main bg-bg-main rounded-lg shadow-xl border border-bg-surface/50 opacity-0 animate-fade-in whitespace-normal';

  const positionClasses: Record<Position, string> = {
    top: 'left-1/2 -translate-x-1/2 bottom-full mb-2',
    'top-left': 'left-0 bottom-full mb-2',
    'top-right': 'right-0 bottom-full mb-2',
    bottom: 'left-1/2 -translate-x-1/2 top-full mt-2',
    'bottom-left': 'left-0 top-full mt-2',
    'bottom-right': 'right-0 top-full mt-2',
    left: 'top-1/2 -translate-y-1/2 right-full mr-2',
    'left-top': 'top-0 right-full mr-2',
    'left-bottom': 'bottom-0 right-full mr-2',
    right: 'top-1/2 -translate-y-1/2 left-full ml-2',
    'right-top': 'top-0 left-full ml-2',
    'right-bottom': 'bottom-0 left-full ml-2',
  };

  const getTooltipWidth = () => {
    const len = content.length;
    if (len < 50) return 'w-48';
    if (len < 100) return 'w-64';
    if (len < 200) return 'w-80';
    return 'w-96';
  };

  return (
    <div
      ref={targetRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children ?? <Info size={16} className="text-text-secondary cursor-help ml-2 hover:text-accent-primary transition-colors" />}
      {show && (
        <div
          ref={tooltipRef}
          className={cn(baseClasses, positionClasses[actualPosition], getTooltipWidth(), 'leading-relaxed')}
          style={{ animationDuration: '0.2s' }}
        >
          {content}
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
