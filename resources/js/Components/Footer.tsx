import React, { useEffect, useState } from "react";
import { Mail, Phone, Compass, FileText, ExternalLink, Instagram, Facebook, Youtube } from "lucide-react";
import { Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import { fetchSettings } from "../lib/api";
import { SiteSettings } from "../types";

export default function Footer() {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchSettings().then(setSettings).catch(() => setSettings(null));
  }, []);

  return (
    <footer className="bg-slate-950 border-t border-slate-900/60 py-12 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Column 1: Info and Slogan */}
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt="Missão Resgatar" className="h-8 w-auto max-w-[140px] object-contain mr-2" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-900 font-serif font-bold text-lg flex items-center justify-center mr-2 shadow glow-accent">
                  MR
                </div>
              )}
              <span className="font-serif text-slate-200 font-bold text-base tracking-wide">Missão Resgatar</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t("footer.slogan")}
            </p>
            <span className="text-[10px] text-amber-500 font-mono uppercase block">{t("footer.alwaysConnected")}</span>
            <div className="flex items-center space-x-2 mt-2">
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                  title="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                  title="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                  title="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-200">{t("footer.sitemapTitle")}</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link href="/" className="hover:text-amber-400 transition-colors">{t("footer.home")}</Link></li>
              <li><Link href="/loja" className="hover:text-amber-400 transition-colors text-amber-400/90 font-medium">Loja Oficial</Link></li>
              <li><Link href="/transparencia" className="hover:text-amber-400 transition-colors">Portal de Transparência</Link></li>
              <li><Link href="/radio" className="hover:text-amber-400 transition-colors">{t("footer.radio")}</Link></li>
              <li><Link href="/biblia" className="hover:text-amber-400 transition-colors">{t("footer.bible")}</Link></li>
              <li><Link href="/noticias" className="hover:text-amber-400 transition-colors">{t("footer.news")}</Link></li>
              <li><Link href="/devocionais" className="hover:text-amber-400 transition-colors">{t("footer.devs")}</Link></li>
              <li><Link href="/galeria" className="hover:text-amber-400 transition-colors">{t("footer.gallery")}</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact and Support */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-200">{t("footer.supportTitle")}</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li className="flex items-center"><Mail className="w-3.5 h-3.5 mr-1.5 text-amber-500/80" /> contato@mresgatar.com.br</li>
              <li className="flex items-center"><Phone className="w-3.5 h-3.5 mr-1.5 text-amber-500/80" /> www.mresgatar.com.br</li>
              <li className="flex items-center"><Compass className="w-3.5 h-3.5 mr-1.5 text-amber-500/80" /> {t("footer.partnership")}</li>
            </ul>
          </div>

          {/* Column 4: XML Sitemap SEO details */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-mono uppercase font-bold text-slate-200">{t("footer.seoTitle")}</h4>
            <p className="text-xs text-slate-500">
              {t("footer.seoDesc")}
            </p>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-mono text-amber-400 hover:border-amber-500 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 mr-1 text-amber-500" />
              <span>{t("footer.viewSitemap")}</span>
            </a>
          </div>

        </div>

        <div className="h-[1px] bg-slate-900 w-full mb-6"></div>

        {/* Bottom Copyright and requested developers credit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-slate-600 font-mono">
            &copy; {new Date().getFullYear()} Missão Resgatar. {t("footer.copyright")}
          </span>

          {/* Required designer footer credit */}
          <div className="flex items-center space-x-1.5 text-slate-500 font-mono">
            <span>{t("footer.developedBy")}</span>
            <a
              href="https://www.maximo.tec.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 font-semibold underline flex items-center"
            >
              Rede Máximo em Soluções <ExternalLink className="w-3 h-3 ml-0.5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
