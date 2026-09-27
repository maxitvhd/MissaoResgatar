import React from "react";
import { ShieldCheck, ExternalLink } from "lucide-react";
import MainLayout from "../../Layouts/MainLayout";
import { Regulation } from "../../types";
import { useTranslation } from "react-i18next";

interface RegulamentosProps {
  regulamentos: Regulation[];
}

export default function Regulamentos(props: RegulamentosProps) {
  const { t } = useTranslation();
  const regulamentos = (props.regulamentos as any)?.data ?? props.regulamentos ?? [];
  return (
    <MainLayout>
      <section className="py-16 bg-[#080b13] min-h-[70vh]">
        <div className="max-w-5xl mx-auto px-4">

          <div className="text-center mb-12">
            <div className="inline-flex items-center px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400 text-xs font-mono mb-4 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> {t("home.regBadge")}
            </div>
            <h3 className="text-3xl font-serif font-bold text-slate-200">{t("home.regTitle")}</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              {t("home.regDesc")}
            </p>
          </div>

          {!regulamentos || regulamentos.length === 0 ? (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800/80 rounded-2xl">
              <p className="text-sm text-slate-500">{t("home.regEmpty")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {regulamentos.map((reg: any) => (
                <div
                  key={reg.id}
                  className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/80 hover:border-amber-500/20 transition-all duration-300 relative group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-[9px] font-mono text-amber-500 uppercase border border-slate-800">
                        {reg.category}
                      </span>
                    </div>
                    <h4 className="text-sm sm:text-base font-serif font-bold text-slate-100 mt-2">{reg.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{reg.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-850 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-500">{t("home.regCity")}</span>
                    <a
                      href={reg.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[11px] font-mono text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <span>{t("home.regAccess")}</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
