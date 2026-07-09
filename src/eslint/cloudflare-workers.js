/**
 * Concern: Cloudflare Workers runtime.
 *
 * Registers the Workers runtime/binding globals (KVNamespace, D1Database,
 * DurableObjectNamespace, Queue, …) and nudges away from Node-only builtins
 * that don't exist on the Workers runtime. Consume alongside the base concerns
 * for any Worker; the Nuxt preset already includes it.
 */
import { cloudflareWorkerGlobals } from "./globals.js";

export default [
  {
    languageOptions: {
      globals: { ...cloudflareWorkerGlobals },
    },
    rules: {
      // Node builtins (`fs`, `path`, `os`, …) are not available on the
      // Workers runtime unless polyfilled — flag bare imports of them.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "fs",
              message: "Node `fs` is unavailable on the Workers runtime.",
            },
            {
              name: "path",
              message: "Node `path` is unavailable on the Workers runtime.",
            },
            {
              name: "os",
              message: "Node `os` is unavailable on the Workers runtime.",
            },
            {
              name: "child_process",
              message:
                "Node `child_process` is unavailable on the Workers runtime.",
            },
          ],
        },
      ],
    },
  },
];
