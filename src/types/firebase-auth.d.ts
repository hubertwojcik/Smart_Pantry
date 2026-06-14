// Typy `firebase/auth` pochodzą z buildu nie-RN i nie zawierają
// `getReactNativePersistence`, choć funkcja istnieje w buildzie React Native
// (rozwiązywanym przez Metro). Rozszerzamy moduł, żeby TypeScript ją widział.
// `import` poniżej jest konieczny, by to było ROZSZERZENIE modułu, a nie
// deklaracja zastępująca jego oryginalne typy.
import type { Persistence } from "firebase/auth";

declare module "firebase/auth" {
  export function getReactNativePersistence(storage: {
    setItem: (key: string, value: string) => Promise<void> | void;
    getItem: (key: string) => Promise<string | null> | string | null;
    removeItem: (key: string) => Promise<void> | void;
  }): Persistence;
}
