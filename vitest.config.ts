import { defineConfig } from "vitest/config";
import path from "node:path";
import os from "node:os";

export default defineConfig({
  test: {
    execArgv: [
      "--localstorage-file",
      path.resolve(os.tmpdir(), `vitest-${process.pid}.localstorage`),
    ],
  },
});
