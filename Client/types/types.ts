export type Product = {
  _id: string;
  title: string;
  price: number;
  image?: string;
  inventory: number;
};

export type Draft = {
  title: string;
  price: string;
  inventory: string;
  image: string;
};
