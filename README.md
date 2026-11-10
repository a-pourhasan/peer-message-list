# Peer Message List

A high-performance, decentralized event log engineered for peer-to-peer (P2P) desktop environments. Designed to ingest, deduplicate, and render thousands of concurrent, out-of-order event packets at 60 FPS with deterministic ordering and bounded memory consumption.

Built as an exploration of UI architecture patterns for real-time, serverless collaboration platforms (e.g., Holepunch / Pear Runtime / Keet Desktop).

---

## Architecture Overview

In distributed P2P topologies, nodes broadcast data across unpredictable network hops, clock skews, and intermittent reconnections. Standard front-end architectures that re-render upon receiving every incoming packet collapse under high message volumes.

This project decouples data ingestion, indexing, and rendering into distinct layers:

```
[ P2P Transport / WebSocket / Stream ]
                 │
                 ▼
     [ Ingestion Buffer Queue ]
                 │
                 ▼ (requestAnimationFrame / Scheduled Flush)
      [ Core Inverted Index ] ─── Deduplication (Set<string>) & Binary-Insert Sorting
                 │
                 ▼
       [ Zustand State Store ] ─── Immutable State Snapshots (O(1) reference comparison)
                 │
                 ▼
      [ Virtualized Viewport ] ─── Constant DOM Footprint (~15-25 nodes for 10,000+ items)
```

---

## Core Technical Highlights

### 1. Deterministic Ingestion & Deduplication (`src/core/messageIndex.ts`)

- **Deduplication:** Utilizes an in-memory `Set` lookup achieving $O(1)$ duplicate rejection before modifying state arrays.
- **Order-Invariance:** Inserts packets using a binary search algorithm based on event timestamp (`ts`), guaranteeing consistent chronologic ordering regardless of network arrival delays.
- **Telemetry Counters:** Tracks total packets received, unique indexed items, and dropped duplicates in constant time.

### 2. State Batching with rAF (`src/store/messageStore.ts`)

- Avoids micro-task starvation and layout thrashing by buffering incoming stream messages in an unreactive queue.
- Flushes mutations to the reactive state exactly once per display refresh cycle via `requestAnimationFrame`.
- Enforces strict immutability upon flush (`items.slice()`), ensuring React shallow comparisons trigger memoized updates reliably.

### 3. Windowed Virtualization (`src/components/VirtualizedList.tsx`)

- Custom viewport virtualization engine with dynamic scroll offset calculations.
- Restricts live DOM elements to only visible rows plus a small overscan buffer (5 rows), keeping memory usage and rendering times flat ($\approx 0.5\text{ ms}$) whether processing 50 or 50,000 records.

### 4. Decoupled Transport Layer (`src/core/transport.ts`)

- Abstract `Transport` interface allowing zero-overhead swapping between simulated packet seeders, WebSockets, or live P2P gossip protocols.

---

## Performance Benchmark

Measured via standard React `Profiler` on an ingested stream under concurrent load:

| Scenario              |      Ingestion Volume      | Indexed Unique |      Duplicate Rejection       |   Avg. Render Time   |   UI Responsiveness    |
| :-------------------- | :------------------------: | :------------: | :----------------------------: | :------------------: | :--------------------: |
| **Burst Stress Test** | 5,000 items (out of order) |     5,000      |               0                | **~0.5 ms - 1.2 ms** | 60 FPS (Zero blocking) |
| **P2P Live Stream**   | Continuous (~40 pkts/sec)  |    Dynamic     | ~5% network duplicates dropped |     **~0.4 ms**      |    Smooth Scrolling    |

---

## Project Structure

```text
peer-message-list/
├── .github/
│   └── workflows/ci.yml       # Automated CI test & build pipeline
├── src/
│   ├── components/
│   │   └── VirtualizedList.tsx# Windowed list rendering component
│   ├── core/
│   │   ├── messageIndex.ts    # Deduplication and timestamp-sorted indexing
│   │   ├── messageIndex.test.ts # Unit tests for index operations
│   │   └── transport.ts       # Decoupled streaming and network transport abstraction
│   ├── store/
│   │   ├── messageStore.ts    # Zustand store with injected scheduler & batching
│   │   ├── messageStore.test.ts # Vitest suite for batched flushes & immutability
│   │   └── useMessages.ts     # Store selector hooks
│   ├── App.tsx                # Interactive control dashboard & Profiler monitor
│   └── main.tsx               # Application bootstrap
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.x
- npm >= 10.x

### Installation

```bash
git clone https://github.com/a-pourhasan/peer-message-list.git
cd peer-message-list
npm install
```

### Development

Start the local Vite development server:

```bash
npm run dev
```

### Testing

Run unit and integration suites (100% pass on state immutability, batching, and indexing):

```bash
npm test
```

### Production Build

Type-check and produce optimized production bundle:

```bash
npm run build
```

---

## License

MIT
