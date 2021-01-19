import { lazy } from "react";
import type { ComponentType, LazyExoticComponent } from "react";

/**
 * Lazily import a named exported component
 *
 *     const Component = lazyNamed(() => import("./Component"), "Component");
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function lazyNamed<T extends ComponentType<any>, K extends string>(
  factory: () => Promise<{ [key in K]: T }>,
  exportedName: K
): LazyExoticComponent<T> {
  return lazy(async () => ({
    // NOTE This dynamic property access breaks tree shaking for the imported
    // module! That isn't impacting this site's bundles though, since we only
    // export one component per module.
    default: (await factory())[exportedName],
  }));
}
