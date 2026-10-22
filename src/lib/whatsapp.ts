import { CartItem, CustomerOrderInfo, Product } from '../types/index.ts';

export const WHATSAPP_PHONE = '212777172677';
export const WHATSAPP_DISPLAY_PHONE = '+212 777-172677';

export function getProductWhatsAppUrl(product: Product, quantity = 1): string {
  const total = product.prix * quantity;
  const message = [
    'Salam Rachid ! 🌱',
    `Je souhaite commander directement sur votre boutique :`,
    `• ${product.nom} (${product.prix} DH) × ${quantity} = ${total} DH`,
    '',
    'Mes coordonnées pour la livraison :',
    'Nom & Prénom : ',
    'Ville de livraison : ',
    'Adresse complète : ',
    '',
    'Paiement à la livraison (Cash on Delivery). Merci !'
  ].join('\n');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function getPackDecouverteWhatsAppUrl(packTitre: string, packPrix: number): string {
  const message = [
    'Salam Rachid ! 🌿',
    `Je souhaite commander le *${packTitre}* au tarif privilégié de ${packPrix} DH :`,
    '• 1 Légume lacto-fermenté en bocal au choix',
    '• 1 Huile de macération 50 ml au choix',
    '• 1 Savon artisanal à la luffa végétale',
    '• 1 Crème de soin 50 g en boîte métal',
    '',
    'Mes coordonnées pour la livraison :',
    'Nom & Prénom : ',
    'Ville de livraison : ',
    'Adresse : ',
    '',
    'Paiement à la livraison partout au Maroc. Merci !'
  ].join('\n');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

export function getCartWhatsAppUrl(
  items: CartItem[],
  info: CustomerOrderInfo,
  discountPercentage = 0,
  promoCode = ''
): string {
  const subtotal = items.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);
  const discountAmount = discountPercentage > 0 ? Math.round(subtotal * (discountPercentage / 100)) : 0;
  const finalTotal = subtotal - discountAmount;

  const lines: string[] = [
    'Salam Rachid ! 🌿',
    'Voici ma commande préparée sur votre boutique artisanale :',
    ''
  ];

  items.forEach((item) => {
    lines.push(`• ${item.quantity}× ${item.product.nom} (${item.product.contenance}) — ${item.product.prix * item.quantity} DH`);
  });

  lines.push('');
  lines.push(`Sous-total : ${subtotal} DH`);

  if (discountPercentage > 0 && promoCode) {
    lines.push(`Code promo appliqué : ${promoCode} (-${discountPercentage}%)`);
    lines.push(`Remise : -${discountAmount} DH`);
  }

  lines.push(`*Total estimé : ${finalTotal} DH* (hors frais d\'expédition éventuels)`);
  lines.push('');
  lines.push('Coordonnées de livraison :');
  lines.push(`• Nom & Prénom : ${info.nom || 'Non spécifié'}`);
  lines.push(`• Ville : ${info.ville || 'Non spécifiée'}`);
  lines.push(`• Adresse : ${info.adresse || 'Non spécifiée'}`);
  lines.push(`• Téléphone : ${info.telephone || 'Non spécifié'}`);

  if (info.notes && info.notes.trim()) {
    lines.push(`• Note / Instructions : ${info.notes.trim()}`);
  }

  lines.push('');
  lines.push('Mode de règlement : Paiement à la réception (Cash on Delivery)');
  lines.push('Merci pour votre savoir-faire artisanal !');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function getGeneralInquiryWhatsAppUrl(): string {
  const message = [
    'Salam Rachid ! 🌿',
    'Je vous contacte depuis votre boutique en ligne au sujet de vos préparations artisanales (lacto-fermentation, huiles, savons luffa, crèmes).'
  ].join('\n');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
