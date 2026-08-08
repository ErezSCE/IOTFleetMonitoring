declare module 'socket.io-client' {
  export function io(url: string, options?: any): Socket;
  export interface Socket {
    on(event: string, listener: (...args: any[]) => void): this;
    off(event: string, listener: (...args: any[]) => void): this;
    emit(event: string, ...args: any[]): boolean;
    disconnect(): void;
  }
}
