import adapter from '@sveltejs/adapter-static';
import { optimizeImports } from "carbon-preprocess-svelte";
import preprocess from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [preprocess(), optimizeImports() ],
  kit: {
    target: "#svelte",
    adapter: adapter({
      fallback: '200.html'
    })
  },
};

export default config;
