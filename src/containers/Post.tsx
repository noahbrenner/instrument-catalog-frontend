import React from "react";
import { useRouteData } from "react-static";
import { Link } from "@reach/router";
import { Post as IPost } from "../../types";

export default function Post(): JSX.Element {
  const { post }: { post: IPost } = useRouteData();
  return (
    <div>
      <Link to="/blog/">{"<"} Back</Link>
      <br />
      <h3>{post.title}</h3>
      <p>{post.body}</p>
    </div>
  );
}
