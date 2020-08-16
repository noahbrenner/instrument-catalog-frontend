import axios from "axios";
// import { Post } from "./types";

// Typescript support in static.config.js is not yet supported, but is coming in a future update!

export default {
  entry: "index.tsx", // Relative to paths.src
  getRoutes: async () => {
    const { data: posts } /* :{ data: Post[] } */ = await axios.get(
      "https://jsonplaceholder.typicode.com/posts"
    );
    return [
      {
        path: "/blog",
        getData: () => ({
          posts,
        }),
        children: posts.map((post /* : Post */) => ({
          path: `/post/${post.id}`,
          template: "src/containers/Post",
          getData: () => ({
            post,
          }),
        })),
      },
    ];
  },
  plugins: [
    "react-static-plugin-typescript",
    ["react-static-plugin-source-filesystem", { location: "./src/pages" }],
    "react-static-plugin-reach-router",
    "react-static-plugin-sitemap",
  ],
};
