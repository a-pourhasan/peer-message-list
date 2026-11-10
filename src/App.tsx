import React, { useEffect, useMemo, Profiler, useState } from 'react';
import { messageStore, useMessages } from './store/useMessages';
import { VirtualizedList } from './components/VirtualizedList';
import { SimulatedP2PTransport } from './core/transport';

export default function App() {
  const items = useMessages((s) => s.items);
  const stats = useMessages((s) => s.stats);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastRenderDuration, setLastRenderDuration] = useState<number>(0);

  const transport = useMemo(() => new SimulatedP2PTransport(), []);

  useEffect(() => {
    if (isStreaming) {
      transport.connect((msg) => messageStore.getState().push(msg));
    } else {
      transport.disconnect();
    }
    return () => transport.disconnect();
  }, [isStreaming, transport]);

  const handleProfilerCallback = (
    _id: string,
    _phase: string,
    actualDuration: number,
  ) => {
    setLastRenderDuration(Number(actualDuration.toFixed(2)));
  };

  const handleBulkLoad = (count: number) => {
    const { push } = messageStore.getState();
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      push({
        id: `bulk_${i}`,
        peer: 'node_seeder',
        ts: now + (count - i),
        text: `Batch payload #${i}`,
      });
    }
  };

  return (
    <div
      style={{
        maxWidth: 860,
        margin: '24px auto',
        fontFamily: 'system-ui, sans-serif',
        padding: 16,
      }}
    >
      <header
        style={{
          marginBottom: 20,
          borderBottom: '1px solid #e2e8f0',
          paddingBottom: 12,
        }}
      >
        <h2 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>
          P2P Event Stream & Indexer
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
          Deterministic deduplication, timestamp sorting, rAF state batching,
          and virtual rendering.
        </p>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { label: 'Received Events', value: stats.received },
          { label: 'Indexed (Unique)', value: stats.unique },
          { label: 'Dropped Duplicates', value: stats.received - stats.unique },
          { label: 'Render Duration', value: `${lastRenderDuration} ms` },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              padding: 12,
              background: '#f8fafc',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {card.label}
            </div>
            <div
              style={{
                fontSize: '1.2rem',
                fontWeight: 'bold',
                color: '#0f172a',
                marginTop: 4,
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setIsStreaming(!isStreaming)}
          style={{
            padding: '8px 14px',
            backgroundColor: isStreaming ? '#ef4444' : '#0284c7',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {isStreaming ? 'Stop Stream' : 'Start P2P Stream'}
        </button>

        <button
          onClick={() => handleBulkLoad(5000)}
          style={{
            padding: '8px 14px',
            background: '#334155',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Push 5,000 Out-of-Order
        </button>

        <button
          onClick={() => messageStore.getState().clear()}
          style={{
            padding: '8px 14px',
            background: '#f1f5f9',
            color: '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </div>

      <Profiler id="VirtualizedFeed" onRender={handleProfilerCallback}>
        <VirtualizedList items={items} itemHeight={40} viewportHeight={480} />
      </Profiler>
    </div>
  );
}
