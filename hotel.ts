// Define the structure of a Hotel object
export interface Hotel {
  name: string;
  location: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
}

// Define the criteria Gemini uses to search/filter hotels
export interface HotelSearchParams {
  budget?: number;       // Max price per night or total budget
  location: string;      // Destination city/area
  travelerCount?: number;// Number of guests
  interests?: string[];  // e.g., ["Pool", "WiFi", "Beach", "Gym"]
  tripDuration?: number; // Number of nights
}

// Mock database of hotels matching your schema
const HOTEL_DATABASE: Hotel[] = [
  {
    name: "Hotel Example",
    location: "Tokyo, Japan",
    pricePerNight: 4500,
    rating: 4.3,
    amenities: ["WiFi", "Breakfast", "Pool"]
  },
  {
    name: "Luxury Stay & Spa",
    location: "Paris, France",
    pricePerNight: 12000,
    rating: 4.8,
    amenities: ["WiFi", "Gym", "Spa", "Breakfast"]
  },
  {
    name: "Budget Backpacker Inn",
    location: "Tokyo, Japan",
    pricePerNight: 2500,
    rating: 3.9,
    amenities: ["WiFi", "Laundry"]
  }
];

/**
 * Tool function for Gemini to retrieve structured hotel data based on user choices.
 */
export async function getHotels(params: HotelSearchParams): Promise<Hotel[]> {
  const { location, budget, interests } = params;

  // Filter the structured database based on parameters provided by Gemini
  return HOTEL_DATABASE.filter(hotel => {
    // 1. Match Location (case-insensitive)
    const matchesLocation = hotel.location.toLowerCase().includes(location.toLowerCase());
    
    // 2. Match Budget (if specified)
    const matchesBudget = budget ? hotel.pricePerNight <= budget : true;
    
    // 3. Match Interests/Amenities (if specified)
    const matchesInterests = interests 
      ? interests.every(interest => hotel.amenities.map(a => a.toLowerCase()).includes(interest.toLowerCase()))
      : true;

    return matchesLocation && matchesBudget && matchesInterests;
  });
}