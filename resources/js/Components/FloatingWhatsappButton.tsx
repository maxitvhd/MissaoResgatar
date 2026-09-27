import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { fetchSettings } from "../lib/api";

export default function FloatingWhatsappButton() {
  const [phone, setPhone] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const [loaded, setLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    fetchSettings()
      .then((data) => {
        if (!isMounted) return;
        const num = data.whatsappFlutuante || data.whatsappLoja || "";
        const msg = data.mensagemWhatsappFlutuante || "Olá! Paz do Senhor, gostaria de mais informações sobre a Missão Resgatar.";
        setPhone(num);
        setMessage(msg);
        setLoaded(true);
      })
      .catch((err) => {
        console.error("Erro ao carregar configuracoes do WhatsApp:", err);
        setLoaded(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loaded || !phone) return null;

  // Sanitiza o número para formato wa.me (somente dígitos)
  let cleanNumber = phone.replace(/\D/g, "");
  if (cleanNumber.length === 10 || cleanNumber.length === 11) {
    cleanNumber = "55" + cleanNumber;
  }

  if (!cleanNumber) return null;

  const handleOpenWhatsapp = () => {
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMsg}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip Balão de Diálogo */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/95 text-slate-100 text-xs px-3.5 py-2 rounded-2xl border border-emerald-500/40 shadow-xl backdrop-blur-md animate-fadeIn">
          <span>Fale conosco no <strong>WhatsApp</strong></span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
            }}
            className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Botão Flutuante */}
      <button
        type="button"
        onClick={handleOpenWhatsapp}
        className="relative group w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all cursor-pointer border-2 border-emerald-300/40"
        title="Atendimento via WhatsApp"
        aria-label="Atendimento via WhatsApp"
      >
        {/* Pulsing ring background */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />

        <MessageCircle className="w-7 h-7 fill-current text-slate-950 relative z-10" />

        {/* Badge Online */}
        <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-300 border-2 border-slate-950 rounded-full z-20" />
      </button>
    </div>
  );
}
