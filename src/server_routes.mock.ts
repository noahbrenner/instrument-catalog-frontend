/*
 * This file is only used in development and *should* live in `tests/mocks/`,
 * but the build system would silently fail to import it in the development
 * build if it's outside the `src/` directory
 */

// eslint-disable-next-line import/no-extraneous-dependencies
import { context as ctx, response, rest } from "msw";
import type { MockedResponse, RequestHandler, ResponseTransformer } from "msw";

import { ENDPOINTS } from "./api_endpoints";
import type { ICategory, IInstrument, IUser } from "./types";

export { ENDPOINTS };

const userId0: IUser["sub"] = "google-oauth2|1337";
const userId1: IUser["sub"] = "google-oauth2|12345";

export const MOCK_DATA: {
  categories: ICategory[];
  instruments: IInstrument[];
  users: IUser[];
} = {
  categories: [
    {
      id: 0,
      name: "Winds",
      slug: "winds",
      itemCount: 3,
      summary: "Move air, make noise",
      description: "This is a longer description of wind instruments.",
    },
    {
      id: 1,
      name: "Percussion",
      slug: "percussion",
      itemCount: 300,
      summary: "Hit stuff",
      description: "This is a longer description of percussion instruments.",
    },
    {
      id: 2,
      name: "Strings",
      slug: "strings",
      itemCount: 72,
      summary: "Wobbling cords",
      description: "This is a longer description of stringed instruments.",
    },
  ],
  instruments: [
    {
      id: 0,
      categoryId: 0,
      userId: userId0,
      name: "Flute",
      summary: "Flute summary",
      description: "Long description of flutes.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Western_concert_flute_%28Yamaha%29.jpg/442px-Western_concert_flute_%28Yamaha%29.jpg",
    },
    {
      id: 1,
      categoryId: 0,
      userId: userId1,
      name: "Clarinet",
      summary: "Clarinet summary",
      description: "Long description of clarinets.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Clarinet-rotate.png/466px-Clarinet-rotate.png",
    },
    {
      id: 2,
      categoryId: 1,
      userId: userId0,
      name: "Timpani",
      summary: "Timpani summary",
      description: "Long description of timpani.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/HardtkePauken.jpg/640px-HardtkePauken.jpg",
    },
    {
      id: 3,
      categoryId: 1,
      userId: userId1,
      name: "Marimba",
      summary: "Marimba summary",
      description: "Long description of marimbas.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Classical_Marimba_player.jpg/640px-Classical_Marimba_player.jpg",
    },
    {
      id: 4,
      categoryId: 2,
      userId: userId0,
      name: "Double Bass",
      summary: "Double bass summary",
      description: "Long description of double basses.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Leandre_Gramss_double_double_bass_05.jpg/400px-Leandre_Gramss_double_double_bass_05.jpg",
    },
    {
      id: 5,
      categoryId: 2,
      userId: userId1,
      name: "Guitar",
      summary: "Guitar summary",
      description: "Long description of guitars.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Front_of_a_finished_Doc_Watson_Gallagher_guitar.jpg/400px-Front_of_a_finished_Doc_Watson_Gallagher_guitar.jpg",
    },
    {
      id: 6,
      categoryId: 2,
      userId: userId0,
      name: "Harp",
      summary: "Harp summary",
      description: "Long description of harps.",
      imageUrl:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Pedal_Harp_MET_DT698.jpg/412px-Pedal_Harp_MET_DT698.jpg",
    },
  ],
  users: [
    { name: "Nonny Mouse", sub: userId0 },
    { name: "No Body", sub: userId1 },
  ],
};

let DB: typeof MOCK_DATA;
const MOCK_DATA_JSON = JSON.stringify(MOCK_DATA);
DB = JSON.parse(MOCK_DATA_JSON);

export function resetDB(): void {
  DB = JSON.parse(MOCK_DATA_JSON);
}

export function apiResponse(
  ...transformers: ResponseTransformer[]
): MockedResponse {
  // `msw` adds headers using the global `Headers`, which doesn't exist in node,
  // but this header only affects the browser, so we can just omit it in node
  return typeof Headers === "undefined"
    ? response(...transformers)
    : response(...transformers, ctx.set("Access-Control-Allow-Origin", "*"));
}

/*
 * The RequestHandler type needs `any` so handlers can have different responses:
 * https://github.com/mswjs/msw/issues/377#issuecomment-690536532
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handlers: RequestHandler<any, any, any, any>[] = [
  // GET all Categories: /categories/all
  rest.get(`${ENDPOINTS.categories}/all`, () => {
    const { categories } = DB;
    return apiResponse(ctx.json({ categories }));
  }),

  // GET Category: /categories/<category-slug>
  rest.get(`${ENDPOINTS.categories}/:categorySlug`, (req) => {
    const category = DB.categories.find(
      ({ slug }) => slug === req.params.categorySlug
    );
    return category
      ? apiResponse(ctx.json(category))
      : apiResponse(ctx.status(404));
  }),

  // GET all Instruments: /instruments/all
  rest.get(`${ENDPOINTS.instruments}/all`, () => {
    const { instruments } = DB;
    return apiResponse(ctx.json({ instruments }));
  }),

  // GET Instrument: /instruments/<instrumentId>
  rest.get(`${ENDPOINTS.instruments}/:id`, (req) => {
    const instrument = DB.instruments.find(
      ({ id }) => id === Number(req.params.id)
    );
    return instrument
      ? apiResponse(ctx.json(instrument))
      : apiResponse(ctx.status(404));
  }),

  // GET Instruments: /instruments?cat=<categoryId>
  rest.get(ENDPOINTS.instruments, (req) => {
    const reqCategoryId = req.url.searchParams.get("cat");

    if (reqCategoryId == null) {
      const error = 'An instrument ID, category ID, or "all" is required';
      return apiResponse(ctx.status(400), ctx.json({ error }));
    }

    if (!/^[0-9]+$/.test(reqCategoryId)) {
      const error = "Category ID must be an integer.";
      return apiResponse(ctx.status(400), ctx.json({ error }));
    }

    // TODO Handle IDs having a valid format but no corresponding category
    const instruments = DB.instruments.filter(
      ({ categoryId }) => categoryId === Number(reqCategoryId)
    );
    return apiResponse(ctx.json({ instruments }));
  }),

  // Default: 404
  rest.get(`${process.env.API_ROOT}/*`, () => {
    return apiResponse(ctx.status(404, "Not Found"));
  }),
];
