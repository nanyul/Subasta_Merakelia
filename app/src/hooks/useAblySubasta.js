// src/hooks/useAblySubasta.js
import { useEffect, useRef } from 'react';
import * as Ably from 'ably';

const ABLY_KEY = import.meta.env.VITE_ABLY_KEY || 'aTWCrg.zNVBzQ:nKXRjzPzcQE_IYa661LHgvTPOssEwfykEvXUdJNogKI';

// Singleton global — el cliente se crea una sola vez
const ablyClient = ABLY_KEY ? new Ably.Realtime({ key: ABLY_KEY }) : null;

export function useAblySubasta(idSubasta, onNuevaPuja, onSubastaCerrada) {
  // Guardamos los callbacks en refs para que el useEffect
  // NO dependa de ellos y el canal no se re-suscriba en cada render
  const onNuevaPujaRef      = useRef(onNuevaPuja);
  const onSubastaCerradaRef = useRef(onSubastaCerrada);

  // Actualizamos las refs silenciosamente sin tocar el canal
  useEffect(() => { onNuevaPujaRef.current      = onNuevaPuja;      }, [onNuevaPuja]);
  useEffect(() => { onSubastaCerradaRef.current = onSubastaCerrada; }, [onSubastaCerrada]);

  useEffect(() => {
    if (!idSubasta || !ablyClient) return;

    const channel = ablyClient.channels.get(`subasta-${idSubasta}`);

    // Las funciones locales leen el valor actual de la ref en cada llamada
    const handleNuevaPuja = (msg) => {
      if (onNuevaPujaRef.current) onNuevaPujaRef.current(msg.data);
    };

    const handleSubastaCerrada = (msg) => {
      if (onSubastaCerradaRef.current) onSubastaCerradaRef.current(msg.data);
    };

    channel.subscribe('nueva-puja',      handleNuevaPuja);
    channel.subscribe('subasta-cerrada', handleSubastaCerrada);

    return () => {
      channel.unsubscribe('nueva-puja',      handleNuevaPuja);
      channel.unsubscribe('subasta-cerrada', handleSubastaCerrada);
    };

  //Solo depende del id — el canal se crea una vez y vive estable
  }, [idSubasta]);
}