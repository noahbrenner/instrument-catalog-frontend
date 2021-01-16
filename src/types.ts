export interface ICategory {
  id: number;
  name: string;
  slug: string;
  itemCount: number;
  summary: string;
  description: string;
}

export interface ICategories {
  categories: ICategory[];
}

export interface IInstrument {
  id: number;
  categoryId: ICategory["id"];
  userId: IUser["sub"];
  name: string;
  summary: string;
  description: string;
  imageUrl: string;
}

export interface IInstruments {
  instruments: IInstrument[];
}

// "admin" is the only role we've defined so far, but others could be added
export type Role = "admin";

/** User data provided by Auth0, which we can access with `useAuth0().user` */
export interface IUser {
  /** User's full name */
  name: string;

  /** Subject, otherwise known as user ID */
  sub: string;

  /**
   * Roles assigned to a user via the Auth0 Management API or dashboard
   *
   * This namespaced field is created by a "Rule" added to the Auth0 Tenant
   * See README.md for Auth0 setup instructions
   */
  "http:auth/roles"?: Role[];

  /* Some other values provided by Auth0, but which we don't currently use: */
  // email: string;
  // email_verified: boolean;
  // family_name: string;
  // gender: string;
  // given_name: string;
  // locale: string; // e.g. "en"
  // nickname: string;
  // picture: string; // URL
  // updated_at: string; // ISO 8601 Date and time in UTC
}

export interface IUsers {
  users: IUser[];
}
