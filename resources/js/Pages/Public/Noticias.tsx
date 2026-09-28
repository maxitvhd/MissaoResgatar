import React from "react";
import MainLayout from "../../Layouts/MainLayout";
import NewsSection from "../../Components/NewsSection";
import { NewsPost } from "../../types";

interface NoticiasPageProps {
  noticias?: NewsPost[];
  meta?: { total: number; pagina: number; ultima_pagina: number };
  categorias?: any[];
}

export default function Noticias(props: NoticiasPageProps) {
  return (
    <MainLayout>
      <NewsSection 
        initialPosts={props.noticias} 
        meta={props.meta}
        initialCategories={props.categorias}
      />
    </MainLayout>
  );
}
