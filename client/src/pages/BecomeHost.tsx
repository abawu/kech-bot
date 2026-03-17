import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BecomeHostPage() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [meetingPoint, setMeetingPoint] = useState("");

  const mapQuery = useMemo(() => {
    const parts = [meetingPoint || address, city].filter(Boolean);
    return parts.join(", ");
  }, [address, city, meetingPoint]);

  const mapUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : null;

  const directionsUrl = mapQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="pt-20 flex-1">
        <main className="container mx-auto px-4 py-10">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3">
                Become a Host
              </h1>
              <p className="text-muted-foreground text-lg">
                Share authentic culture from your home. Required fields are marked with *.
              </p>
            </div>

            <form className="space-y-8">
              <section className="bg-card/60 border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Host Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name *</Label>
                    <Input id="fullName" placeholder="e.g., Selam Kebede" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages spoken *</Label>
                    <Input id="languages" placeholder="e.g., Amharic, English" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Short bio *</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell guests about yourself in 1–3 sentences."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Response time *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select response time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1h">Within 1 hour</SelectItem>
                        <SelectItem value="3h">Within 3 hours</SelectItem>
                        <SelectItem value="12h">Within 12 hours</SelectItem>
                        <SelectItem value="24h">Within 24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profilePhoto">Profile photo</Label>
                    <Input id="profilePhoto" type="file" accept="image/*" />
                  </div>
                </div>
              </section>

              <section className="bg-card/60 border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Listing Basics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Experience title *</Label>
                    <Input id="title" placeholder="e.g., Traditional Coffee Ceremony" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coffee">Coffee Ceremony</SelectItem>
                        <SelectItem value="foods">Local Foods</SelectItem>
                        <SelectItem value="dances">Local Dances</SelectItem>
                        <SelectItem value="crafts">Crafts</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Addis Ababa"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="meetingPoint">Meeting point *</Label>
                    <Input
                      id="meetingPoint"
                      placeholder="e.g., Meskel Square"
                      value={meetingPoint}
                      onChange={(event) => setMeetingPoint(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Exact address (hidden after booking) *</Label>
                    <Input
                      id="address"
                      placeholder="Street, house number, neighborhood"
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                      required
                    />
                  </div>
                </div>
              </section>

              <section className="bg-card/60 border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Map & Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input id="latitude" placeholder="e.g., 9.0106" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input id="longitude" placeholder="e.g., 38.7610" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="mapLink">Google Maps link</Label>
                    <Input id="mapLink" placeholder="Paste map link (optional)" />
                  </div>
                  <div className="flex items-center gap-3 md:col-span-2">
                    <Button type="button" variant="outline" disabled={!directionsUrl} asChild>
                      <a href={directionsUrl || "#"} target="_blank" rel="noreferrer">
                        Find on map
                      </a>
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Enter city + meeting point to enable the map link.
                    </p>
                  </div>
                  <div className="md:col-span-2 rounded-2xl overflow-hidden border border-border/60 bg-muted/40">
                    {mapUrl ? (
                      <iframe
                        title="Map preview"
                        src={mapUrl}
                        className="w-full h-64"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                        Map preview will appear after you enter a city and meeting point.
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <section className="bg-card/60 border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Experience Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="whatDo">What guests will do *</Label>
                    <Textarea
                      id="whatDo"
                      placeholder="List the main activities (e.g., roasting, brewing, tasting)."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration *</Label>
                    <Input id="duration" placeholder="e.g., 2 hours" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="groupSize">Group size *</Label>
                    <Input id="groupSize" placeholder="e.g., 2–8 guests" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="included">What’s included *</Label>
                    <Input id="included" placeholder="e.g., coffee, snacks, materials" required />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bring">What to bring</Label>
                    <Input id="bring" placeholder="e.g., comfortable shoes" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="access">Accessibility notes</Label>
                    <Textarea id="access" placeholder="Optional accessibility information." />
                  </div>
                </div>
              </section>

              <section className="bg-card/60 border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Cultural Authenticity</h2>
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="hostType">Who will host *</Label>
                    <Input id="hostType" placeholder="e.g., family, artisan, chef" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="significance">Cultural significance</Label>
                    <Textarea
                      id="significance"
                      placeholder="Optional: explain the cultural meaning behind the experience."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="respect">Respect guidelines for guests</Label>
                    <Textarea
                      id="respect"
                      placeholder="Optional: etiquette, dress code, or customs."
                    />
                  </div>
                </div>
              </section>

              <section className="bg-card/60 border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Schedule & Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="availability">Available days/times *</Label>
                    <Input id="availability" placeholder="e.g., Sat–Sun, 10am–4pm" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price per person (USD) *</Label>
                    <Input id="price" type="number" min="1" placeholder="e.g., 45" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Minimum notice *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select notice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">24 hours</SelectItem>
                        <SelectItem value="48h">48 hours</SelectItem>
                        <SelectItem value="72h">72 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cancellation policy *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="strict">Strict</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <section className="bg-card/60 border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Photos</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="coverPhoto">Cover image *</Label>
                    <Input id="coverPhoto" type="file" accept="image/*" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gallery">Gallery images</Label>
                    <Input id="gallery" type="file" accept="image/*" multiple />
                  </div>
                </div>
              </section>

              <section className="bg-card/60 border border-border/60 rounded-3xl p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-foreground mb-4">Policies</h2>
                <div className="grid grid-cols-1 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="rules">House rules</Label>
                    <Textarea id="rules" placeholder="Optional: quiet hours, shoes off, etc." />
                  </div>
                </div>
              </section>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Required fields marked with * must be completed before submission.
                </p>
                <Button type="submit">Submit listing</Button>
              </div>
            </form>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
