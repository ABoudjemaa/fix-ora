"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Wrench,
  Cog,
  Calendar,
  Bell,
  Menu,
  CheckCircle2,
  ArrowRight,
  Mail,
  FileText,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

  export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Fix-ora"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-xl font-bold">Fix-ora</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="#"
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                Accueil
              </Link>
              <Link
                href="#fonctionnalites"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Fonctionnalités
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Machines
              </Link>
              <Link
                href="#notifications"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Notifications
              </Link>
              <Link
                href="#contact"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
              >
                Contact
              </Link>
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Se connecter</Link>
              </Button>
              <Button asChild>
                <Link href="/login">Créer un compte</Link>
              </Button>
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    href="#"
                    className="text-sm font-medium transition-colors hover:text-primary"
                  >
                    Accueil
                  </Link>
                  <Link
                    href="#fonctionnalites"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Fonctionnalités
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Machines
                  </Link>
                  <Link
                    href="#notifications"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Notifications
                  </Link>
                  <Link
                    href="#contact"
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                  >
                    Contact
                  </Link>
                  <Separator className="my-4" />
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/login">Se connecter</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/login">Créer un compte</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
        <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="secondary">Maintenance préventive</Badge>
            <Badge variant="secondary">Notifications automatiques</Badge>
            <Badge variant="secondary">Gestion des pièces</Badge>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Anticipez la maintenance de vos machines avec{" "}
            <span className="text-primary">Fix-ora</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
            Plateforme intelligente de suivi des machines, des pièces et des
            opérations de maintenance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/login">
                Commencer maintenant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="#fonctionnalites">Voir les fonctionnalités</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Section Fonctionnalités clés */}
      <section
        id="fonctionnalites"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-muted/50"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Fonctionnalités clés
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Toutes les fonctionnalités dont vous avez besoin pour optimiser la
            maintenance de vos équipements industriels
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Gestion des machines */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Cog className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Gestion des machines</CardTitle>
              </div>
              <CardDescription>
                Centralisez toutes les informations de vos équipements
                industriels en un seul endroit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Nom, numéro de série, date de création</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Suivi des heures d&apos;utilisation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Historique complet des interventions</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Suivi des pièces */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wrench className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Suivi des pièces</CardTitle>
              </div>
              <CardDescription>
                Gérez efficacement le remplacement des pièces de vos machines
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Pièces à remplacer identifiées</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Durée de vie en heures</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Alertes avant échéance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Maintenance & vidanges */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Maintenance & vidanges</CardTitle>
              </div>
              <CardDescription>
                Planifiez et suivez toutes vos opérations de maintenance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Historique complet des interventions</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Prochaines opérations planifiées</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Calendrier de maintenance</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Notifications automatiques */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Notifications automatiques</CardTitle>
              </div>
              <CardDescription>
                Recevez des alertes par e-mail selon le nombre d&apos;heures
                d&apos;utilisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Alertes par e-mail avant échéance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Notifications personnalisables</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Rappels de maintenance préventive</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Section "Pourquoi Fix-ora ?" */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
            Pourquoi Fix-ora ?
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 mt-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Réduction des pannes imprévues
                </h3>
                <p className="text-muted-foreground">
                  Anticipez les problèmes avant qu&apos;ils ne surviennent grâce
                  à un suivi précis des heures d&apos;utilisation et des
                  opérations de maintenance.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 mt-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Meilleure durée de vie des machines
                </h3>
                <p className="text-muted-foreground">
                  Prolongez la durée de vie de vos équipements grâce à une
                  maintenance préventive régulière et planifiée.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 mt-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Centralisation des données
                </h3>
                <p className="text-muted-foreground">
                  Toutes les informations de vos machines, pièces et
                  interventions sont centralisées dans une seule plateforme
                  accessible à toute votre équipe.
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 mt-1">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  Gain de temps pour les équipes techniques
                </h3>
                <p className="text-muted-foreground">
                  Automatisez les rappels et les notifications pour que vos
                  équipes se concentrent sur l&apos;essentiel : la maintenance
                  de vos équipements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section Call To Action */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Passez d&apos;une maintenance réactive à une maintenance
            intelligente.
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Rejoignez les entreprises qui optimisent leur maintenance avec
            Fix-ora
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/login">
              Créer un compte entreprise
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Fix-ora"
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
                <span className="font-bold">Fix-ora</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Gestion intelligente de maintenance
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Légal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Mentions légales
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>contact@fix-ora.com</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Ressources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#fonctionnalites"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Fonctionnalités
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    Tableau de bord
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Fix-ora – Gestion intelligente de maintenance</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
