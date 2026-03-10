import { Star, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ListingCardProps {
  listing: {
    id: number;
    title: string;
    location: string;
    price: number;
    rating: number;
    reviews: number;
    image: string;
    description: string;
    tags: string[];
  };
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <div className="group cursor-pointer">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-3">
        <img 
          src={listing.image} 
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-3 right-3">
          <button className="p-2 rounded-full bg-black/10 backdrop-blur-sm text-white/70 hover:bg-white hover:text-red-500 transition-all">
            <Heart className="w-5 h-5 fill-current opacity-0 hover:opacity-100 absolute inset-2" />
            <Heart className="w-5 h-5" />
          </button>
        </div>
        {listing.tags[0] && (
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground font-medium shadow-sm hover:bg-secondary/90">
              {listing.tags[0]}
            </Badge>
          </div>
        )}
      </div>

      <div className="flex justify-between items-start gap-2">
        <div>
          <h3 className="font-serif font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <p className="text-muted-foreground text-sm font-medium mt-1">{listing.location}</p>
          <p className="text-foreground/60 text-xs mt-2 line-clamp-2 leading-relaxed">
            {listing.description}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-4 h-4 fill-primary text-primary" />
          <span className="font-medium text-foreground text-sm">{listing.rating}</span>
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-bold text-lg text-primary">${listing.price}</span>
        <span className="text-muted-foreground text-sm">per person</span>
      </div>
    </div>
  );
}