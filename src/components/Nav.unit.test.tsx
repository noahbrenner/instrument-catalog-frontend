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

  /*
   * I'd like to test behavior of the `visible` property, but jsdom doesn't
   * currently support @media queries, which we would need in order to do so:
   * https://github.com/jsdom/jsdom/blob/9b15aee0074870bf18ef3374d5bded9911066125/lib/jsdom/level2/style.js#L18
   *
   * Unless that changes, we'd need to to automated browser testing to cover
   * this. If jsdom *did* support media queries, we could do something like:
   *
   * describe("given visible=true", () => {
   *   it("is visible on the page", () => {
   *     renderWithDefaultTheme(<Nav visible onLinkClick={noop} links={[]} />);
   *
   *     // This would be the best
   *     expect(screen.getByRole("navigation")).toBeVisible();
   *
   *     // This would be okay, but it's not working either
   *     expect(document.body.classList).toContain("nav-visible");
   *   });
   * });
   *
   * describe("given visible=false", () => {
   *   it("is hidden", () => {
   *     renderWithDefaultTheme(
   *       <Nav visible={false} onLinkClick={noop} links={[]} />
   *     );
   *     // This would be the best
   *     window.innerWidth = 300
   *     expect(screen.getByRole("navigation")).not.toBeVisible();
   *
   *     // This would be okay, but it's not working either
   *     expect(document.body.classList).not.toContain("nav-visible");
   *   });
   * });
   */

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
