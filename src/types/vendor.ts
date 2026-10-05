interface Auth {
  provider: string;
  providerId: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  gender: string;
  contactNo: string;
  bio: string;
  status: string;
  walletPoint: number;
  socials: string[];
  cardInfo: null | any;
  auths: Auth[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Summery {
  totalRevenue: number;
  todaysRevenue: number;
  todaysRefund: number;
  totalShop: number;
}

interface OrderStatus {
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
}

export interface IVendor {
  _id: string;
  userId?: User;
  shops: any | null;
  shopTransfer: any[];
  messages: any[];
  storeNotices: any[];
  summery?: Summery;
  orderStatus?: OrderStatus;
  status: string;
  onboarding?: any;
  salesHistory: any[];
  topCategoryByProducts: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type ISeller = IVendor;
