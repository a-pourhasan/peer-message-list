import React, { useRef, useState, useMemo, useCallback } from 'react';
import type { Message } from '../core/messageIndex';

interface Props {
  items: readonly Message[];
  itemHeight?: number;
  viewportHeight?: number;
}

export const VirtualizedList: React.FC<Props> = ({
  items,
  itemHeight = 44,
  viewportHeight = 520,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  const totalHeight = items.length * itemHeight;

  const { startIndex, endIndex, offsetY } = useMemo(() => {
    const buffer = 5;
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + buffer * 2;
    const end = Math.min(items.length, start + visibleCount);
    const offset = start * itemHeight;
    return { startIndex: start, endIndex: end, offsetY: offset };
  }, [scrollTop, items.length, itemHeight, viewportHeight]);

  const visibleItems = useMemo(
    () => items.slice(startIndex, endIndex),
    [items, startIndex, endIndex],
  );

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        height: viewportHeight,
        overflowY: 'auto',
        position: 'relative',
        border: '1px solid #334155',
        borderRadius: 8,
        background: '#0f172a',
      }}
    >
      <div style={{ height: totalHeight, width: '100%', position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
          }}
        >
          {visibleItems.map((m) => (
            <div
              key={m.id}
              style={{
                height: itemHeight,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #1e293b',
                color: '#e2e8f0',
                fontSize: '0.875rem',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span style={{ color: '#38bdf8', fontWeight: 600 }}>
                  {m.peer}
                </span>
                <span>{m.text}</span>
              </div>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                {new Date(m.ts).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
