import React from "react";
import { Root, addPrefetchExcludes } from "react-static";
import { Link, Router } from "@reach/router";
// eslint-disable-next-line import/no-extraneous-dependencies
import { setupWorker } from "msw"; // Dev usage only

import { handlers } from "#server_routes.mock"; // Dev usage only
import { FancyDiv } from "#components/FancyDiv";
import Dynamic from "#containers/Dynamic";
import Home from "./pages";
import About from "./pages/about";
import "./app.css";

// Mock the API server using a ServiceWorker
if (
  process.env.FRONTEND_MOCK_API_SERVER === "true" &&
  process.env.NODE_ENV !== "production" &&
  typeof document !== undefined
) {
  setupWorker(...handlers).start();
}

// Any routes that start with 'dynamic' will be treated as non-static routes
addPrefetchExcludes(["dynamic"]);

export function App(): JSX.Element {
  return (
    <Root>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/dynamic">Dynamic</Link>
      </nav>
      <div className="content">
        <FancyDiv>
          <Router>
            <Home path="/" />
            <About path="about" />
            <Dynamic path="dynamic" />
          </Router>
        </FancyDiv>
      </div>
    </Root>
  );
}
