import React from "react";
import { UserPlus } from "lucide-react";
import { useForm, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const { data, setData, post, processing, errors } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post("/registro");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-6 h-6 text-amber-400" />
          </div>

<h3 className="text-lg font-serif font-bold text-slate-200">{t("auth.registerTitle")}</h3>
           <p className="text-xs text-slate-400 mt-1">{t("auth.registerDesc")}</p>

          {Object.keys(errors).length > 0 && (
            <div className="mt-4 space-y-2">
              {Object.values(errors).map((msg, i) => (
                <div key={i} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-mono text-left">
                  {msg}
                </div>
              ))}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4 mt-6 text-left">
            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("auth.fullName")}</label>
              <input
                type="text"
                placeholder={t("auth.namePlaceholder")}
                required
                value={data.name}
                onChange={(e) => setData("name", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

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
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("auth.passwordMin")}</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={data.password}
                onChange={(e) => setData("password", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">{t("auth.confirmPassword")}</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={data.password_confirmation}
                onChange={(e) => setData("password_confirmation", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold shadow transition-all cursor-pointer flex items-center justify-center disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              <span>{processing ? t("auth.registering") : t("auth.createAccount")}</span>
            </button>
          </form>

          <p className="text-[11px] text-slate-500 mt-4">
{t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-amber-400 hover:underline font-semibold">
              {t("auth.loginLink")}
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
