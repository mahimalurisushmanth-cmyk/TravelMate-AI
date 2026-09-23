import express from 'express';
const app = express();
app.use(express.json());
export async function runTravelAgent(input: {
  destination: string;
  days: number;
  travelers: number;
  budgetInINR: number;
  interests: string[];
  language: string;
}) {
  // 1. Search destination
  // 2. Get weather
  // 3. Find attractions
  // 4. Find restaurants
  // 5. Find hotels
  // 6. Calculate routes
  // 7. Get flight information
  // 8. Give all information to Gemini
  // 9. Generate final itinerary
}

app.post("/api/generate-itinerary", async (req, res) => {
  try {
    const itinerary = await runTravelAgent(req.body);

    res.json({
      itinerary,
      source: "TravelMate AI Agent"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Travel agent failed"
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('Server running on port ${PORT}');
});



