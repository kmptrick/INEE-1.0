'use client';

import { useEffect, useState } from 'react';

// Popup d'invitation « Installer l'application » (PWA INEE).
// - Android/Chrome et desktop Chrome/Edge : beforeinstallprompt → installation en un tap.
// - iOS Safari : pas de prompt natif → mode d'emploi Partager → « Sur l'écran d'accueil ».
// - Masqué si déjà installé (standalone).
// - « Plus tard » le cache 5 minutes puis il revient tant que l'app n'est pas installée
//   (l'horodatage en localStorage fait survivre le délai aux rechargements de page).
type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const DISMISS_KEY = 'inee_install_dismissed_at';
const REPROMPT_MS = 5 * 60 * 1000;
const FIRST_DELAY_MS = 2500;

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let installed = false;

    const scheduleShow = () => {
      const dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0);
      const remaining = Math.max(FIRST_DELAY_MS, dismissedAt + REPROMPT_MS - Date.now());
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => { if (!installed) setVisible(true); }, remaining);
    };

    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); scheduleShow(); };
    const onInstalled = () => { installed = true; setVisible(false); setDeferred(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);

    const ua = window.navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua)) { setIosHint(true); scheduleShow(); }

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!visible || (!deferred && !iosHint)) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    try { await deferred.userChoice; } catch { /* ignore */ }
    setDeferred(null);
    setVisible(false);
  }

  function later() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setTimeout(() => setVisible(true), REPROMPT_MS);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#C8803A]/30 bg-[#1A1008] p-4 shadow-2xl">
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">Installez l&apos;application INEE</p>
          {deferred ? (
            <p className="text-xs text-white/60">Plein écran, sur votre écran d&apos;accueil ou votre bureau.</p>
          ) : (
            <p className="text-xs text-white/60">
              Appuyez sur <b>Partager</b> (carré avec flèche ↑) en bas de Safari, puis <b>« Sur l&apos;écran d&apos;accueil »</b>.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            {deferred && (
              <button onClick={install} className="rounded-full bg-[#C8803A] px-4 py-1.5 text-xs font-semibold text-[#1A1008] hover:bg-[#D9924E]">
                Installer
              </button>
            )}
            <button onClick={later} className="rounded-full px-3 py-1.5 text-xs font-medium text-white/50 hover:text-white/80">
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
