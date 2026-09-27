import React from "react";
import MainLayout from "../../Layouts/MainLayout";
import PersonalNotes from "../../Components/PersonalNotes";
import { router, usePage } from "@inertiajs/react";

interface PageProps {
  [key: string]: unknown;
  auth?: {
    user?: { id: number; name: string; email: string; role: string } | null;
  };
}

export default function Notas() {
  const { auth } = usePage<PageProps>().props;
  const currentUser = auth?.user ?? null;

  return (
    <MainLayout>
      <PersonalNotes
        currentUser={currentUser as any}
        onLoginClick={() => router.visit("/login")}
      />
    </MainLayout>
  );
}
