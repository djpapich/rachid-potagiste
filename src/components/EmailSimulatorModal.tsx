import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Package, Truck, ArrowLeft, Send } from 'lucide-react';
import { storeService } from '../services/storeService.ts';
import { EmailNotification } from '../types/index.ts';

interface EmailSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSimulatorModal: React.FC<EmailSimulatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const emails = storeService.getEmails();
  const [selectedEmail, setSelectedEmail] = useState<EmailNotification | null>(
    emails.length > 0 ? emails[0] : null
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-800" />
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-stone-900 font-serif">
                Boîte Mail Client · Notifications d'Expédition
              </h2>
              <p className="text-[11px] text-stone-500">
                Aperçu fidèle des emails automatiques expédiés à chaque étape de livraison.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* List of Sent Emails */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Historique des notifications émises ({emails.length})
            </span>

            <div className="grid grid-cols-1 gap-2">
              {emails.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setSelectedEmail(e)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedEmail?.id === e.id
                      ? 'border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700'
                      : 'border-stone-200 bg-[#FBFBF9] hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-900">
                    <span className="truncate pr-2">{e.subject}</span>
                    <span className="text-[11px] text-stone-400 font-mono shrink-0">
                      {new Date(e.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-1">
                    <span>Destinataire : {e.to}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-emerald-800 font-semibold">{e.orderNumber}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Email Preview Template Container */}
          {selectedEmail && (
            <div className="mt-4 rounded-xl border border-stone-300 overflow-hidden shadow-xs bg-white">
              {/* Fake Email Client Metadata */}
              <div className="bg-stone-100 p-3 border-b border-stone-200 text-xs text-stone-600 space-y-1">
                <div><span className="font-semibold text-stone-800">De :</span> The Green Souk &lt;contact@thegreensouk.com&gt;</div>
                <div><span className="font-semibold text-stone-800">À :</span> {selectedEmail.to}</div>
                <div><span className="font-semibold text-stone-800">Objet :</span> {selectedEmail.subject}</div>
                <div><span className="font-semibold text-stone-800">Date :</span> {new Date(selectedEmail.sentAt).toLocaleString('fr-FR')}</div>
              </div>

              {/* Branded HTML Email Body */}
              <div className="p-6 space-y-6 bg-[#FCFCFA]">
                {/* Brand header */}
                <div className="bg-[#1F3A2B] text-white p-4 rounded-lg flex items-center justify-between">
                  <div className="font-serif font-bold text-lg tracking-tight">The Green Souk</div>
                  <div className="text-[11px] text-emerald-200 font-medium tracking-wide uppercase">
                    Terroir & Épicerie Bio
                  </div>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-stone-800 leading-relaxed">
                  <div className="whitespace-pre-line bg-white p-4 rounded-lg border border-stone-200/80">
                    {selectedEmail.content}
                  </div>

                  <div className="bg-emerald-50/70 p-4 rounded-lg border border-emerald-100 text-xs text-emerald-950 space-y-1.5">
                    <p className="font-semibold">Engagement Éco-Responsable The Green Souk :</p>
                    <ul className="list-disc list-inside space-y-0.5 text-emerald-900">
                      <li>Emballage 100% recyclable certifié zéro plastique.</li>
                      <li>Produits issus de terroirs protégés et certifiés Ecocert.</li>
                      <li>Livraison compensée carbone auprès de nos partenaires.</li>
                    </ul>
                  </div>

                  <div className="text-center pt-2">
                    <div className="inline-block px-5 py-2.5 bg-[#1F3A2B] text-white rounded-lg text-xs font-semibold shadow-xs">
                      Suivre mon colis en direct
                    </div>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="text-center text-[10px] text-stone-400 pt-4 border-t border-stone-200 space-y-1">
                  <p>The Green Souk SARL · Terroir & Agriculture Biologique</p>
                  <p>Vous recevez cet email transactionnel automatisé car vous avez passé commande sur www.thegreensouk.com</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#FBFBF9] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            Fermer le simulateur
          </button>
        </div>

      </div>
    </div>
  );
};
