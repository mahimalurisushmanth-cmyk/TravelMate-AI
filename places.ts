export async function searchPlaces(
  destination: string,
  query: string
) {
  // Call Places API

  return {
    places: [
      {
        name: "...",
        address: "...",
        rating: 4.5,
        latitude: 0,
        longitude: 0,
        openingHours: []
      }
    ]
  };
}
async function main(){
  const destination = 'Paris';
  console.log('Searching for info in ${destination}...');

const attractions = await searchPlaces(
  destination,
  "tourist attractions"
);
console.log("Attractions found:", attractions);

const restaurants = await searchPlaces(
  destination,
  "local restaurants"
);
console.log("Restaurants found:", restaurants);
}
main().catch(console.error);