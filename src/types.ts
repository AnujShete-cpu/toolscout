export type BadgeType = 'feat' | 'free' | 'new' | 'paid';

export interface Badge {
  type: BadgeType;
  label: string;
}

export interface Tool {
  id: number;
  name: string;
  cat: string;
  catLabel: string;
  icon: string;
  match: string;
  desc: string;
  tags: string[];
  badges: Badge[];
  price: string;
  priceClass: string;
  rating: number;
  ratingCount: string;
  stars: string;
  featured: boolean;
  url: string;
}

export interface Review {
  id?: number;
  toolId?: number;
  name: string;
  role?: string;
  text: string;
  rating: number;
  date: string;
}
