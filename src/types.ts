/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TripPlanInput {
  destination: string;
  days: number;
  travelers: number;
  budgetInINR: number;
  interests: string[];
  language: string;
}

export interface Activity {
  time: string; // e.g. "09:00 AM"
  placeName: string;
  description: string;
  costInINR: number;
}

export interface DayPlan {
  dayNumber: number;
  theme: string; // e.g., "Exploring Heritage and Culture"
  activities: Activity[];
  foodRecommendations: {
    meal: string; // e.g., "Breakfast", "Lunch", "Dinner"
    placeSuggestion: string;
    dishDescription: string;
    estimatedCostInINR: number;
  }[];
}

export interface ExpenseBreakdown {
  category: string; // e.g., "Accommodation", "Food", "Transport", "Activities & Entry", "Emergency Fund"
  amountInINR: number;
}

export interface Itinerary {
  id: string; // unique ID to support saving/loading
  createdAt: string; // ISO date string
  destination: string;
  totalDays: number;
  travelers: number;
  budgetInINR: number;
  interests: string[];
  language: string;
  days: DayPlan[];
  estimatedTotalExpense: number;
  expenseBreakdown: ExpenseBreakdown[];
  packingChecklist: string[];
  travelTips: string[];
}
