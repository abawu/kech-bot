import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ListingCard } from "@/components/listings/ListingCard";
import { Footer } from "@/components/layout/Footer";
import { categories, listings } from "@/lib/mockData";
import { Trees, Tent, Warehouse, Building2, Home } from "lucide-react";
import { cn } from "@/lib/utils";

// Map icon strings to components
const iconMap = {
  Home: Home,
  Tent: Tent,
  Trees: Trees,
  Warehouse: Warehouse,
  Building2: Building2,
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
          {/* Categories */}
          <div className="flex items-center gap-8 overflow-x-auto pb-6 mb-8 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon as keyof typeof iconMap];
              const isActive = activeCategory === cat.id;
              
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 min-w-[64px] transition-all group",
                    isActive 
                      ? "text-primary opacity-100" 
                      : "text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("w-6 h-6", isActive && "stroke-[2.5px]")} />
                  <span className={cn(
                    "text-xs font-medium whitespace-nowrap relative",
                    isActive && "font-bold"
                  )}>
                    {cat.name}
                    {isActive && (
                      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
                    )}
                  </span>
                </button>
              );
            })}
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