import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {Search, Menu } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import Head from "next/head";
import Header from "../components/header";
import { useState } from "react";
import SquareGrid from "@/components/SquareGrid";

export default function Component() {
  const [showGame, setShowGame] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <Header />

      {/* Main body + Game */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className={`space-y-2 text-4xl font-bold transition-opacity duration-700 ${showGame ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white font-custom">
                  recoil
                </h1>
              </div>
              <div className="space-x-4">
                <Button onClick={() => setShowGame(true)} className={`px-6 py-3 text-lg font-medium text-black bg-white rounded-md transition-opacity duration-700 ${showGame ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                  play
                </Button>
              </div>

            {/* Game Content */}
            <div className={`transition-opacity duration-700 ${showGame ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            <SquareGrid />
              <h2 className="text-3xl font-semibold text-white">Game Content</h2>
              <p className="mt-4 text-lg text-white">
                Here's where the main game content will appear.
              </p>
            </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full py-1 bg-black">
        <p className="text-xs text-white font-minimal text-center">made by: for hacktx 2024 :)</p>
      </footer>
    </div>
  )
}