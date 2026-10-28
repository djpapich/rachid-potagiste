import { CartItem, CustomerOrderInfo, Language, Product } from '../types/index.ts';
import { LIMITS, MAX_PROMO_PERCENT, clampQuantity, cleanText } from './validation.ts';

export const WHATSAPP_LINE_1 = '212786731666';
export const WHATSAPP_LINE_1_DISPLAY = '07 86 73 16 66';

export const WHATSAPP_LINE_2 = '212721045801';
export const WHATSAPP_LINE_2_DISPLAY = '07 21 04 58 01';

export const WHATSAPP_PHONE = WHATSAPP_LINE_1;
export const WHATSAPP_DISPLAY_PHONE = WHATSAPP_LINE_1_DISPLAY;

/**
 * Opens a WhatsApp link in a new tab. Refuses anything that is not https://wa.me/...
 * and never gives the new tab access to window.opener.
 */
export function openWhatsApp(url: string): void {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'wa.me') return;
  } catch {
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function getPhoneNumber(line: 'line1' | 'line2' = 'line1'): string {
  return line === 'line2' ? WHATSAPP_LINE_2 : WHATSAPP_LINE_1;
}

export function getProductWhatsAppUrl(
  product: Product,
  quantity = 1,
  line: 'line1' | 'line2' = 'line1',
  lang: Language = 'fr'
): string {
  quantity = clampQuantity(quantity);
  const phone = getPhoneNumber(line);
  const total = product.prix * quantity;

  let message = '';
  if (lang === 'ar') {
    const prodName = product.nomAr || product.nom;
    message = [
      'السلام عليكم سي رشيد ! 🌱',
      'أود طلب هذا المنتج الطبيعي من بستانكم :',
      `• ${prodName} (${product.prix} درهم) × ${quantity} = ${total} درهم`,
      '',
      'معلومات التوصيل :',
      'الاسم والنسب : ',
      'المدينة : ',
      'العنوان بالتفصيل : ',
      'الهاتف : ',
      '',
      'الدفع نقداً عند الاستلام. شكراً جزيلاً !'
    ].join('\n');
  } else if (lang === 'en') {
    const prodName = product.nomEn || product.nom;
    message = [
      'Hello Rachid! 🌱',
      'I would like to order directly from your handcrafted shop:',
      `• ${prodName} (${product.prix} MAD) × ${quantity} = ${total} MAD`,
      '',
      'My delivery details:',
      'Full Name: ',
      'City: ',
      'Address: ',
      'Phone: ',
      '',
      'Cash on delivery. Thank you!'
    ].join('\n');
  } else {
    message = [
      'Bonjour Rachid ! 🌱',
      'Je souhaite commander sur votre boutique artisanale :',
      `• ${product.nom} (${product.prix} DH) × ${quantity} = ${total} DH`,
      '',
      'Mes coordonnées pour la livraison :',
      'Nom & Prénom : ',
      'Ville de livraison : ',
      'Adresse complète : ',
      'Téléphone : ',
      '',
      'Paiement à la livraison (Cash on Delivery). Merci !'
    ].join('\n');
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getPackDecouverteWhatsAppUrl(
  packTitre: string,
  packPrix: number,
  line: 'line1' | 'line2' = 'line1'
): string {
  const phone = getPhoneNumber(line);
  const message = [
    'Salam Rachid ! 🌿',
    `Je souhaite commander le *${packTitre}* au tarif privilégié de ${packPrix} DH :`,
    '• 1 Légume lacto-fermenté en bocal au choix (70 ou 80 DH)',
    '• 1 Huile de macération 50 ml au choix (70 ou 80 DH)',
    '• 1 Savon artisanal à la luffa végétale (45 DH)',
    '• 1 Crème de soin 50 g en boîte métal (70 ou 80 DH)',
    '',
    'Mes coordonnées pour la livraison :',
    'Nom & Prénom : ',
    'Ville de livraison : ',
    'Adresse : ',
    'Téléphone : ',
    '',
    'Paiement en espèces à la livraison. Merci !'
  ].join('\n');

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function getCartWhatsAppUrl(
  items: CartItem[],
  info: CustomerOrderInfo,
  discountPercentage = 0,
  promoCode = '',
  line: 'line1' | 'line2' = 'line1',
  lang: Language = 'fr'
): string {
  const phone = getPhoneNumber(line);
  items = items.map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }));
  discountPercentage = Math.min(MAX_PROMO_PERCENT, Math.max(0, discountPercentage || 0));
  promoCode = cleanText(promoCode, 32);
  const safe = {
    nom: cleanText(info.nom, LIMITS.nom),
    ville: cleanText(info.ville, LIMITS.ville),
    adresse: cleanText(info.adresse, LIMITS.adresse),
    telephone: cleanText(info.telephone, LIMITS.telephone),
    notes: cleanText(info.notes, LIMITS.notes),
  };
  const subtotal = items.reduce((sum, item) => sum + item.product.prix * item.quantity, 0);
  const discountAmount = discountPercentage > 0 ? Math.round(subtotal * (discountPercentage / 100)) : 0;
  const finalTotal = subtotal - discountAmount;

  const lines: string[] = [];

  if (lang === 'ar') {
    lines.push('السلام عليكم سي رشيد ! 🌿');
    lines.push('أود تأكيد طلبيتي من المنتجات الطبيعية :');
    lines.push('');
    items.forEach((item) => {
      const name = item.product.nomAr || item.product.nom;
      lines.push(`• ${item.quantity}× ${name} (${item.product.prix * item.quantity} درهم)`);
    });
    lines.push('');
    lines.push(`المجموع الجزئي : ${subtotal} درهم`);
    if (discountPercentage > 0 && promoCode) {
      lines.push(`كود التخفيض : ${promoCode} (-${discountPercentage}%)`);
      lines.push(`الخصم : -${discountAmount} درهم`);
    }
    lines.push(`*المجموع الإجمالي : ${finalTotal} درهم* (الدفع عند الاستلام)`);
    lines.push('');
    lines.push('بيانات التوصيل :');
    lines.push(`• الاسم والنسب : ${safe.nom || '...'}`);
    lines.push(`• المدينة : ${safe.ville || '...'}`);
    lines.push(`• العنوان : ${safe.adresse || '...'}`);
    lines.push(`• الهاتف : ${safe.telephone || '...'}`);
    if (safe.notes) {
      lines.push(`• ملاحظة : ${safe.notes}`);
    }
    lines.push('');
    lines.push('شكراً لكم وعلى جودة منتجاتكم الطبيعية !');
  } else if (lang === 'en') {
    lines.push('Hello Rachid! 🌿');
    lines.push('Here is my selection from your artisan store:');
    lines.push('');
    items.forEach((item) => {
      const name = item.product.nomEn || item.product.nom;
      lines.push(`• ${item.quantity}× ${name} (${item.product.prix * item.quantity} MAD)`);
    });
    lines.push('');
    lines.push(`Subtotal: ${subtotal} MAD`);
    if (discountPercentage > 0 && promoCode) {
      lines.push(`Promo code: ${promoCode} (-${discountPercentage}%)`);
      lines.push(`Discount: -${discountAmount} MAD`);
    }
    lines.push(`*Estimated Total: ${finalTotal} MAD*`);
    lines.push('');
    lines.push('Delivery Details:');
    lines.push(`• Full Name: ${safe.nom || '...'}`);
    lines.push(`• City: ${safe.ville || '...'}`);
    lines.push(`• Address: ${safe.adresse || '...'}`);
    lines.push(`• Phone: ${safe.telephone || '...'}`);
    if (safe.notes) {
      lines.push(`• Note: ${safe.notes}`);
    }
    lines.push('');
    lines.push('Cash on delivery across Morocco. Thank you!');
  } else {
    lines.push('Bonjour Rachid ! 🌿');
    lines.push('Voici ma commande préparée sur votre boutique :');
    lines.push('');
    items.forEach((item) => {
      lines.push(`• ${item.quantity}× ${item.product.nom} (${item.product.prix * item.quantity} DH)`);
    });
    lines.push('');
    lines.push(`Sous-total : ${subtotal} DH`);
    if (discountPercentage > 0 && promoCode) {
      lines.push(`Code promo : ${promoCode} (-${discountPercentage}%)`);
      lines.push(`Remise : -${discountAmount} DH`);
    }
    lines.push(`*Total estimé : ${finalTotal} DH*`);
    lines.push('');
    lines.push('Coordonnées de livraison :');
    lines.push(`• Nom & Prénom : ${safe.nom || '...'}`);
    lines.push(`• Ville : ${safe.ville || '...'}`);
    lines.push(`• Adresse : ${safe.adresse || '...'}`);
    lines.push(`• Téléphone : ${safe.telephone || '...'}`);
    if (safe.notes) {
      lines.push(`• Note : ${safe.notes}`);
    }
    lines.push('');
    lines.push('Paiement à la livraison. Merci !');
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}

export function getGeneralInquiryWhatsAppUrl(
  line: 'line1' | 'line2' = 'line1',
  lang: Language = 'fr'
): string {
  const phone = getPhoneNumber(line);
  let message = '';
  if (lang === 'ar') {
    message = 'السلام عليكم سي رشيد ! 🌿 أتواصل معكم من المتجر للاستفسار والطلب...';
  } else if (lang === 'en') {
    message = 'Hello Rachid! 🌿 I am contacting you from your online store regarding your handcrafted products.';
  } else {
    message = 'Bonjour Rachid ! 🌿 Je vous contacte depuis votre boutique au sujet de vos préparations artisanales.';
  }
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
