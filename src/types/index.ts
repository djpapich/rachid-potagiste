export type Language = 'fr' | 'ar' | 'en';
export type AppTheme = 'light' | 'dark';

export type ProductFamily = 'lacto-fermentes' | 'huiles' | 'savons' | 'cremes';

export interface ProductBadge {
  label: string;
  labelAr?: string;
  type: 'green' | 'dark' | 'darkgreen';
}

export interface Product {
  id: string;
  nom: string;
  nomAr?: string;
  nomEn?: string;
  famille: ProductFamily;
  familleLabel: string;
  familleLabelAr?: string;
  familleLabelEn?: string;
  accroche: string;
  accrocheAr?: string;
  accrocheEn?: string;
  contenance: string;
  contenanceAr?: string;
  contenanceEn?: string;
  poidsNet: string;
  prix: number; // in MAD
  couleur: string;
  image: string;
  imagePng: string;
  badges: ProductBadge[];
  description: string;
  descriptionAr?: string;
  descriptionEn?: string;
  ingredients: string;
  ingredientsAr?: string;
  ingredientsEn?: string;
  pointsForts: string[];
  pointsFortsAr?: string[];
  pointsFortsEn?: string[];
  conseils: string;
  conseilsAr?: string;
  conseilsEn?: string;
  conservation: string;
  conservationAr?: string;
  conservationEn?: string;
  precautions: string;
  precautionsAr?: string;
  precautionsEn?: string;
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
  whatsappLine?: 'line1' | 'line2';
}

export type PageView = 
  | { type: 'home' }
  | { type: 'category'; family: ProductFamily }
  | { type: 'product'; productId: string }
  | { type: 'cart' }
  | { type: 'about' }
  | { type: 'contact' }
  | { type: 'notfound' };
