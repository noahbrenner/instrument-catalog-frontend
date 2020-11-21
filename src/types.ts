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
  categoryId: number;
  name: string;
  summary: string;
  description: string;
}

export interface IInstruments {
  instruments: IInstrument[];
}

export interface IUser {
  id: number;
  name: string;
}

export interface IUsers {
  users: IUser[];
}
