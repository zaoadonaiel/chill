import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Every store page reads live data from Supabase, so no incremental cache
// (R2/KV) is needed. See https://opennext.js.org/cloudflare/caching to add one.
export default defineCloudflareConfig({});
