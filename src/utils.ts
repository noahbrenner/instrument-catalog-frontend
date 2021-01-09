import { lazy as reactLazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

/**
 * Lazily import a named or default exported component
 *
 *     const Named = lazy(() => import("./Named"), "Named");
 *     const Default = lazy(() => import("./Default")); // Omit 2nd argument
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazy<T extends ComponentType<any>, K extends string>(
  factory: () => Promise<{ [key in K]: T }>,
  exportedName: K = "default"
): LazyExoticComponent<T> {
  return reactLazy(async () => ({
    // NOTE This dynamic property access breaks tree shaking for the imported
    // module! That isn't impacting this site's bundles though, since we only
    // export one component per module.
    default: (await factory())[exportedName],
  }));
}
