import React from 'react';
import { X, Bell, Package, Check, Sparkles, RefreshCw } from 'lucide-react';
import { PushNotification } from '../types/index.ts';
import { storeService } from '../services/storeService.ts';

interface NotificationToastProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: PushNotification[];
}

export const NotificationPanel: React.FC<NotificationToastProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    storeService.markNotificationsAsRead();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between border-l border-stone-200 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-800" />
            <h2 className="text-sm sm:text-base font-semibold text-stone-900 font-serif">
              Notifications Push en Direct
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifs List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-stone-500 pb-2 border-b border-stone-100">
            <span>Flux temps réel ({notifications.length})</span>
            <button
              onClick={handleMarkAllRead}
              className="text-emerald-800 hover:text-emerald-950 font-medium underline cursor-pointer"
            >
              Tout marquer comme lu
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              Aucune notification pour le moment.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-xl border transition-all text-xs space-y-1 ${
                  n.isRead === 0
                    ? 'border-emerald-200 bg-emerald-50/50 shadow-xs'
                    : 'border-stone-100 bg-[#FBFBF9]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                    {n.type === 'order' && <Package className="w-3.5 h-3.5 text-emerald-700" />}
                    {n.type === 'stock' && <RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
                    {n.type === 'tips' && <Sparkles className="w-3.5 h-3.5 text-emerald-700" />}
                    {n.title}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {new Date(n.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-stone-600 leading-relaxed text-[11px]">{n.body}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-[#FBFBF9] text-center text-[11px] text-stone-500">
          Système de Push Web activé · Chiffrement AES-256
        </div>

      </div>
    </div>
  );
};
