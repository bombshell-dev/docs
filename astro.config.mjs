import starlight from "@astrojs/starlight";
// @ts-check
import { defineConfig } from "astro/config";
import ecTwoSlash from "expressive-code-twoslash";

const site = "https://docs.bomb.sh/";

// https://astro.build/config
export default defineConfig({
  site: 'https://docs.bomb.sh/',
  base: '/docs',
  integrations: [
    starlight({
      title: "Bombshell",
      customCss: [
        // Relative path to your @font-face CSS file.
        "./src/fonts/font-face.css",
      ],
      logo: {
        dark: "./src/assets/dark.svg",
        light: "./src/assets/light.svg",
      },
      components: {
        Head: "./src/starlightOverrides/Head.astro",
      },
      expressiveCode: {
        plugins: [ecTwoSlash()],
      },
      editLink: {
        baseUrl: "https://github.com/bombshell-dev/clack/docs/edit/main/",
      },
      head: [
        {
          tag: "meta",
          attrs: {
            name: "og:image",
            content: `${site}og-docs.png`,
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:image",
            content: `${site}og-docs.png`,
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:site",
            content: "bombshell",
          },
        },
        {
          tag: "meta",
          attrs: {
            name: "twitter:creator",
            content: "bombshell",
          },
        },
      ],
      social: {
        discord: "https://bomb.sh/chat",
        blueSky: "https://bomb.sh/on/bluesky",
        github: "https://bomb.sh/on/github",
      },
      sidebar: [
        {
          label: "Basics",
          autogenerate: { directory: "basics" },
        },
        {
          label: "Clack",
          autogenerate: { directory: "clack" },
        },
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
        },
      ],
    }),
  ],
});
