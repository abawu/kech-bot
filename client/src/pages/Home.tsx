import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/home/Hero";
import { ListingCard } from "@/components/listings/ListingCard";
import { Footer } from "@/components/layout/Footer";
import { categories, listings } from "@/lib/mockData";
import { Coffee, UtensilsCrossed, Music, Palette, Shirt, Compass, ShieldCheck, HeartHandshake, Users } from "lucide-react";
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
          
          {/* Storytelling Section */}
          <section className="py-16 mb-8 border-b border-border/40">
            <div className="text-center mb-12 animate-in slide-in-from-bottom-8 duration-700">
              <span className="text-primary font-bold tracking-widest text-sm uppercase mb-2 block">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">The True Heart of Ethiopia</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Experience genuine culture through verified local hosts who are passionate about sharing their heritage, stories, and traditions.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col items-center text-center p-8 bg-card/50 backdrop-blur-sm rounded-3xl shadow-sm border border-border/60 hover:shadow-xl hover:border-primary/30 transition-all group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-primary-foreground duration-500">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-xl mb-3">Verified Authenticity</h3>
                <p className="text-base text-muted-foreground leading-relaxed">Every experience is vetted to ensure it respectfully and accurately represents rich Ethiopian traditions.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-8 bg-card/50 backdrop-blur-sm rounded-3xl shadow-sm border border-border/60 hover:shadow-xl hover:border-secondary/50 transition-all group translate-y-0 md:translate-y-4">
                <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary-foreground mb-6 group-hover:scale-110 transition-transform group-hover:bg-secondary group-hover:text-secondary-foreground duration-500">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-xl mb-3">Support Local Families</h3>
                <p className="text-base text-muted-foreground leading-relaxed">Your bookings directly empower local artisans, talented cooks, and host families across Ethiopia.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-8 bg-card/50 backdrop-blur-sm rounded-3xl shadow-sm border border-border/60 hover:shadow-xl hover:border-primary/30 transition-all group">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform group-hover:bg-primary group-hover:text-primary-foreground duration-500">
                  <HeartHandshake className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-bold text-xl mb-3">Deep Connections</h3>
                <p className="text-base text-muted-foreground leading-relaxed">Go far beyond standard tourism. Create meaningful bonds with hosts and experience life as a true local.</p>
              </div>
            </div>
          </section>

          {/* Categories Header */}
          <div className="sticky top-[80px] z-40 bg-background/80 backdrop-blur-xl py-6 mb-8 -mx-4 px-4 border-b border-border/50 transition-all">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Discover Experiences</h2>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                {categories.map((cat) => {
                  const Icon = iconMap[cat.icon as keyof typeof iconMap];
                  const isActive = activeCategory === cat.id;
                  
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={cn(
                        "flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all whitespace-nowrap border",
                        isActive 
                          ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105" 
                          : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-primary/5"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
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