declare module 'amqplib' {
  export interface Message {
    content: Buffer;
    fields: any;
    properties: any;
  }
  export interface Connection {
    createChannel(): Promise<Channel>;
    close(): Promise<void>;
  }
  export interface Channel {
    assertQueue(queue: string, options?: any): Promise<void>;
    consume(queue: string, onMessage: (msg: Message | null) => void, options?: any): Promise<void>;
    ack(msg: Message): void;
    nack(msg: Message, allUpTo?: boolean, requeue?: boolean): void;
    close(): Promise<void>;
    publish(exchange: string, routingKey: string, content: Buffer, options?: any): boolean;
  }
  export function connect(url: string): Promise<Connection>;
}
