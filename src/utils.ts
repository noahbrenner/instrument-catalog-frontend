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
    default: (await factory())[exportedName],
  }));
}
