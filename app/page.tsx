"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PUCVLogo } from "@/components/pucv-logo";
import { Button } from "@/components/ui/button";
import ChatbotPage from "./main/page";

export default function IdentificationPage() {
  
  // Estado para almacenar la identificación del usuario
  const [email, setEmail] = useState("");
  // Estado para controlar si el usuario está identificado
  const [isIdentified, setIsIdentified] = useState(false);
  // Estado para mensajes de error
  const [error, setError] = useState<string | null>(null);
  
  // Manejo de la identificación del usuario
  const handleIdentification = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^\w+\.\w+\.\w+@mail\.pucv\.cl$/;
    if (!email.trim()) {
      setError("Debes ingresar tu correo institucional.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("El correo no cumple con el formato institucional.");
      return;
    }
    setError(null);
    setIsIdentified(true);
  };

  // Simplificar getThemeColors para que solo devuelva colores del modo claro
  const getThemeColors = () => {
    return {
      bg: "bg-[#F8FAFC]",
      card: "bg-white",
      accent: "bg-[#4361EE]",
      text: "text-gray-900",
      highlight: "text-[#4361EE]",
      button: "bg-[#4361EE] hover:bg-[#3A56D4]",
      buttonText: "text-white",
      input: "bg-white border-gray-200",
      selected: "border-green-500",
      notSelected: "border-red-500",
    };
  };

  const colors = getThemeColors();

  if (isIdentified) {
    return <ChatbotPage email={email} />;
  }

  return (
    <div className={`flex flex-col h-svh ${colors.bg} ${colors.text} overflow-hidden`}>
      {/* Header fijo */}
      <header className="p-2 flex justify-between items-center border-b shrink-0">
        <PUCVLogo />
      </header>

      {/* Contenedor para identificarte */}
      <main className="flex-1 container mx-auto p-2 flex flex-col overflow-hidden justify-center items-center content-center">
        <Card className="w-2/3 flex flex-col space-y-4 p-8 items-center">
          <h1 className="font-semibold text-xl ">
            Identifícate con tu correo institucional
          </h1>
          <form onSubmit={handleIdentification} className="flex-1 flex gap-2 w-full px-4">
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre.apellido.a@mail.pucv.cl"
              className={`flex-1 ${colors.input}`}
            />
            <Button
              type="submit"
              className={`${colors.button} ${colors.buttonText}`}
            >
              Ingresar
            </Button>
            
          </form>
          {error && (
            <div className="text-red-600 text-sm px-6 self-start">{error}</div>
          )}
        </Card>
      </main>
    </div>
  );
}
