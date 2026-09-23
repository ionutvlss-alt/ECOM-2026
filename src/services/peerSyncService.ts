import Peer, { DataConnection } from 'peerjs';
import { Product } from '../types/product';
import { storageService } from './storageService';

export interface SyncPayload {
  version: number;
  timestamp: string;
  products: Product[];
  categories: string[];
}

export class PeerSyncManager {
  private peer: Peer | null = null;
  private connection: DataConnection | null = null;

  public initSender(
    onReady: (code: string) => void,
    onConnected: () => void,
    onSuccess: (count: number) => void,
    onError: (err: string) => void
  ): { sendData: () => void; destroy: () => void } {
    // Generate a random 6-character room code
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const peerId = `ecom_sync_${randomCode}`;

    try {
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', () => {
        onReady(randomCode);
      });

      this.peer.on('connection', (conn) => {
        this.connection = conn;
        onConnected();

        conn.on('open', () => {
          // Send current products immediately
          const products = storageService.getProducts();
          const categories = storageService.getCategories();
          const payload: SyncPayload = {
            version: 1,
            timestamp: new Date().toISOString(),
            products,
            categories,
          };
          conn.send(payload);
          onSuccess(products.length);
        });

        conn.on('error', (err) => {
          onError(err.message || 'Eroare la conexiunea P2P');
        });
      });

      this.peer.on('error', (err) => {
        onError(err.message || 'Eroare la serverul de sincronizare');
      });
    } catch (e: any) {
      onError(e.message || 'Nu s-a putut inițializa WebRTC');
    }

    return {
      sendData: () => {
        if (this.connection && this.connection.open) {
          const products = storageService.getProducts();
          const categories = storageService.getCategories();
          const payload: SyncPayload = {
            version: 1,
            timestamp: new Date().toISOString(),
            products,
            categories,
          };
          this.connection.send(payload);
        }
      },
      destroy: () => {
        if (this.connection) this.connection.close();
        if (this.peer) this.peer.destroy();
      },
    };
  }

  public initReceiver(
    code: string,
    onConnected: () => void,
    onDataReceived: (payload: SyncPayload) => void,
    onError: (err: string) => void
  ): { destroy: () => void } {
    const cleanCode = code.trim().toUpperCase();
    const targetPeerId = `ecom_sync_${cleanCode}`;
    const receiverPeerId = `ecom_recv_${Math.random().toString(36).substring(2, 8)}`;

    try {
      this.peer = new Peer(receiverPeerId, {
        debug: 1,
      });

      this.peer.on('open', () => {
        const conn = this.peer!.connect(targetPeerId, { reliable: true });
        this.connection = conn;

        conn.on('open', () => {
          onConnected();
        });

        conn.on('data', (data) => {
          const payload = data as SyncPayload;
          if (payload && Array.isArray(payload.products)) {
            // Save to storage
            storageService.saveProducts(payload.products);
            if (payload.categories && Array.isArray(payload.categories)) {
              storageService.saveCategories(payload.categories);
            }
            onDataReceived(payload);
          }
        });

        conn.on('error', (err) => {
          onError(err.message || 'Eroare conexiune cu calculatorul');
        });
      });

      this.peer.on('error', (err) => {
        onError(err.message || 'Nu s-a putut găsi calculatorul. Verifică codul de sincronizare.');
      });
    } catch (e: any) {
      onError(e.message || 'Nu s-a putut conecta');
    }

    return {
      destroy: () => {
        if (this.connection) this.connection.close();
        if (this.peer) this.peer.destroy();
      },
    };
  }
}
