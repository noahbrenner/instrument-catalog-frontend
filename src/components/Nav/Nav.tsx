import { Link } from "@reach/router";
import React, { useEffect } from "react";
import styled, { createGlobalStyle } from "styled-components";

import { LoginButton } from "#components/LoginButton";
import { useAuth } from "#hooks/useAuth";

const GlobalStyle = createGlobalStyle`
  body {
    overflow-x: hidden;

    &.nav-visible {
      overflow-y: hidden;

      @media (min-width: ${({ theme }) => theme.mobileBreakpoint}) {
        overflow-y: visible;
      }
    }
  }
`;

const StyledNav = styled.nav`
  position: absolute;
  width: 100%;
  height: calc(100vh - ${({ theme }) => theme.headerHeight});
  overflow-y: auto;
  left: 100%;
  transition: left 0.2s ease-in-out;
  background: #108db8;

  body.nav-visible & {
    left: 0;
  }

  button {
    margin: 1rem;
  }

  ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  a {
    display: inline-block;
    color: white;
    padding: 1rem;

    &:hover,
    &:focus,
    &:active {
      background: rgba(0, 0, 0, 0.1);
    }
  }

  @media (min-width: ${({ theme }) => theme.mobileBreakpoint}) {
    position: static;
    display: flex;
    justify-content: space-between;
    padding: 0;
    height: auto;

    button {
      margin: 0;
    }

    ul {
      order: -1;
      display: flex;
    }
  }
`;

export interface NavProps {
  onLinkClick: () => void;
  visible: boolean;
}

export function Nav({ onLinkClick, visible }: NavProps): JSX.Element {
  const auth = useAuth();
  const isAuthenticated = auth.state === "AUTHENTICATED";

  const links: Array<{ text: string; path: string }> = [
    { text: "Home", path: "/" },
    ...(isAuthenticated
      ? [{ text: "Post New Instrument", path: "/instruments/new/" }]
      : []),
    { text: "Categories", path: "/categories/" },
  ];

  useEffect(() => {
    const navVisibleClass = "nav-visible";
    const { classList } = document.body;

    if (visible && !classList.contains(navVisibleClass)) {
      classList.add(navVisibleClass);
    } else if (!visible && classList.contains(navVisibleClass)) {
      classList.remove(navVisibleClass);
    }
  }, [visible]);

  return (
    <StyledNav>
      <GlobalStyle />
      <LoginButton />
      <ul>
        {links.map(({ text, path }) => (
          <li key={text}>
            <Link to={path} onClick={onLinkClick}>
              {text}
            </Link>
          </li>
        ))}
      </ul>
    </StyledNav>
  );
}
