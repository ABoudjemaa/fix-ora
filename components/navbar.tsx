import { Button } from "./ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./ui/sheet";
import { Separator } from "./ui/separator";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Fix-ora"
                width={100}
                height={100}
                className=""
              />
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
                <SheetHeader>
                  <SheetTitle/>
                  <SheetDescription/>
                </SheetHeader>
                <nav className="flex flex-col gap-4 m-8">
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
    )
}