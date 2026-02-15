import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <div className="relative h-[600px] w-full flex items-center justify-center overflow-hidden rounded-3xl my-6 mx-4 md:mx-auto container">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('/images/ethiopian-coffee.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" /> 
      </div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-4xl px-4 animate-in fade-in zoom-in duration-700">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-6 drop-shadow-lg">
          Experience Authentic Ethiopia <br/>
          <span className="italic text-secondary">at local homes.</span>
        </h1>
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto drop-shadow-md font-medium">
          Discover unique eco-friendly homes and experiences curated by the people who know them best.
        </p>

        {/* Search Bar */}
        <div className="bg-white p-2 rounded-full shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-2 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex-1 px-6 py-3 w-full md:w-auto text-left hover:bg-gray-50 rounded-full transition-colors cursor-pointer group">
            <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider group-hover:text-primary transition-colors">Where</label>
            <input 
              type="text" 
              placeholder="Search destinations" 
              className="w-full bg-transparent border-none outline-none text-foreground font-medium placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="w-px h-10 bg-gray-200 hidden md:block" />

          <div className="flex-1 px-6 py-3 w-full md:w-auto text-left hover:bg-gray-50 rounded-full transition-colors cursor-pointer group">
            <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider group-hover:text-primary transition-colors">Check in</label>
            <div className="text-muted-foreground font-medium">Add dates</div>
          </div>

          <div className="w-px h-10 bg-gray-200 hidden md:block" />

          <div className="flex-1 px-6 py-3 w-full md:w-auto text-left hover:bg-gray-50 rounded-full transition-colors cursor-pointer group">
            <label className="block text-xs font-bold text-foreground/70 uppercase tracking-wider group-hover:text-primary transition-colors">Who</label>
            <div className="text-muted-foreground font-medium">Add guests</div>
          </div>

          <Button size="lg" className="rounded-full w-full md:w-auto h-14 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            <span>Search</span>
          </Button>
        </div>
      </div>
    </div>
  );
}