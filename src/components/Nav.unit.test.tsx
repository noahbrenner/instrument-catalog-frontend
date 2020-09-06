import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { renderWithDefaultTheme } from "#test_helpers/renderWithDefaultTheme";
import { Nav } from "./Nav";
import type { NavProps } from "./Nav";

const noop = (): void => undefined;

describe("Nav", () => {
  describe("given a list of text and URLs", () => {
    it("renders a link for each text/URL pair", () => {
      const inputLinks: NavProps["links"] = [
        ["foo", "/foo"],
        ["bar", "/bar"],
      ];
      renderWithDefaultTheme(
        <Nav visible onLinkClick={noop} links={inputLinks} />
      );
      const links = screen.getAllByRole("link");

      expect(links).toHaveLength(inputLinks.length);

      links.forEach((link, index) => {
        const [linkText, url] = inputLinks[index];
        expect(link).toHaveTextContent(linkText);
        expect(link).toHaveAttribute("href", url);
      });
    });
  });

  // I'd rather test the `visible` property by the element's visibility instead
  // of testing CSS classes, but jsdom doesn't currently support @media queries:
  // https://github.com/jsdom/jsdom/blob/9b15aee0074870bf18ef3374d5bded9911066125/lib/jsdom/level2/style.js#L18
  describe("given a particular value for visible=...", () => {
    it("is visible when visible=true", () => {
      renderWithDefaultTheme(<Nav visible onLinkClick={noop} links={[]} />);
      expect(document.body.classList).toContain("nav-visible");

      // This would be better
      // expect(screen.getByRole("navigation")).toBeVisible();
    });

    it("is hidden when visible=false", () => {
      renderWithDefaultTheme(
        <Nav visible={false} onLinkClick={noop} links={[]} />
      );
      expect(document.body.classList).not.toContain("nav-visible");

      // This would be better
      // window.innerWidth = 300
      // expect(screen.getByRole("navigation")).not.toBeVisible();
    });
  });

  describe("given an onLinkClick handler", () => {
    it("calls the click handler for clicks on links", () => {
      const handler = jest.fn();
      renderWithDefaultTheme(
        <Nav visible onLinkClick={handler} links={[["foo", "#"]]} />
      );
      userEvent.click(screen.getByRole("link"));
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("does NOT call the click handler for clicks outside of links", () => {
      const handler = jest.fn();
      renderWithDefaultTheme(
        <Nav visible onLinkClick={handler} links={[["foo", "#"]]} />
      );
      userEvent.click(screen.getByRole("navigation"));
      userEvent.click(screen.getByRole("list"));
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
