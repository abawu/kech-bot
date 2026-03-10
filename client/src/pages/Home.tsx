import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ListingCard } from "@/components/listings/ListingCard";
import { Footer } from "@/components/layout/Footer";
import { categories, listings } from "@/lib/mockData";
import { Coffee, UtensilsCrossed, Music, Palette, Shirt, Compass } from "lucide-react";
import { cn } from "@/lib/utils";

// Map icon strings to components
const iconMap = {
  Compass: Compass,
  Coffee: Coffee,
  UtensilsCrossed: UtensilsCrossed,
  Music: Music,
  Palette: Palette,
  Shirt: Shirt,
};

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredListings = activeCategory === "all" 
    ? listings 
    : listings.filter(l => l.category === activeCategory);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1"> {/* Offset for fixed navbar */}
        <Hero />
        
        <main className="container mx-auto px-4 py-8">
          {/* Categories Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Browse Authentic Experiences</h2>
            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {categories.map((cat) => {
                const Icon = iconMap[cat.icon as keyof typeof iconMap];
                const isActive = activeCategory === cat.id;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "bg-muted text-foreground hover:bg-muted/80"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          
          {filteredListings.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-serif text-muted-foreground">No homes found in this category yet.</h3>
              <p className="text-muted-foreground mt-2">Try selecting another category.</p>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}