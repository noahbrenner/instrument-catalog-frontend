import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import {
  useAuth,
  mockAuthenticatedUser,
  LOADING,
  ERRORED,
  UNAUTHENTICATED,
} from "#mocks/useAuth";
import { renderWithDefaultTheme } from "#test_helpers/renderWithDefaultTheme";
import { Nav } from "./Nav";

const noop = (): void => undefined;

describe("<Nav />", () => {
  describe("given a user who is logged in", () => {
    it("renders all links, including those requiring authentication", () => {
      mockAuthenticatedUser("foo|123");
      const { getByRole } = renderWithDefaultTheme(
        <Nav visible onLinkClick={noop} />
      );

      const homeLink = getByRole("link", { name: /home/i });
      const categoriesLink = getByRole("link", { name: /categories/i });
      const newInstrumentLink = getByRole("link", { name: /new instrument/i });

      expect(homeLink).toHaveAttribute("href", "/");
      expect(categoriesLink).toHaveAttribute("href", "/categories/");
      expect(newInstrumentLink).toHaveAttribute("href", "/instruments/new/");
    });
  });

  describe("given a user who is not logged in", () => {
    it.each([
      ["LOADING", LOADING],
      ["ERRORED", ERRORED],
      ["UNAUTHENTICATED", UNAUTHENTICATED],
    ])(
      "omits links for pages requiring authentication when auth state is %s",
      (_, AUTH_VALUE) => {
        useAuth.mockReturnValue(AUTH_VALUE);
        const { getByRole, queryByRole } = renderWithDefaultTheme(
          <Nav visible onLinkClick={noop} />
        );

        const homeLink = getByRole("link", { name: /home/i });
        const categoriesLink = getByRole("link", { name: /categories/i });
        const newInstrumentLink = queryByRole("link", {
          name: /new instrument/i,
        });

        expect(homeLink).toHaveAttribute("href", "/");
        expect(categoriesLink).toHaveAttribute("href", "/categories/");
        expect(newInstrumentLink).not.toBeInTheDocument();
      }
    );
  });

  // I'd rather test the `visible` property by the element's visibility instead
  // of testing CSS classes, but jsdom doesn't currently support @media queries:
  // https://github.com/jsdom/jsdom/blob/9b15aee0074870bf18ef3374d5bded9911066125/lib/jsdom/level2/style.js#L18
  describe("given a particular value for visible=...", () => {
    it("is visible when visible=true", () => {
      renderWithDefaultTheme(<Nav visible onLinkClick={noop} />);
      expect(document.body).toHaveClass("nav-visible");

      // This would be better
      // expect(screen.getByRole("navigation")).toBeVisible();
    });

    it("is hidden when visible=false", () => {
      renderWithDefaultTheme(<Nav visible={false} onLinkClick={noop} />);
      expect(document.body).not.toHaveClass("nav-visible");

      // This would be better
      // window.innerWidth = 300
      // expect(screen.getByRole("navigation")).not.toBeVisible();
    });
  });

  describe("given an onLinkClick handler", () => {
    it("calls the click handler for clicks on links", () => {
      const handler = jest.fn();
      renderWithDefaultTheme(<Nav visible onLinkClick={handler} />);
      userEvent.click(screen.getAllByRole("link")[0]);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does NOT call the click handler for clicks outside of links", () => {
      const handler = jest.fn();
      renderWithDefaultTheme(<Nav visible onLinkClick={handler} />);
      userEvent.click(screen.getByRole("navigation"));
      userEvent.click(screen.getByRole("list"));
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
