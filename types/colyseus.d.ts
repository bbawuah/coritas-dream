// Type declaration for colyseus.js to resolve ESM export mapping issue
declare module 'colyseus.js' {
  import type { Client, Room } from 'colyseus.js/lib/index';
  export { Client, Room };
  export * from 'colyseus.js/lib/index';
}
