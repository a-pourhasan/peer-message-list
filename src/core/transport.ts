import type { Message } from './messageIndex';

export interface Transport {
  connect: (onMessage: (msg: Message) => void) => void;
  disconnect: () => void;
}

export class SimulatedP2PTransport implements Transport {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private isRunning = false;

  private peers: string[];
  private messageRateMs: number;

  constructor(
    peers: string[] = ['peer-amir', 'peer-arman', 'peer-sara'],
    messageRateMs: number = 25,
  ) {
    this.peers = peers;
    this.messageRateMs = messageRateMs;
  }

  connect(onMessage: (msg: Message) => void): void {
    if (this.isRunning) return;

    this.isRunning = true;
    let counter = 0;

    const emit = () => {
      if (!this.isRunning) return;

      const id = `p2p_${counter++}`;

      const randomPeer =
        this.peers[Math.floor(Math.random() * this.peers.length)];

      const ts = Date.now() + Math.floor(Math.random() * 400 - 200);

      onMessage({
        id,
        peer: randomPeer,
        ts,
        text: `Decentralized payload ${id}`,
      });

      if (Math.random() < 0.05) {
        setTimeout(() => {
          if (!this.isRunning) return;

          onMessage({
            id,
            peer: randomPeer,
            ts,
            text: `Decentralized payload ${id}`,
          });
        }, 120);
      }

      this.timer = setTimeout(emit, this.messageRateMs);
    };

    emit();
  }

  disconnect(): void {
    this.isRunning = false;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
