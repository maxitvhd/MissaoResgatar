import React from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import FloatingWhatsappButton from "../Components/FloatingWhatsappButton";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-amber-400 selection:text-slate-900 w-full max-w-full overflow-x-hidden relative">
      <Navbar />
      <main className="flex-grow w-full max-w-full overflow-x-hidden">{children}</main>
      <Footer />
      <FloatingWhatsappButton />
    </div>
  );
}
