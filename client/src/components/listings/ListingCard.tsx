import { Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ListingCardProps {
  listing: {
    id: number;
    title: string;
    location: string;
    meetingPoint?: string;
    lat?: number;
    lng?: number;
    price: number;
    rating: number;
    reviews: number;
    image: string;
    description: string;
    tags: string[];
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  const directionsUrl = (listing.lat != null && listing.lng != null)
    ? `https://www.google.com/maps/search/?api=1&query=${listing.lat},${listing.lng}`
    : null;

  return (
    <div className="group cursor-pointer flex flex-col h-full">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500">
        <img 
          src={listing.image} 
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        
        {/* Gradient Overlay for Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute top-3 right-3 z-10">
          <button className="p-2 rounded-full bg-black/20 backdrop-blur-md text-white/90 hover:bg-white hover:text-red-500 transition-all shadow-sm">
            <Heart className="w-5 h-5 fill-current opacity-0 hover:opacity-100 absolute inset-2" />
            <Heart className="w-5 h-5" />
          </button>
        </div>
        {listing.tags[0] && (
          <div className="absolute top-3 left-3 z-10">
            <Badge variant="secondary" className="bg-white/95 backdrop-blur-sm text-foreground font-semibold shadow-sm hover:bg-white border-none px-3 py-1">
              {listing.tags[0]}
            </Badge>
          </div>
        )}

        {/* Hover Action Button */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10">
          <button className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full font-bold text-sm shadow-xl hover:bg-primary/90 hover:scale-105 transition-transform flex items-center gap-2">
            View Experience
          </button>
        </div>
      </div>

      <div className="flex justify-between items-start gap-3 flex-1">
        <div className="flex-1">
          <h3 className="font-serif font-bold text-xl text-foreground leading-tight group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-muted-foreground text-sm font-medium mt-1.5 flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            {listing.location}
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-2 text-xs font-semibold text-primary hover:underline"
              >
                Directions
              </a>
            )}
          </p>
          {listing.meetingPoint && (
            <p className="text-foreground/60 text-xs mt-1">
              Meet: {listing.meetingPoint}
            </p>
          )}
          <p className="text-foreground/70 text-sm mt-2.5 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0 bg-muted/50 px-2 py-1.5 rounded-lg border border-border/50">
          <Star className="w-4 h-4 fill-secondary text-secondary" />
          <span className="font-bold text-foreground text-sm">{listing.rating}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/60 flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-serif font-bold text-2xl text-primary">${listing.price}</span>
          <span className="text-muted-foreground text-sm font-medium">/ person</span>
        </div>
      </div>
    </div>
  );
}
