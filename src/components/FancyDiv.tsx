import React from "react";

const FancyDiv = ({ children }: { children: JSX.Element }): JSX.Element => {
  return <div style={{ border: "1px solid red" }}>{children}</div>;
};
export default FancyDiv;
