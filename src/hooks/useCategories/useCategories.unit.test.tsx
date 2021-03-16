import { render, waitFor, within } from "@testing-library/react";
import React from "react";

import { rest, server, ENDPOINTS, MOCK_DATA } from "#test_helpers/server";
import type { ICategory } from "#src/types";
import { useCategories, resetCache } from "./useCategories";

jest.useFakeTimers();

resetCache();
afterEach(resetCache);

function TestComponent() {
  const { categories, categoriesHaveLoaded, errorMessage } = useCategories();
  return (
    <>
      <ul data-testid="categories">
        {categories.map(({ name }) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
      <p data-testid="categoriesHaveLoaded">{String(categoriesHaveLoaded)}</p>
      <p data-testid="errorMessage">{errorMessage ?? "UNDEFINED"}</p>
    </>
  );
}

function renderTestComponent() {
  const utils = render(<TestComponent />);
  // Restrict queries so that <TestComponent /> can be rendered multiple times
  const { getByTestId } = within(utils.container as HTMLDivElement);
  const categoriesList = getByTestId("categories");

  return {
    ...utils,
    categoriesList,
    categoriesHaveLoadedElement: getByTestId("categoriesHaveLoaded"),
    errorMessageElement: getByTestId("errorMessage"),
    getCategories() {
      return [...categoriesList.children].map((li) => li.textContent);
    },
  };
}

const mockCategoryFiller: Omit<ICategory, "name"> = {
  id: 0,
  slug: "",
  summary: "",
  description: "",
};
const foo: ICategory = { ...mockCategoryFiller, name: "Foo" };
const bar: ICategory = { ...mockCategoryFiller, name: "Bar" };
const baz: ICategory = { ...mockCategoryFiller, name: "Baz" };
const mockCategoryNames = MOCK_DATA.categories.map(({ name }) => name);
const categoriesEndpoint = `${ENDPOINTS.categories}/all`;

describe("useCategories()", () => {
  describe("given a successful API response", () => {
    it("returns category objects and caches the result", async () => {
      {
        const {
          categoriesList,
          categoriesHaveLoadedElement,
          errorMessageElement,
          getCategories,
        } = renderTestComponent();

        // Before data is fetched
        expect(categoriesHaveLoadedElement).toHaveTextContent("false");
        expect(errorMessageElement).toHaveTextContent("UNDEFINED");
        expect(categoriesList.children).toHaveLength(0);

        // After data is fetched
        await waitFor(() =>
          expect(categoriesHaveLoadedElement).toHaveTextContent("true")
        );
        expect(errorMessageElement).toHaveTextContent("UNDEFINED");
        expect(getCategories()).toEqual(mockCategoryNames);
      }
      {
        const {
          categoriesHaveLoadedElement,
          errorMessageElement,
          getCategories,
        } = renderTestComponent();

        // Cached categories are populated on the first render
        expect(categoriesHaveLoadedElement).toHaveTextContent("true");
        expect(errorMessageElement).toHaveTextContent("UNDEFINED");
        expect(getCategories()).toStrictEqual(mockCategoryNames);
      }
    });
  });

  describe("given 2 components mounted before the first API response", () => {
    it("makes 1 request and provides the same data to both", async () => {
      let isFirstResponse = true;
      server.use(
        rest.get(categoriesEndpoint, (_req, res, ctx) => {
          const responseData = isFirstResponse
            ? { categories: [foo, bar] } // First response
            : { categories: [baz] }; // Subsequent responses
          isFirstResponse = false;
          return res(ctx.json(responseData));
        })
      );
      const component1 = renderTestComponent();
      const component2 = renderTestComponent();

      await waitFor(() =>
        expect(component1.categoriesHaveLoadedElement).toHaveTextContent("true")
      );
      expect(component2.categoriesHaveLoadedElement).toHaveTextContent("true");

      expect(component1.errorMessageElement).toHaveTextContent("UNDEFINED");
      expect(component2.errorMessageElement).toHaveTextContent("UNDEFINED");

      expect(component1.getCategories()).toStrictEqual(["Foo", "Bar"]);
      expect(component2.getCategories()).toStrictEqual(["Foo", "Bar"]);
    });
  });

  describe("given the 1st of 2 components unmounting before response", () => {
    it("caches data returned for the first component's request", async () => {
      let isFirstResponse = true;
      server.use(
        rest.get(categoriesEndpoint, (_req, res, ctx) => {
          const responseData = isFirstResponse
            ? { categories: [foo, bar] } // First response
            : { categories: [baz] }; // Subsequent responses
          isFirstResponse = false;
          return res(ctx.json(responseData));
        })
      );
      const component1 = renderTestComponent();
      const component2 = renderTestComponent();
      component1.unmount();

      // component2 is updated after component1's request completes
      await waitFor(() =>
        expect(component2.categoriesHaveLoadedElement).toHaveTextContent("true")
      );
      expect(component2.errorMessageElement).toHaveTextContent("UNDEFINED");
      expect(component2.getCategories()).toStrictEqual(["Foo", "Bar"]);

      // But component1 is not updated after being unmounted
      expect(component1.categoriesHaveLoadedElement).toHaveTextContent("false");
      expect(component1.errorMessageElement).toHaveTextContent("UNDEFINED");
      expect(component1.categoriesList.children).toHaveLength(0);
    });
  });

  describe("given a 404 API response", () => {
    it("reuses the cached error message", async () => {
      let isFirstResponse = true;
      server.use(
        rest.get(categoriesEndpoint, (_req, res, ctx) => {
          const response = isFirstResponse
            ? res(ctx.status(404), ctx.json({ error: "BAD" })) // First response
            : res(ctx.json({ categories: [foo, bar] })); // Subsequent responses
          isFirstResponse = false;
          return response;
        })
      );
      // Mount 2 components initially, then a third after the request completes
      const component1 = renderTestComponent();
      const component2 = renderTestComponent();
      await waitFor(() =>
        expect(component1.errorMessageElement).toHaveTextContent(/BAD/)
      );
      const component3 = renderTestComponent();

      // All components should reflect the failed request
      expect(component2.errorMessageElement).toHaveTextContent(/BAD/);
      expect(component3.errorMessageElement).toHaveTextContent(/BAD/);

      expect(component1.categoriesHaveLoadedElement).toHaveTextContent("false");
      expect(component2.categoriesHaveLoadedElement).toHaveTextContent("false");
      expect(component3.categoriesHaveLoadedElement).toHaveTextContent("false");

      expect(component1.categoriesList.children).toHaveLength(0);
      expect(component2.categoriesList.children).toHaveLength(0);
      expect(component3.categoriesList.children).toHaveLength(0);
    });
  });

  describe("given a 500 API response", () => {
    it("reuses the cached error message and retries the request", async () => {
      server.use(
        rest.get(categoriesEndpoint, (_req, res, ctx) => res(ctx.status(500)))
      );
      // Mount 2 components initially, then a third after the request completes
      const component1 = renderTestComponent();
      const component2 = renderTestComponent();
      await waitFor(
        () => expect(component1.errorMessageElement).toHaveTextContent(/500/),
        { timeout: 2000 }
      );
      const component3 = renderTestComponent();

      // TODO Add identical expect() calls below for for component2
      // In the current implementation, when the initial API response fails with
      // a retryable error, the error message is not synced to components that
      // were mounted before that first request had received a response

      // All components should reflect the failed request
      expect(component3.errorMessageElement).toHaveTextContent(/500/);

      expect(component1.categoriesHaveLoadedElement).toHaveTextContent("false");
      expect(component3.categoriesHaveLoadedElement).toHaveTextContent("false");

      expect(component1.categoriesList.children).toHaveLength(0);
      expect(component3.categoriesList.children).toHaveLength(0);

      // Provide a successful response for the retried request
      server.use(
        rest.get(categoriesEndpoint, (_req, res, ctx) => {
          return res(ctx.json({ categories: [foo, bar] }));
        })
      );

      jest.runAllTimers();

      await waitFor(() =>
        expect(component1.categoriesHaveLoadedElement).toHaveTextContent("true")
      );
      expect(component2.categoriesHaveLoadedElement).toHaveTextContent("true");
      expect(component3.categoriesHaveLoadedElement).toHaveTextContent("true");

      expect(component1.errorMessageElement).toHaveTextContent("UNDEFINED");
      expect(component2.errorMessageElement).toHaveTextContent("UNDEFINED");
      expect(component3.errorMessageElement).toHaveTextContent("UNDEFINED");

      expect(component1.getCategories()).toStrictEqual(["Foo", "Bar"]);
      expect(component2.getCategories()).toStrictEqual(["Foo", "Bar"]);
      expect(component3.getCategories()).toStrictEqual(["Foo", "Bar"]);
    });
  });
});
