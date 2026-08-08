import { TextEncoder, TextDecoder } from 'util';

// Polyfill globals for environments lacking them (e.g., older Node versions)
if (typeof (global as any).TextEncoder === 'undefined') {
  (global as any).TextEncoder = TextEncoder;
}
if (typeof (global as any).TextDecoder === 'undefined') {
  (global as any).TextDecoder = TextDecoder;
}
