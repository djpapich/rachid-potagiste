export type Language = 'fr' | 'ar';

export type ProductFamily = 'lacto-fermentes' | 'huiles' | 'savons' | 'cremes';

export interface ProductBadge {
  label: string;
  type: 'green' | 'dark' | 'darkgreen';
}

export interface Product {
  id: string;
  nom: string;
  famille: ProductFamily;
  familleLabel: string;
  accroche: string;
  contenance: string;
  poidsNet: string;
  prix: number; // in MAD
  couleur: string;
  image: string;
  imagePng: string;
  badges: ProductBadge[];
  description: string;
  ingredients: string;
  pointsForts: string[];
  conseils: string;
  conservation: string;
  precautions: string;
  dlc: string;
  enStock: boolean;
}

export interface PromoConfig {
  active: boolean;
  code: string;
  remisePourcentage: number;
  message: string;
  sousTitre: string;
  dateFin: string;
  packDecouverte: {
    titre: string;
    description: string;
    prixNormal: number;
    prixPromo: number;
    economie: string;
  };
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerOrderInfo {
  nom: string;
  ville: string;
  adresse: string;
  telephone: string;
  notes?: string;
  codePromo?: string;
}
