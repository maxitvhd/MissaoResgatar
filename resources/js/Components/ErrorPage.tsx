import React from "react";
import { Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

interface ErrorPageProps {
  status: number;
  title?: string;
  message?: string;
}

export default function ErrorPage({ status }: ErrorPageProps) {
  const { t } = useTranslation();
  const messages: Record<number, { title: string; message: string }> = {
    403: { title: t("errors.403title"), message: t("errors.403msg") },
    404: { title: t("errors.404title"), message: t("errors.404msg") },
    419: { title: t("errors.419title"), message: t("errors.419msg") },
    500: { title: t("errors.500title"), message: t("errors.500msg") },
    503: { title: t("errors.503title"), message: t("errors.503msg") },
  };
  const content = messages[status] ?? { title: t("errors.generic"), message: t("errors.genericMsg") };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-serif font-bold text-amber-400">{status}</div>
        <h1 className="mt-4 text-2xl font-serif font-bold text-slate-200">{content.title}</h1>
        <p className="mt-2 text-sm text-slate-400">{content.message}</p>
        <Link
          href="/"
          className="mt-8 inline-flex px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold transition-all"
        >
          {t("errors.back")}
        </Link>
      </div>
    </div>
  );
}
