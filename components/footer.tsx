import { Separator } from "@radix-ui/react-separator"
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";

export const Footer = () => {
    return (
        <footer id="contact" className="border-t bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Fix-ora"
                  width={100}
                  height={100}
                  className=""
                />
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
    )
}