import { optimizeImports } from "carbon-preprocess-svelte";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [preprocess(), optimizeImports() ],
  kit: {
    target: "#svelte",
  },
};

export default config;
