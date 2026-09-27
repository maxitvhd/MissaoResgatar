import React from "react";
import { ShieldCheck, LogIn } from "lucide-react";
import { useForm, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors } = useForm({
    email: "",
    password: "",
    lembrar: false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
          </div>

<h3 className="text-lg font-serif font-bold text-slate-200">{t("auth.loginTitle")}</h3>
           <p className="text-xs text-slate-400 mt-1">{t("auth.loginDesc")}</p>

          {errors.email && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono text-left">
              {errors.email}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4 mt-6 text-left">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("auth.email")}</label>
              <input
                type="email"
                placeholder="exemplo@email.com"
                required
                value={data.email}
                onChange={(e) => setData("email", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("auth.password")}</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <label className="flex items-center space-x-2 text-[11px] text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={data.lembrar}
                onChange={(e) => setData("lembrar", e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
              />
              <span>{t("auth.remember")}</span>
            </label>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold shadow transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              <span>{processing ? t("auth.authenticating") : t("auth.enterSync")}</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500 mt-4">
{t("auth.noAccount")}{" "}
            <Link href="/registro" className="text-amber-400 hover:underline font-semibold">
              {t("auth.createAccount")}
            </Link>
          </p>
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-4 font-mono">
          <Link href="/" className="hover:text-amber-400 transition-colors">← {t("auth.backToPortal")}</Link>
        </p>
      </div>
    </div>
  );
}
