import { Link } from "wouter";
import { Search, Menu, User, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <a className="flex flex-col items-center gap-1 group">
            <div className="w-12 h-12 overflow-hidden rounded-lg">
              <img src="/logo.png" alt="Endebeto Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif text-lg font-bold text-primary tracking-tight group-hover:text-primary/90 transition-colors">
              Endebeto
            </span>
          </a>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 font-medium text-foreground/80">
          <Link href="/"><a className="hover:text-primary transition-colors">Home</a></Link>
          <a href="#" className="hover:text-primary transition-colors">Experiences</a>
          <a href="#" className="hover:text-primary transition-colors">Contact</a>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden md:flex font-medium hover:bg-muted">
            Become the host
          </Button>
          <Button variant="ghost" size="icon" className="hover:bg-muted rounded-full">
            <Globe className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2 border border-border rounded-full p-1 pl-3 hover:shadow-md transition-all cursor-pointer bg-card">
            <Menu className="w-5 h-5 text-muted-foreground" />
            <div className="bg-primary/10 p-2 rounded-full">
               <User className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}