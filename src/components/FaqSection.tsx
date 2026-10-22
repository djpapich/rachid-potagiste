import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Comment se passe la livraison partout au Maroc et quels sont les délais ?',
      answer: 'Nous expédions nos colis depuis Bouznika vers toutes les villes du Maroc (Casablanca, Rabat, Marrakech, Fès, Tanger, Agadir, Oujda, Meknès, etc.). Les délais habituels sont de 24h à 48h ouvrées. Le règlement se fait en espèces (Cash on Delivery) directement au livreur lors de la réception de votre colis.'
    },
    {
      question: 'Pourquoi choisir des légumes lacto-fermentés plutôt que des conserves au vinaigre ?',
      answer: 'Les conserves industrielles au vinaigre sont pasteurisées : les micro-organismes y sont morts. La lacto-fermentation spontanée au sel est une méthode vivante millénaire : les bactéries lactiques prolifèrent naturellement, enrichissent les légumes en vitamines C et B, prédigèrent les fibres et apportent une biodiversité remarquable à votre flore intestinale.'
    },
    {
      question: 'Combien de temps se conservent les bocaux après ouverture ?',
      answer: 'Tant que les légumes restent immergés dans leur saumure naturelle et conservés au réfrigérateur, ils se conservent plusieurs mois sans s\'altérer. Veillez simplement à toujours prélever les légumes avec une fourchette propre pour ne pas introduire de corps étrangers.'
    },
    {
      question: 'Comment utiliser les huiles de macération 50 ml ?',
      answer: 'Nos flacons pompe permettent un dosage hygiénique goutte à goutte. Elles s\'utilisent en soin cutané quotidien ou en bain d\'huile pour le cuir chevelu (ortie, romarin). Attention : nos macérats sont réservés à un usage externe uniquement.'
    },
    {
      question: 'Quelles sont les précautions pour la crème de soin respiratoire (anti-grippe) ?',
      answer: 'Cette crème est un baume pectoral traditionnel enrichi en macérats de thym, eucalyptus et marrube blanc. Elle est à usage externe exclusif (en massage sur la poitrine et la gorge). Elle ne remplace en aucun cas un avis ou un traitement médical. Elle est déconseillée aux enfants de moins de 6 ans et aux femmes enceintes.'
    }
  ];

  return (
    <section id="faq" className="py-14 sm:py-18 bg-[#F4F1EA] border-b border-[#E5DFC9] scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAE4D2] text-xs font-semibold text-[#8C6D23] mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#3F6B2E]" />
            <span>Foire Aux Questions</span>
          </div>
          <h2 className="font-title text-2xl sm:text-3xl font-black text-[#1F3D2B] mb-2">
            Questions Fréquentes
          </h2>
          <p className="text-xs sm:text-sm text-[#1F3D2B]/75">
            Toutes les réponses pour bien choisir et conserver vos préparations.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-[#FBFAF5] rounded-2xl border border-[#E5DFC9] overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-title text-sm sm:text-base font-bold text-[#1F3D2B] hover:text-[#3F6B2E] transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#8C6D23] shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-[#1F3D2B]/85 leading-relaxed border-t border-[#E5DFC9]/60 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
