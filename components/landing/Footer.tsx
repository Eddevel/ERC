import Link from "next/link";
import { XCircle, Share2, Mail, MapPin } from "lucide-react";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
               <Image
                        src="/images/logo.png"
                        alt="ERC Logo"
                        width={100}
                        height={40}
                        className="w-auto h-auto"
                      />
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm">
              Lagos’s most vibrant running community. We run together, grow together,
              and celebrate every finish line.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-brand-500">About</Link></li>
              <li><Link href="/events" className="hover:text-brand-500">Events</Link></li>
              <li><Link href="/register" className="hover:text-brand-500">Join ERC</Link></li>
              <li><Link href="/login" className="hover:text-brand-500">Login</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Lagos, Nigeria
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> hello@ekorunnersclub.com
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Ẹ̀ko runners Club (ERC). All rights reserved.
        </div>
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Built with ❤️ by <span><Link href="https://eddea.org" >Eddea</Link></span>.
        </div>
      </div>
    </footer>
  );
}