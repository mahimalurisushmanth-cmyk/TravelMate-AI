/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Itinerary, DayPlan, ExpenseBreakdown } from "./types";

/**
 * Highly specific static itinerary templates for demonstration
 */
const DESTINATION_TEMPLATES: Record<string, {
  themes: string[];
  tips: string[];
  packing: string[];
  meals: Array<{ meal: string; place: string; dish: string; cost: number }>;
  activities: Array<{ place: string; desc: string; cost: number }>;
}> = {
  goa: {
    themes: [
      "Beach Hopping & Water Sports",
      "Historic Old Goa & Portuguese Heritage",
      "Spicy Spice Plantation & Dudhsagar Waterfalls",
      "Scenic South Goa Relaxation",
      "Anjuna Flea Market & Sunset Cruise"
    ],
    tips: [
      "Rent a two-wheeler for budget-friendly local transportation.",
      "Carry sunscreen and beach wear. Keep cash handy for beach shacks.",
      "Observe quiet and modest dress code while visiting Old Goa churches.",
      "Bargain politely at local flea markets in Anjuna and Calangute."
    ],
    packing: [
      "Sunscreen SPF 50 & Sunglasses",
      "Light linen clothing & Swimwear",
      "Waterproof dry bag for beach outings",
      "Comfortable sandals or flip-flops",
      "Rehydration salts (ORS)"
    ],
    meals: [
      { meal: "Breakfast", place: "Artjuna Cafe, Anjuna", dish: "Fresh smoothies, croissants, and poached eggs", cost: 350 },
      { meal: "Lunch", place: "Curlies Beach Shack, Anjuna", dish: "Goan Fish Curry Rice and butter garlic prawns", cost: 600 },
      { meal: "Dinner", place: "Fisherman's Wharf, Panaji", dish: "Pork Vindaloo or Chicken Xacuti with local Bebinca dessert", cost: 800 },
      { meal: "Snack", place: "Infantaria, Calangute", dish: "Prawn rissoles and fresh coconut water", cost: 200 }
    ],
    activities: [
      { place: "Baga & Calangute Beach", desc: "Parasailing, banana boat rides, and relaxing on sunbeds.", cost: 1500 },
      { place: "Basilica of Bom Jesus", desc: "Unesco World Heritage site holding the mortal remains of St. Francis Xavier.", cost: 50 },
      { place: "Sahakari Spice Plantation", desc: "Guided tour through exotic spices, traditional Goan buffet lunch, and elephant bathing.", cost: 800 },
      { place: "Anjuna Beach Sunset Point", desc: "Relax with local music, beautiful cliffs, and sunset views.", cost: 0 },
      { place: "Aguada Fort & Lighthouse", desc: "Historic 17th-century Portuguese fort with panoramic Arabian sea views.", cost: 100 }
    ]
  },
  kerala: {
    themes: [
      "Munnar Tea Gardens & Waterfalls",
      "Alleppey Backwater Houseboat Cruise",
      "Thekkady Wildlife Sanctuary & Spice Trails",
      "Kochi Fort Colonial Walk & Chinese Fishing Nets",
      "Varkala Cliffs & Beach Sunset"
    ],
    tips: [
      "Book houseboats in Alleppey in advance to avoid last-minute high prices.",
      "Munnar gets chilly in evenings; pack a light sweater or jacket.",
      "Respect local customs; some temples in Kerala require specific dress codes.",
      "Try local Ayurvedic massages at government-approved wellness centers."
    ],
    packing: [
      "Mosquito repellent spray (highly recommended)",
      "Light rain jacket or umbrella (frequent light showers)",
      "Comfortable walking shoes for Munnar trails",
      "Modest clothing for temple visits",
      "Camera for lush wildlife and landscape photography"
    ],
    meals: [
      { meal: "Breakfast", place: "Kashi Art Cafe, Kochi", dish: "Organic eggs, freshly brewed local tea, and multi-grain toast", cost: 300 },
      { meal: "Lunch", place: "Mullapanthal Toddy Shop, Alappuzha", dish: "Traditional Kerala Karimeen Pollichathu (pearl spot fish) on banana leaf", cost: 500 },
      { meal: "Dinner", place: "The Rice Boat, Kumarakom", dish: "Coconut milk based prawn curry with Appam", cost: 900 },
      { meal: "Snack", place: "Local Tea Stall, Munnar", dish: "Fresh banana fritters (Pazham Pori) with cardamom tea", cost: 80 }
    ],
    activities: [
      { place: "Mattupetty Dam & Tea Gardens", desc: "Speedboat ride in the lake and a walking tour through lush green tea estates.", cost: 400 },
      { place: "Alleppey Houseboat Cruise", desc: "Languid tour of local backwater canals, witnessing countryside Kerala life.", cost: 2500 },
      { place: "Periyar National Park Safari", desc: "Guided boat cruise to spot wild elephants, boars, and migratory birds.", cost: 600 },
      { place: "Kathakali Performance Center", desc: "Traditional visual drama show including elaborate face makeup demonstration.", cost: 300 },
      { place: "Fort Kochi Colonial Walk", desc: "Witness Portuguese, Dutch, and British landmarks and the Chinese fishing nets.", cost: 100 }
    ]
  },
  rajasthan: {
    themes: [
      "Jaipur Pink City & Majestic Amber Fort",
      "Udaipur City Palace & Lake Pichola Boat Ride",
      "Jaisalmer Golden Fort & Thar Desert Dune Safari",
      "Jodhpur Mehrangarh Fort & Blue City Walk",
      "Pushkar Sacred Lake & Brahma Temple"
    ],
    tips: [
      "Purchase a composite ticket in Jaipur for discounts on multiple historical sites.",
      "Stay hydrated. Carry a wide-brimmed hat and sunglasses for the intense sun.",
      "Opt for government-approved guides at forts to hear authentic historical anecdotes.",
      "Do not miss the sunset camel ride and cultural folk dance in Jaisalmer."
    ],
    packing: [
      "Wide-brimmed sun hat & Polaroid sunglasses",
      "Cotton clothing (breathable for hot desert climate)",
      "Light sweater or shawl (desert nights can be cold)",
      "Comfortable walking sneakers for climbing steep fort pathways",
      "Sanitizer and wet wipes"
    ],
    meals: [
      { meal: "Breakfast", place: "Laxmi Mishthan Bhandar, Jaipur", dish: "Famous Pyaz Kachori and sweet hot Jalebis", cost: 200 },
      { meal: "Lunch", place: "Chokhi Dhani, Jaipur", dish: "Authentic unlimited Dal Baati Churma cooked in pure ghee", cost: 900 },
      { meal: "Dinner", place: "Ambrai, Udaipur", dish: "Laal Maas (traditional spicy mutton curry) with Lake Pichola views", cost: 1200 },
      { meal: "Snack", place: "Jodhpur Sweet Home", dish: "Mawa Kachori and creamy saffron Lassi", cost: 150 }
    ],
    activities: [
      { place: "Amber Palace & Elephant Heritage Tour", desc: "Explore grand courtyards, Sheesh Mahal (Mirror Palace), and stunning arches.", cost: 300 },
      { place: "Lake Pichola Sunset Boat Ride", desc: "Cruise around Jag Mandir palace with a magical backdrop of the city lights.", cost: 500 },
      { place: "Sam Sand Dunes Camel Safari", desc: "Enjoy desert dunes, a ride on camel back, and traditional Rajasthani musical evening.", cost: 1500 },
      { place: "Mehrangarh Fort Museum", desc: "Explore one of India's largest forts, housing royal palanquins, armory, and paintings.", cost: 250 },
      { place: "Hawa Mahal & Local Bazaars", desc: "Photograph the Palace of Winds and shop for hand-blocked textiles and silver jewelry.", cost: 150 }
    ]
  }
};

const GENERIC_TEMPLATES = {
  themes: [
    "City Highlights & Local Landmarks",
    "Nature Parks, Scenic Escapes & Gardens",
    "Historic Museum Tours & Culture Discovery",
    "Local Culinary Trials & Hidden Cafes",
    "Souvenir Shopping & Panoramic Sunset Spots"
  ],
  tips: [
    "Keep local maps downloaded offline for seamless navigation.",
    "Ask locals for recommendations on authentic food spots rather than tourist traps.",
    "Start your days early around 8:30 AM to beat the rush hour at primary attractions.",
    "Double check opening times of museums and historical reserves."
  ],
  packing: [
    "Comfortable daily footwear",
    "Universal power adapter & power bank",
    "Personal toiletries & essential medications",
    "Reusable eco-friendly water bottle",
    "Travel documents organizer"
  ],
  meals: [
    { meal: "Breakfast", place: "Central Baker's", dish: "Fresh seasonal fruits, local breakfast pancake/pastry, and coffee", cost: 250 },
    { meal: "Lunch", place: "Popular Heritage Eatery", dish: "Signature lunch combo featuring traditional local preparation style", cost: 450 },
    { meal: "Dinner", place: "High-View Garden Restaurant", dish: "Premium chef special platter with local organic ingredients", cost: 750 },
    { meal: "Snack", place: "Street Food Corner", dish: "Local hand-made snacks and regional herbal beverage", cost: 120 }
  ],
  activities: [
    { place: "Main Landmark & Viewpoint", desc: "Take beautiful panoramic photographs and learn about the local culture.", cost: 300 },
    { place: "National Museum & Galleries", desc: "Gain fascinating insights into the regional art history and archives.", cost: 200 },
    { place: "Botanical Reserves", desc: "An oasis of tranquility featuring rare flora species and relaxation walking paths.", cost: 100 },
    { place: "Artisan Craft Market", desc: "Witness local craftsmen carving unique wooden or clay artifacts.", cost: 50 },
    { place: "Sunset Hill Observatory", desc: "Observe the skyline of the city/region as lights start flickering on.", cost: 150 }
  ]
};

/**
 * Deterministic generation of high-quality mock data
 */
export function generateOfflineItinerary(
  destination: string,
  days: number,
  travelers: number,
  budgetInINR: number,
  interests: string[],
  language: string
): Itinerary {
  const normDest = destination.toLowerCase().trim();
  let template = DESTINATION_TEMPLATES.goa; // Default

  if (normDest.includes("goa")) {
    template = DESTINATION_TEMPLATES.goa;
  } else if (normDest.includes("keral") || normDest.includes("cochin") || normDest.includes("alleppey") || normDest.includes("munnar")) {
    template = DESTINATION_TEMPLATES.kerala;
  } else if (normDest.includes("raj") || normDest.includes("jaipur") || normDest.includes("udaipur") || normDest.includes("jodhpur") || normDest.includes("jaisalmer")) {
    template = DESTINATION_TEMPLATES.rajasthan;
  } else {
    // Generate custom generic using destination name
    template = {
      themes: GENERIC_TEMPLATES.themes,
      tips: GENERIC_TEMPLATES.tips.map(tip => tip.replace("local", `${destination} local`)),
      packing: GENERIC_TEMPLATES.packing,
      meals: GENERIC_TEMPLATES.meals.map(m => ({
        ...m,
        place: m.place + ` in ${destination}`
      })),
      activities: GENERIC_TEMPLATES.activities.map(act => ({
        ...act,
        place: act.place.replace("Main", `${destination} Main`),
        desc: act.desc.replace("local", `${destination} local`)
      }))
    };
  }

  // Create Day Plans
  const dayPlans: DayPlan[] = [];
  for (let d = 1; d <= days; d++) {
    // Pick theme
    const themeIdx = (d - 1) % template.themes.length;
    const theme = template.themes[themeIdx];

    // Pick 3 activities for this day
    const dayActivities = [];
    const actIdx1 = ((d - 1) * 2) % template.activities.length;
    const actIdx2 = ((d - 1) * 2 + 1) % template.activities.length;
    const actIdx3 = ((d - 1) * 2 + 2) % template.activities.length;

    // Scale costs based on budget input
    // Budget range: Budget in INR (e.g. 10000 to 500000)
    // Low: < 20000, Mid: 20000 - 80000, High: > 80000
    const budgetFactor = budgetInINR < 20000 ? 0.6 : budgetInINR > 80000 ? 1.5 : 1.0;

    const act1 = template.activities[actIdx1];
    const act2 = template.activities[actIdx2];
    const act3 = template.activities[actIdx3];

    dayActivities.push(
      {
        time: "09:30 AM",
        placeName: act1.place,
        description: act1.desc,
        costInINR: Math.round(act1.cost * budgetFactor)
      },
      {
        time: "02:00 PM",
        placeName: act2.place,
        description: act2.desc,
        costInINR: Math.round(act2.cost * budgetFactor)
      },
      {
        time: "05:30 PM",
        placeName: act3.place,
        description: act3.desc,
        costInINR: Math.round(act3.cost * budgetFactor)
      }
    );

    // Pick meals
    const foodRecs = [];
    // Breakfast
    const bf = template.meals.find(m => m.meal === "Breakfast") || template.meals[0];
    const ln = template.meals.find(m => m.meal === "Lunch") || template.meals[1];
    const dn = template.meals.find(m => m.meal === "Dinner") || template.meals[2];

    foodRecs.push(
      {
        meal: "Breakfast",
        placeSuggestion: bf.place,
        dishDescription: bf.dish,
        estimatedCostInINR: Math.round(bf.cost * budgetFactor)
      },
      {
        meal: "Lunch",
        placeSuggestion: ln.place,
        dishDescription: ln.dish,
        estimatedCostInINR: Math.round(ln.cost * budgetFactor)
      },
      {
        meal: "Dinner",
        placeSuggestion: dn.place,
        dishDescription: dn.dish,
        estimatedCostInINR: Math.round(dn.cost * budgetFactor)
      }
    );

    dayPlans.push({
      dayNumber: d,
      theme,
      activities: dayActivities,
      foodRecommendations: foodRecs
    });
  }

  // Calculate expenses
  let totalActCost = 0;
  let totalFoodCost = 0;
  dayPlans.forEach(dp => {
    dp.activities.forEach(a => totalActCost += a.costInINR);
    dp.foodRecommendations.forEach(f => totalFoodCost += f.estimatedCostInINR);
  });

  // Calculate overall estimated expenses
  // accommodation scales with days and travelers and budget
  const perDayHotelCost = budgetInINR < 20000 ? 1500 : budgetInINR > 80000 ? 7000 : 3500;
  const hotelExpense = perDayHotelCost * days * Math.ceil(travelers / 2);
  const transportExpense = Math.round((budgetInINR < 20000 ? 800 : budgetInINR > 80000 ? 3000 : 1500) * days);
  const localFoodExpense = totalFoodCost * travelers;
  const entryTicketsExpense = totalActCost * travelers;
  const miscellaneousExpense = Math.round((hotelExpense + transportExpense + localFoodExpense) * 0.1);

  const totalExpense = hotelExpense + transportExpense + localFoodExpense + entryTicketsExpense + miscellaneousExpense;

  const expenseBreakdown: ExpenseBreakdown[] = [
    { category: "Accommodation (Hotels/Resorts)", amountInINR: hotelExpense },
    { category: "Local Transport & Cabs", amountInINR: transportExpense },
    { category: "Food & Dining Planners", amountInINR: localFoodExpense },
    { category: "Activities & Sightseeing Entry", amountInINR: entryTicketsExpense },
    { category: "Miscellaneous & Shopping Cushion", amountInINR: miscellaneousExpense }
  ];

  // Capitalize destination
  const capitalizedDestination = destination.split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  return {
    id: "offline-" + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    destination: capitalizedDestination,
    totalDays: days,
    travelers,
    budgetInINR,
    interests,
    language,
    days: dayPlans,
    estimatedTotalExpense: totalExpense,
    expenseBreakdown,
    packingChecklist: [
      ...template.packing,
      ...interests.map(interest => {
        const normalizedInterest = interest.toLowerCase();
        if (normalizedInterest.includes("nature")) return "Action camera or binoculars for wildlife watching";
        if (normalizedInterest.includes("adventure")) return "Sturdy high-traction sports shoes and quick-dry apparel";
        if (normalizedInterest.includes("culture") || normalizedInterest.includes("history")) return "Slightly formal / modest clothing for historical or religious sites";
        if (normalizedInterest.includes("food") || normalizedInterest.includes("dining")) return "Reusable water bottle and any personal digestive aids";
        if (normalizedInterest.includes("shopping")) return "Foldable light shopping bag and extra wallet/purse space";
        if (normalizedInterest.includes("relax")) return "Light wellness or swimwear items as appropriate";
        if (normalizedInterest.includes("photography")) return "Camera/phone charger and spare storage";
        return "Special hobby gear matching " + interest;
      })
    ].slice(0, 8),
    travelTips: template.tips
  };
}
