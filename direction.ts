// Define the allowed locations based on the prompt instructions
export type LocationType = 'Hotel' | 'Attraction' | 'Restaurant' | 'Beach' | 'indoor museum' | 'alternate activity';

// Interface representing the specific structure required by your AI tool
export interface DirectionsResult {
  distanceKm: number;
  durationMinutes: number;
}

/**
 * Calculates the distance and duration between two locations.
 * 
 * @param origin - The starting point (e.g., 'Hotel', 'Attraction')
 * @param destination - The ending point (e.g., 'Attraction', 'Restaurant')
 * @returns An object containing the calculated distance in kilometers and duration in minutes.
 */
export async function getDirections(
  origin: LocationType, 
  destination: LocationType
): Promise<DirectionsResult> {
  
  // Real API implementation placeholder:
  // const response = await fetch(`https://googleapis.com...`);
  // const data = await response.json();

  // Mocking the behavior based on the sample output in your image
  switch (`${origin}->${destination}`) {
    case 'Hotel->Attraction':
      return { distanceKm: 8.4, durationMinutes: 23 };
    
    case 'Attraction->Restaurant':
      return { distanceKm: 3.1, durationMinutes: 10 };
      
    case 'Restaurant->Beach':
      return { distanceKm: 12.5, durationMinutes: 18 };
      
    default:
      // Fallback default values for unhandled routes
      return { distanceKm: 5.0, durationMinutes: 12 };
  }
}