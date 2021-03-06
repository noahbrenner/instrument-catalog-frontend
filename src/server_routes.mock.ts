/*
 * This file is only used in development and *should* live in `tests/mocks/`,
 * but the build system would silently fail to import it in the development
 * build if it's outside the `src/` directory
 */

import jws from "jws";
import { context as ctx, response, rest } from "msw";
import type {
  MockedRequest,
  MockedResponse,
  RequestHandler,
  ResponseTransformer,
} from "msw";

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
      summary: "Move air, make noise",
      description: "This is a longer description of wind instruments.",
    },
    {
      id: 1,
      name: "Percussion",
      slug: "percussion",
      summary: "Hit stuff",
      description: "This is a longer description of percussion instruments.",
    },
    {
      id: 2,
      name: "Strings",
      slug: "strings",
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

const MOCK_DATA_JSON = JSON.stringify(MOCK_DATA);
const DB: typeof MOCK_DATA = JSON.parse(MOCK_DATA_JSON);

export function resetDB(): void {
  Object.keys(DB).forEach((key) => delete DB[key as keyof typeof DB]);
  Object.assign(DB, JSON.parse(MOCK_DATA_JSON));
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

function getUserCredentials(
  req: MockedRequest
):
  | { userId: string; isAdmin: boolean; errResponse: undefined }
  | { userId: undefined; isAdmin: false; errResponse: MockedResponse } {
  const authorizationHeader = req.headers.get("Authorization") || "";
  const jwt = jws.decode(authorizationHeader.slice("Bearer ".length));

  // jwt can be null for invalid data, though the types don't reflect that
  if (jwt?.payload?.sub === undefined) {
    const errResponse = apiResponse(
      ctx.status(403, "Forbidden"),
      ctx.json({ error: "You need to log in before you can do that" })
    );
    return { userId: undefined, isAdmin: false, errResponse };
  }
  const userId = jwt.payload.sub as string;
  const roles = jwt.payload["http:auth/roles"];
  const isAdmin = Array.isArray(roles) && roles.includes("admin");
  return { userId, isAdmin, errResponse: undefined };
}

/** Includes all IInstrument fields except "id" and "userId" */
type InstrumentDescriptiveData = Pick<
  IInstrument,
  "categoryId" | "name" | "summary" | "description" | "imageUrl"
>;

/** Type guard for IInstrument without "id" and "userId" */
function isInstrumentDescriptiveData(
  obj: unknown
): obj is InstrumentDescriptiveData {
  const categoryIds = DB.categories.map(({ id }) => id);
  const isObject = (o: unknown): o is Record<string, unknown> =>
    typeof o === "object" && obj !== null;

  return (
    isObject(obj) &&
    categoryIds.includes(obj.categoryId as number) &&
    typeof obj.name === "string" &&
    typeof obj.summary === "string" &&
    typeof obj.description === "string" &&
    typeof obj.imageUrl === "string" &&
    !("id" in obj) &&
    !("userId" in obj)
  );
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

  // POST (create) Instrument: /instruments
  rest.post(ENDPOINTS.instruments, (req) => {
    // Validate user
    const auth = getUserCredentials(req);
    if (auth.errResponse) {
      return auth.errResponse;
    }

    // Validate submitted data
    if (!isInstrumentDescriptiveData(req.body)) {
      const error = "Invalid instrument object";
      return apiResponse(ctx.status(400, "Bad Request"), ctx.json({ error }));
    }

    const { name, categoryId, summary, description, imageUrl } = req.body;
    const { userId } = auth;
    const id = 1 + Math.max(...DB.instruments.map((inst) => inst.id));
    const newInstrument: IInstrument = {
      id,
      userId,
      name,
      categoryId,
      summary,
      description,
      imageUrl,
    };

    // Insert and return the new instrument
    DB.instruments.push(newInstrument);
    return apiResponse(ctx.status(200), ctx.json(newInstrument));
  }),

  // PUT (update) Instrument: /instruments/<instrumentId>
  rest.put(`${ENDPOINTS.instruments}/:id`, (req) => {
    // Validate user
    const { userId, isAdmin, errResponse } = getUserCredentials(req);
    if (errResponse) {
      return errResponse;
    }

    // Validate instrument ID
    if (!/^[0-9]+$/.test(req.params.id)) {
      const error = `Invalid instrument ID: "${req.params.id}"`;
      return apiResponse(ctx.status(400, "Bad Request"), ctx.json({ error }));
    }
    const instrumentId = Number(req.params.id);
    const instrument = DB.instruments.find(({ id }) => id === instrumentId);
    if (!instrument) {
      const error = `There is no existing instrument with ID "${instrumentId}"`;
      return apiResponse(ctx.status(404, "Not Found"), ctx.json({ error }));
    }

    // Validate permissions
    if (userId !== instrument.userId && !isAdmin) {
      const error = "You don't have permission to edit this instrument";
      return apiResponse(ctx.status(403, "Forbidden"), ctx.json({ error }));
    }

    // Validate submitted data
    if (!isInstrumentDescriptiveData(req.body)) {
      const error = "Invalid instrument object";
      return apiResponse(ctx.status(400, "Bad Request"), ctx.json({ error }));
    }

    // Update instrument
    Object.assign(instrument, req.body);
    return apiResponse(ctx.status(200), ctx.json(instrument));
  }),

  // DELETE Instrument: /instruments/<instrumentId>
  rest.delete(`${ENDPOINTS.instruments}/:id`, (req) => {
    // Validate user
    const { userId, isAdmin, errResponse } = getUserCredentials(req);
    if (errResponse) {
      return errResponse;
    }

    // Validate instrument ID
    if (!/^[0-9]+$/.test(req.params.id)) {
      const error = `Invalid instrument ID: "${req.params.id}"`;
      return apiResponse(ctx.status(400, "Bad Request"), ctx.json({ error }));
    }
    const instrumentIndex = DB.instruments.findIndex(
      ({ id }) => id === Number(req.params.id)
    );
    if (instrumentIndex === -1) {
      // DELETE is idempotent
      return apiResponse(ctx.status(204, "No Content"));
    }

    // Validate permissions
    const instrument = DB.instruments[instrumentIndex];
    if (userId !== instrument.userId && !isAdmin) {
      const error = "You don't have permission to edit this instrument";
      return apiResponse(ctx.status(403, "Forbidden"), ctx.json({ error }));
    }

    // Delete the instrument
    DB.instruments.splice(instrumentIndex, 1);
    return apiResponse(ctx.status(204, "No Content"));
  }),

  // Default: 404
  rest.get(`${process.env.API_ROOT}/*`, () => {
    return apiResponse(ctx.status(404, "Not Found"));
  }),
];
