import React from "react";
import { useRouteData } from "react-static";
import { Link } from "@reach/router";
import { IPost } from "#types/blog";

export default function Blog(): JSX.Element {
  const { posts }: { posts: IPost[] } = useRouteData();

  return (
    <div>
      <h1>It’s blog time.</h1>
      <br />
      All Posts:
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <Link to={`/blog/post/${post.id}/`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
