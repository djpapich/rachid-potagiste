import React from 'react';
import { ShoppingBag, MessageCircle, Truck, Check } from 'lucide-react';

export const HowToOrder: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Sélectionnez vos créations',
      desc: 'Parcourez les 4 familles : bocaux lacto-fermentés vivants, flacons d\'huiles de 50 ml, savons à la luffa et crèmes de soin 50 g.',
      icon: <ShoppingBag className="w-5 h-5 text-[#8C6D23]" />,
    },
    {
      num: '2',
      title: 'Envoyez sur WhatsApp',
      desc: 'Un clic sur « Commander » génère automatiquement votre message pré-rempli avec votre sélection. Rachid vous répond personnellement.',
      icon: <MessageCircle className="w-5 h-5 text-[#25D366]" />,
    },
    {
      num: '3',
      title: 'Livraison & Paiement cash',
      desc: 'Expédition rapide partout au Maroc. Vous vérifiez votre colis et réglez en espèces (Cash on Delivery) directement au livreur.',
      icon: <Truck className="w-5 h-5 text-[#1F3D2B]" />,
    },
  ];

  return (
    <section className="py-14 sm:py-18 bg-[#FBFAF5] border-b border-[#E5DFC9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8C6D23] mb-1 block">
            Simplicité & Proximité
          </span>
          <h2 className="font-title text-2xl sm:text-3xl md:text-4xl font-black text-[#1F3D2B] mb-2">
            Comment Passer Commande ?
          </h2>
          <p className="font-script text-xl text-[#8C6D23] font-bold italic">
            « Pas de compte compliqué, juste un échange direct entre vous et nous »
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#F4F1EA] rounded-2xl p-6 border border-[#E5DFC9] relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FBFAF5] border border-[#D7CEBA] flex items-center justify-center shadow-xs">
                    {step.icon}
                  </div>
                  <span className="text-2xl font-black font-title text-[#C9A227]">
                    0{step.num}
                  </span>
                </div>

                <h3 className="font-title text-base sm:text-lg font-bold text-[#1F3D2B] mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-[#1F3D2B]/80 leading-relaxed">
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5DFC9] text-[11px] text-[#3F6B2E] font-semibold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>Étape simple & sans inscription</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
