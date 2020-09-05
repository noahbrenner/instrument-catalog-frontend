import { Link } from "@reach/router";
import React from "react";
import { Head } from "react-static";
import styled, { createGlobalStyle } from "styled-components";

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
  height: calc(100vh - ${({ theme }) => theme.headerHeight});
  overflow-y: auto;
  left: 100%;
  transition: left 0.2s ease-in-out;

  body.nav-visible & {
    left: 0;
  }

  & ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  @media (min-width: ${({ theme }) => theme.mobileBreakpoint}) {
    position: static;
    height: auto;

    & ul {
      display: flex;
    }
  }
`;

export interface NavProps {
  links: [linkText: string, url: string][];
  onLinkClick: () => void;
  visible: boolean;
}

export function Nav({ links, onLinkClick, visible }: NavProps): JSX.Element {
  return (
    <StyledNav>
      <GlobalStyle />
      <Head>
        <body className={visible ? "nav-visible" : ""} />
      </Head>
      <ul>
        {links.map(([linkText, url]) => (
          <li key={linkText}>
            <Link to={url} onClick={onLinkClick}>
              {linkText}
            </Link>
          </li>
        ))}
      </ul>
    </StyledNav>
  );
}
