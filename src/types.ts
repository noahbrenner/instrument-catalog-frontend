export interface ICategory {
  name: string;
  itemCount: number;
  summary: string;
  description: string;
}

export interface ICategories {
  categories: ICategory[];
}

export interface IUser {
  id: number;
  name: string;
}

export interface IUsers {
  users: IUser[];
}
