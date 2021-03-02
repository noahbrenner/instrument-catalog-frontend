import React from "react";

import {
  mockAuthenticatedUser,
  useAuth,
  UNAUTHENTICATED,
} from "#mocks/useAuth";
import { renderWithRouter } from "#test_helpers/renderWithRouter";
import { Instrument } from "./Instrument";

describe("<Instrument />", () => {
  describe("when logged out", () => {
    it("renders provided values, does not render Edit/Delete buttons", () => {
      useAuth.mockReturnValue(UNAUTHENTICATED);
      const { getByRole, getByText, queryByRole } = renderWithRouter(
        <Instrument
          id={3}
          userId="foo|123"
          name="Foo"
          categoryName="Bar category"
          summary="My Foo summary"
          description="My description of Foo"
          imageUrl="http://foo.com/"
        />
      );

      const img = getByRole("img");
      expect(img).toHaveAttribute("src", "http://foo.com/");
      expect(img).toHaveAttribute("alt", "Foo");

      expect(getByRole("heading", { level: 2 })).toHaveTextContent("Foo");

      expect(getByText(/bar category/i)).toBeInTheDocument();
      expect(getByText("My Foo summary")).toBeInTheDocument();
      expect(getByText("My description of Foo")).toBeInTheDocument();

      const editBtn = queryByRole("button", { name: /edit instrument/i });
      expect(editBtn).not.toBeInTheDocument();

      const deleteBtn = queryByRole("button", { name: /delete instrument/i });
      expect(deleteBtn).not.toBeInTheDocument();
    });
  });

  describe("when logged in", () => {
    it.each([
      ["the instrument owner", () => mockAuthenticatedUser("owner")],
      ["an admin", () => mockAuthenticatedUser("notOwner", /* isAdmin */ true)],
    ])("renders Edit and Delete buttons for %s", (_, mockAuthState) => {
      mockAuthState();
      const { getByRole } = renderWithRouter(
        <Instrument
          id={3}
          userId="owner"
          name="Foo"
          categoryName="Bar category"
          summary="My Foo summary"
          description="My description of Foo"
          imageUrl="http://foo.com/"
        />
      );

      const editBtn = getByRole("button", { name: /edit instrument/i });
      expect(editBtn).toBeInTheDocument();

      const deleteBtn = getByRole("button", { name: /delete instrument/i });
      expect(deleteBtn).toBeInTheDocument();
    });

    it("does not render Edit or Delete buttons for non-owners", () => {
      mockAuthenticatedUser("notOwner");
      const { queryByRole } = renderWithRouter(
        <Instrument
          id={3}
          userId="owner"
          name="Foo"
          categoryName="Bar category"
          summary="My Foo summary"
          description="My description of Foo"
          imageUrl="http://foo.com/"
        />
      );

      const editBtn = queryByRole("button", { name: /edit instrument/i });
      expect(editBtn).not.toBeInTheDocument();

      const deleteBtn = queryByRole("button", { name: /delete instrument/i });
      expect(deleteBtn).not.toBeInTheDocument();
    });
  });
});
