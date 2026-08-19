export interface ICategory {
  subCategories: [];
  products?: [];
  _id: string;
  isFeatured?: boolean;
  status?: 'active' | 'inactive';
  isSubCategory?: boolean;
  parentCategory?: string;
  vendorId: string;
  name: string;
  slug: string;
  details: string;
  icon: {
    name: string;
    url: string;
  };
  description: string
  image: string;
  bannerImg: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
