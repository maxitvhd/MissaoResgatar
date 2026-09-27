import React from "react";
import MainLayout from "../../Layouts/MainLayout";
import AdminDashboard from "../../Components/AdminDashboard";

interface AdminDashboardProps {
  estatisticas?: {
    noticias: number;
    devocionais: number;
    eventos: number;
    galeria: number;
    regulamentos: number;
    caravanas: number;
    patrocinadores: number;
    atracoes: number;
    usuarios: number;
  };
}

export default function Dashboard({ estatisticas }: AdminDashboardProps) {
  return (
    <MainLayout>
      <AdminDashboard />
    </MainLayout>
  );
}
