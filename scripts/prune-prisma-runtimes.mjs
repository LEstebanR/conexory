import {
  removeStaleNativeEngines,
  restorePrismaRuntimes,
  stashPrismaRuntimes,
} from "./prisma-runtimes.mjs"

const runtimeDir = "node_modules/@prisma/client/runtime"
const stashDir = ".prisma-unused-runtimes"

if (process.argv[2] === "--restore") {
  console.log(`Restored ${restorePrismaRuntimes(runtimeDir, stashDir)} Prisma runtimes`)
} else {
  console.log(`Moved ${stashPrismaRuntimes(runtimeDir, stashDir)} unused Prisma runtimes aside`)
  const removed = removeStaleNativeEngines("node_modules/.prisma/client")
  console.log(`Removed ${removed} stale native Prisma engines`)
}
