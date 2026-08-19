export interface IBrand {
  _id?: string; 
  name: string;
  title: string;
  description: string;
  status?: "active" | "inactive" | "pending";
  productsCount?: number;
  rating?: number;
  icon: {
    name?: string;
    url?: string;
    file?: File; 
  };
  images: {
    layout: string;
    image?: string;
    file?: File;
  }[];
  createdAt?: string;
  updatedAt?: string;
}
