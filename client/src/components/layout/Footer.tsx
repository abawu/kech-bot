import { Facebook, Twitter, Instagram, Linkedin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 overflow-hidden rounded-lg">
                <img src="/logo.png" alt="Endebeto Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-serif text-xl font-bold text-primary tracking-tight">
                Endebeto
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Experience authentic Ethiopia through the eyes of locals. Discover unique homes and cultural heritage.
            </p>
          </div>

          {/* Links 1 */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-foreground">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Stays</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Experiences</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Online Experiences</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Gift Cards</a></li>
            </ul>
          </div>

          {/* Links 2 */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Sustainability</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Press</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-foreground">Stay Connected</h4>
            <p className="text-sm text-muted-foreground">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button size="sm">Join</Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>&copy; 2024 Locals Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer hover:text-foreground">
              <Globe className="w-4 h-4" />
              <span>English (US)</span>
            </div>
            <div className="flex items-center gap-4">
              <Facebook className="w-4 h-4 cursor-pointer hover:text-foreground" />
              <Twitter className="w-4 h-4 cursor-pointer hover:text-foreground" />
              <Instagram className="w-4 h-4 cursor-pointer hover:text-foreground" />
              <Linkedin className="w-4 h-4 cursor-pointer hover:text-foreground" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}