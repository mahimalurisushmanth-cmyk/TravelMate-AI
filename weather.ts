export async function getWeather(
  latitude: number,
  longitude: number
) {
  // Call weather provider

  return {
    temperature: 28,
    rainProbability: 20,
    condition: "Partly cloudy"
  };
}
async function main(){
  const destinationLocation = {
    latitude : 37.7749,
    longitude : -122.4194
  };

const weather = await getWeather(
  destinationLocation.latitude,
  destinationLocation.longitude
);
console.log("Weather Data:", weather);
}

main();