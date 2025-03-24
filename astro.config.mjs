// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import ecTwoSlash from "expressive-code-twoslash";

// https://astro.build/config
export default defineConfig({
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
      social: {
        discord: "https://bomb.sh/chat",
        blueSky: "https://bomb.sh/on/bluesky",
        github: "https://bomb.sh/on/github",
      },
      sidebar: [
        { label: "clack", link: "/" },
        { label: "tab", link: "/" },
        { label: "[ ... ]", link: "/" },
        { label: "[ ... ]", link: "/" },
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
