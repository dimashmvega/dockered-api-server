interface ContentfulSys {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

interface ContentfulFields {
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
  [key: string]: any;
}

export interface ContentfulItem {
  sys: ContentfulSys;
  fields: ContentfulFields;
  metadata?: any;
}
