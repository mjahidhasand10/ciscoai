declare module "zerotry" {
  export function safe<T>(
    promise: Promise<T>
  ): Promise<[Error | null, T | undefined]>;
}
