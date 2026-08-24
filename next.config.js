import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  // This project is standalone — trace from its own directory, not the parent
  // /home/hserver where an unrelated package-lock.json triggers a root warning.
  outputFileTracingRoot: __dirname,
  transpilePackages: ["@policy-search/contracts"],
};

export default config;
