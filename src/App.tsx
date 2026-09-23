/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Compass, 
  Calendar, 
  Users, 
  IndianRupee, 
  MapPin, 
  CheckSquare, 
  Square, 
  HelpCircle, 
  RotateCcw, 
  Sparkles, 
  Bookmark, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Globe, 
  BookOpen, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  Briefcase, 
  UtensilsCrossed, 
  Info,
  Layers,
  Terminal,
  Heart
} from "lucide-react";
import { Itinerary, TripPlanInput } from "./types";

const POPULAR_RECOMMENDATIONS = [
  { name: "Goa", description: "Sunny beaches, historic churches & delicious seafood", tag: "Goa" },
  { name: "Kerala", description: "Serene backwater houseboats, tea gardens & spices", tag: "Kerala" },
  { name: "Rajasthan", description: "Royal palaces, sand dunes & historic hill forts", tag: "Jaipur" },
  { name: "Tokyo, Japan", description: "Ultra-modern skyscrapers, ancient shrines & sushi", tag: "Tokyo" },
  { name: "Paris, France", description: "Art galleries, iconic cafés & stunning landmarks", tag: "Paris" }
];

const TRAVEL_INTERESTS = [
  { id: "nature", label: "🌿 Nature & Landscapes" },
  { id: "adventure", label: "🧗 Adventure & Outdoors" },
  { id: "culture", label: "🕌 History & Culture" },
  { id: "food", label: "🍛 Local Food & Dining" },
  { id: "shopping", label: "🛍️ Shopping & Souvenirs" },
  { id: "relaxation", label: "💆 Wellness & Relaxation" },
  { id: "photography", label: "📸 Scenic Photography" }
];

const PREFERRED_LANGUAGES = [
  "English",
  "Hindi (हिन्दी)",
  "Spanish (Español)",
  "French (Français)",
  "German (Deutsch)",
  "Bengali (বাংলা)",
  "Tamil (தமிழ்)"
];

const LOADING_STEPS = [
  "Coordinating local transit timetables...",
  "Retrieving local culinary expert recommendations...",
  "Matching sightseeing slots to travel interests...",
  "Analyzing budget categories and estimating entry fees...",
  "Formatting day-by-day visual map guides...",
  "Finalizing personalized packing checklists and survival tips..."
];

export default function App() {
  // Navigation & UI state
  const [step, setStep] = useState<"home" | "form" | "loading" | "results">("home");
  const [showSavedList, setShowSavedList] = useState(false);
  const [showLearningCenter, setShowLearningCenter] = useState(true);
  
  // Form input states
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [travelers, setTravelers] = useState(1);
  const [budgetInINR, setBudgetInINR] = useState(35000);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["culture", "food"]);
  const [language, setLanguage] = useState("English");
  
  // Validation and process states
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingStepIndex, setLoadingStepIndex] = useState(0);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [savedTrips, setSavedTrips] = useState<Itinerary[]>([]);
  const [apiMetadata, setApiMetadata] = useState<{ source: string; message: string }>({ source: "", message: "" });
  
  // Results view states
  const [activeDayTab, setActiveDayTab] = useState(1);
  const [showAllDays, setShowAllDays] = useState(false);
  const [packingStatus, setPackingStatus] = useState<Record<string, Record<string, boolean>>>({});

  // Fetch saved trips from local storage on load
  useEffect(() => {
    try {
      const stored = localStorage.getItem("travelmate_trips");
      if (stored) {
        setSavedTrips(JSON.parse(stored));
      }
      
      const storedPacking = localStorage.getItem("travelmate_packing");
      if (storedPacking) {
        setPackingStatus(JSON.parse(storedPacking));
      }
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }
  }, []);

  // Save trips list to local storage
  const saveTripsListToStorage = (updated: Itinerary[]) => {
    setSavedTrips(updated);
    localStorage.setItem("travelmate_trips", JSON.stringify(updated));
  };

  // Cycling the loading messages in standard interval
  useEffect(() => {
    let interval: any;
    if (step === "loading") {
      setLoadingStepIndex(0);
      interval = setInterval(() => {
        setLoadingStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [step]);

  // Form suggestions trigger
  const handleSelectRecommendation = (tag: string, name: string) => {
    setDestination(name);
    setStep("form");
  };

  // Checkbox pack status toggler
  const handleTogglePacking = (tripId: string, item: string) => {
    const updated = {
      ...packingStatus,
      [tripId]: {
        ...(packingStatus[tripId] || {}),
        [item]: !(packingStatus[tripId]?.[item] || false)
      }
    };
    setPackingStatus(updated);
    localStorage.setItem("travelmate_packing", JSON.stringify(updated));
  };

  // Reset form to defaults
  const handleResetForm = () => {
    setDestination("");
    setDays(3);
    setTravelers(1);
    setBudgetInINR(35000);
    setSelectedInterests(["culture", "food"]);
    setLanguage("English");
    setValidationError(null);
  };

  // Input validations
  const validateForm = (): boolean => {
    if (!destination.trim()) {
      setValidationError("📍 Please specify a destination (e.g. 'Goa' or 'Paris').");
      return false;
    }
    if (destination.trim().length < 2) {
      setValidationError("📍 Destination name is too short. Please be more specific.");
      return false;
    }
    if (days < 1 || days > 15) {
      setValidationError("📅 Travel days must be between 1 and 15 days for a smart planner.");
      return false;
    }
    if (travelers < 1 || travelers > 50) {
      setValidationError("👥 Traveler count must be between 1 and 50.");
      return false;
    }
    if (budgetInINR < 1000) {
      setValidationError("💵 Trip budget must be at least ₹1,000 INR.");
      return false;
    }
    setValidationError(null);
    return true;
  };

  // Call Express API endpoint to generate itinerary
  const handleGenerateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setStep("loading");
    
    // Construct interest labels from IDs
    const interestLabels = selectedInterests.map(id => {
      const match = TRAVEL_INTERESTS.find(item => item.id === id);
      return match ? match.label : id;
    });

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch("/api/generate-itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          destination: destination.trim(),
          days,
          travelers,
          budgetInINR,
          interests: interestLabels,
          language
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Server responded with an error status.");
      }

      if (!data?.itinerary) {
        throw new Error("The server returned an incomplete itinerary.");
      }
      setItinerary(data.itinerary);
      setApiMetadata({
        source: data.source,
        message: data.message
      });
      setActiveDayTab(1);
      setShowAllDays(false);
      setStep("results");
    } catch (err: unknown) {
      console.error("Submission failed:", err);
      const message = err instanceof DOMException && err.name === "AbortError"
        ? "The request timed out after 45 seconds."
        : err instanceof Error
          ? err.message
          : "An unexpected error occurred.";
      setValidationError(`⚠️ Failed to generate itinerary: ${message} Please retry.`);
      setStep("form");
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  // Save active trip to local storage
  const handleSaveActiveTrip = () => {
    if (!itinerary) return;
    
    // Check if already saved
    if (savedTrips.some(t => t.id === itinerary.id)) {
      alert("This trip is already saved in your bookmarks!");
      return;
    }

    const updated = [itinerary, ...savedTrips];
    saveTripsListToStorage(updated);
    alert("✨ Trip successfully bookmarked to your local storage!");
  };

  // Delete saved trip
  const handleDeleteTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this bookmarked trip?")) {
      const updated = savedTrips.filter(t => t.id !== id);
      saveTripsListToStorage(updated);
      if (itinerary?.id === id) {
        setItinerary(null);
        setStep("home");
      }
    }
  };

  // Load saved trip into results view
  const handleLoadTrip = (trip: Itinerary) => {
    setItinerary(trip);
    setDestination(trip.destination);
    setDays(trip.totalDays);
    setTravelers(trip.travelers);
    setBudgetInINR(trip.budgetInINR);
    setLanguage(trip.language);
    setActiveDayTab(1);
    setShowAllDays(false);
    setApiMetadata({
      source: "Bookmarked Storage",
      message: "Loaded from your locally saved itineraries."
    });
    setStep("results");
    setShowSavedList(false);
  };

  // Populate active trip variables back to editable form state
  const handleEditTrip = () => {
    if (!itinerary) return;
    setDestination(itinerary.destination);
    setDays(itinerary.totalDays);
    setTravelers(itinerary.travelers);
    setBudgetInINR(itinerary.budgetInINR);
    setLanguage(itinerary.language);
    setStep("form");
  };

  // Toggle multi-select interest pills
  const handleToggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter(i => i !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  // Find a matching decorative photograph for the destination
  const getHeaderImage = (dest: string) => {
    const norm = dest.toLowerCase();
    if (norm.includes("goa")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"; // Beach sunset
    }
    if (norm.includes("keral")) {
      return "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80"; // Backwaters
    }
    if (norm.includes("raj") || norm.includes("jaipur") || norm.includes("udaipur") || norm.includes("jodhpur")) {
      return "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80"; // Palace
    }
    if (norm.includes("tokyo") || norm.includes("japan")) {
      return "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"; // Tokyo Mount Fuji
    }
    if (norm.includes("paris") || norm.includes("france")) {
      return "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80"; // Paris Eiffel Tower
    }
    if (norm.includes("london") || norm.includes("uk")) {
      return "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80"; // London
    }
    if (norm.includes("delhi") || norm.includes("agra")) {
      return "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80"; // Taj Mahal
    }
    // Beautiful scenic default
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div 
            onClick={() => setStep("home")}
            className="flex items-center gap-2.5 cursor-pointer group"
            id="app-header-logo"
          >
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-sm group-hover:bg-emerald-700 transition-colors">
              <Compass className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                TravelMate <span className="text-emerald-600">AI</span>
              </span>
              <span className="hidden sm:inline-block text-xs text-slate-400 font-medium ml-2 border-l border-slate-200 pl-2">
                Smart Travel Planner
              </span>
            </div>
          </div>

          {/* Nav Controls */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSavedList(!showSavedList)}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                showSavedList 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
              id="btn-saved-trips"
            >
              <Bookmark className="w-4 h-4 text-emerald-600" />
              <span>Bookmarks</span>
              {savedTrips.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white shadow-sm">
                  {savedTrips.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowLearningCenter(!showLearningCenter)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
                showLearningCenter 
                  ? "bg-amber-50 text-amber-700 border-amber-200" 
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span className="hidden md:inline">Learning Guide</span>
            </button>
          </div>

        </div>
      </header>

      {/* OVERLAY: BOOKMARKED SAVED TRIPS LIST DRAWER */}
      {showSavedList && (
        <div className="bg-emerald-900/10 border-b border-emerald-200/60 p-4 shadow-inner">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Bookmark className="w-5 h-5 text-emerald-700" />
                Your Locally Saved Itineraries
              </h3>
              <button 
                onClick={() => setShowSavedList(false)}
                className="text-xs font-semibold text-emerald-700 hover:underline"
              >
                Close List
              </button>
            </div>
            
            {savedTrips.length === 0 ? (
              <p className="text-sm text-emerald-800 italic bg-white/80 rounded-lg p-4 border border-emerald-100/50">
                No bookmarked trips yet. Submit the form to generate a trip, then click "Save Trip" to keep it here permanently.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {savedTrips.map((trip) => (
                  <div 
                    key={trip.id}
                    onClick={() => handleLoadTrip(trip)}
                    className="group relative bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                        {trip.destination}
                      </span>
                      <button 
                        onClick={(e) => handleDeleteTrip(trip.id, e)}
                        className="p-1 text-slate-400 hover:text-red-500 rounded-md hover:bg-slate-50 transition-colors"
                        title="Delete itinerary"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {trip.totalDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {trip.travelers} pax
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-700 mt-2 flex items-center justify-between">
                      <span>₹{trip.budgetInINR.toLocaleString("en-IN")} INR</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {new Date(trip.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MASTER APP CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* VIEW 1: HOME PAGE HERO */}
        {step === "home" && (
          <div className="flex flex-col gap-8" id="view-home">
            
            {/* Banner Section */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80" 
                alt="Beautiful tourist scenic landscape road trip" 
                className="absolute inset-0 w-full h-full object-cover opacity-50"
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10 px-6 py-16 md:py-24 max-w-3xl flex flex-col items-start gap-4 text-left bg-gradient-to-r from-slate-950/80 to-transparent">
                <span className="bg-emerald-500 text-slate-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  AI-Powered Global Guides
                </span>
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Escape Ordinary. <br />
                  Plan Smarter with <span className="text-emerald-400">TravelMate AI</span>
                </h1>
                <p className="text-base md:text-lg text-slate-200 max-w-xl font-medium">
                  Say goodbye to chaotic vacation planning tabs. Our advanced expert generator designs beautiful, personalized daily itineraries, dining recommendations, and custom checklists in seconds.
                </p>
                <div className="flex flex-wrap gap-4 mt-2">
                  <button 
                    onClick={() => setStep("form")}
                    className="px-6 py-3.5 bg-emerald-500 text-slate-950 font-bold rounded-xl shadow-md hover:bg-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                    id="btn-plan-my-trip"
                  >
                    <Compass className="w-5 h-5" />
                    <span>Plan My Trip</span>
                  </button>
                  {savedTrips.length > 0 && (
                    <button 
                      onClick={() => setShowSavedList(true)}
                      className="px-6 py-3.5 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-all border border-white/20"
                    >
                      View Bookmarked Trips ({savedTrips.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Popular Quick-start suggestions grid */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-extrabold text-slate-950">Where are you heading next?</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {POPULAR_RECOMMENDATIONS.map((rec) => (
                  <div 
                    key={rec.name}
                    onClick={() => handleSelectRecommendation(rec.tag, rec.name)}
                    className="group bg-white border border-slate-200/80 rounded-xl overflow-hidden hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex flex-col"
                  >
                    <div className="h-32 bg-slate-100 overflow-hidden relative">
                      <img 
                        src={getHeaderImage(rec.tag)} 
                        alt={rec.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent"></div>
                      <span className="absolute bottom-2.5 left-3 text-white font-bold text-sm tracking-wide">
                        {rec.name}
                      </span>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {rec.description}
                      </p>
                      <div className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        <span>Plan Now</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: TRIP-PLANNING FORM */}
        {step === "form" && (
          <div className="max-w-3xl mx-auto w-full bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm" id="view-form">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">Custom Trip Parameters</h2>
                <p className="text-xs text-slate-500">Provide your travel details to engineer an itinerary tailored precisely to your constraints.</p>
              </div>
              <button 
                onClick={handleResetForm}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                title="Reset form"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* ERROR ALERTS */}
            {validationError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm flex items-start gap-2.5 animate-pulse">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Check Required Inputs:</span>
                  <p className="text-xs text-red-700 mt-0.5">{validationError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleGenerateTrip} className="flex flex-col gap-6">
              
              {/* Destination Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Destination *</span>
                </label>
                <div className="relative">
                  <input 
                    type="text"
                    value={destination}
                    onChange={(e) => {
                      setDestination(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    placeholder="e.g. Goa, Kerala backwaters, Rajasthan, Paris, Tokyo"
                    className="w-full pl-3.5 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/50 outline-none text-sm transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400">Specify any global city, region, state or national spot. Try "Goa" or "Kerala" for customized localized offline data!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Travel Days (1-15) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Number of Days ({days} days) *</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range"
                      min="1"
                      max="15"
                      value={days}
                      onChange={(e) => setDays(Number(e.target.value))}
                      className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-slate-100 rounded-lg appearance-none"
                    />
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/50 px-3 py-1.5 rounded-lg text-xs font-bold w-16 text-center">
                      {days} Day{days > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Duration affects checklist volume & day-by-day itineraries.</p>
                </div>

                {/* Travelers (1-50) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Number of Travelers ({travelers}) *</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={() => setTravelers(Math.max(1, travelers - 1))}
                      className="px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-100 font-bold text-sm transition-all text-slate-600"
                    >
                      -
                    </button>
                    <input 
                      type="number"
                      min="1"
                      max="50"
                      value={travelers}
                      onChange={(e) => setTravelers(Math.max(1, Math.min(50, Number(e.target.value))))}
                      className="w-16 text-center py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none"
                    />
                    <button 
                      type="button"
                      onClick={() => setTravelers(Math.min(50, travelers + 1))}
                      className="px-3 py-1.5 border border-slate-200 bg-slate-50 rounded-lg hover:bg-slate-100 font-bold text-sm transition-all text-slate-600"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">Used to calculate per-person expenses and hotel requirements.</p>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Budget input in INR */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>Budget (Indian Rupees - INR) *</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400 text-sm font-bold">₹</span>
                    <input 
                      type="number"
                      min="1000"
                      step="5000"
                      value={budgetInINR}
                      onChange={(e) => setBudgetInINR(Math.max(0, Number(e.target.value)))}
                      className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-sm transition-all"
                      required
                    />
                  </div>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    <button 
                      type="button"
                      onClick={() => setBudgetInINR(15000)}
                      className={`px-2 py-1 text-[11px] rounded-md font-semibold border transition-all ${budgetInINR === 15000 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"}`}
                    >
                      Budget (₹15K)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBudgetInINR(45000)}
                      className={`px-2 py-1 text-[11px] rounded-md font-semibold border transition-all ${budgetInINR === 45000 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"}`}
                    >
                      Mid-Range (₹45K)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setBudgetInINR(120000)}
                      className={`px-2 py-1 text-[11px] rounded-md font-semibold border transition-all ${budgetInINR === 120000 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"}`}
                    >
                      Premium (₹1.2L)
                    </button>
                  </div>
                </div>

                {/* Preferred Language */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Preferred Language</span>
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-none text-sm transition-all"
                  >
                    {PREFERRED_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400">Itinerary text will translate to match chosen dialect.</p>
                </div>

              </div>

              {/* Travel Interests (multi-select) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>Travel Interests (Select at least one)</span>
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {TRAVEL_INTERESTS.map((interest) => {
                    const isSelected = selectedInterests.includes(interest.id);
                    return (
                      <button
                        type="button"
                        key={interest.id}
                        onClick={() => handleToggleInterest(interest.id)}
                        className={`px-3 py-2 text-xs rounded-xl font-bold border transition-all flex items-center gap-1.5 ${
                          isSelected 
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" 
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-200" />}
                        <span>{interest.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm tracking-wide rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-99"
                  id="btn-generate-trip"
                >
                  <Sparkles className="w-[18px] h-[18px]" />
                  <span>Generate AI Trip Itinerary</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep("home")}
                  className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-all border border-slate-200"
                >
                  Back
                </button>
              </div>

            </form>
          </div>
        )}

        {/* VIEW 3: DYNAMIC LOADING STATE */}
        {step === "loading" && (
          <div className="max-w-md mx-auto text-center py-16 px-4 flex flex-col items-center gap-6 bg-white border border-slate-200 rounded-2xl shadow-sm" id="view-loading">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
              <Compass className="w-6 h-6 text-emerald-600 absolute top-5 left-5 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-extrabold text-slate-900">Customizing Your Dream Trip</h3>
              <p className="text-xs text-slate-400">TravelMate AI is formulating day-by-day travel suggestions...</p>
            </div>

            {/* Cyclical Loading Indicator Step */}
            <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center gap-3 text-left">
              <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
              <div>
                <span className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">Current Operations Status</span>
                <p className="text-xs text-slate-700 font-bold mt-0.5 transition-all">
                  {LOADING_STEPS[loadingStepIndex]}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Student Info: Running real-time on Google's Gemini 3.8 Flash model. Fallback enabled.
            </p>
          </div>
        )}

        {/* VIEW 4: ITINERARY DISPLAY RESULTS DASHBOARD */}
        {step === "results" && itinerary && (
          <div className="flex flex-col gap-6" id="view-results">
            
            {/* Header / Meta card */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="h-56 relative">
                <img 
                  src={getHeaderImage(itinerary.destination)} 
                  alt={itinerary.destination} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent"></div>
                
                {/* Meta float pills */}
                <div className="absolute bottom-4 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="text-left space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-emerald-200 font-bold uppercase tracking-wide">Ready-Made Itinerary</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
                      {itinerary.destination}
                    </h2>
                  </div>
                  
                  {/* Top-Right action tags */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveActiveTrip}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                      id="btn-save-trip"
                    >
                      <Bookmark className="w-[18px] h-[18px]" />
                      <span>Save Trip</span>
                    </button>
                    <button
                      onClick={handleEditTrip}
                      className="px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md rounded-xl font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
                      id="btn-edit-trip"
                    >
                      <Edit3 className="w-[18px] h-[18px]" />
                      <span>Edit Parameters</span>
                    </button>
                    <button
                      onClick={() => setStep("form")}
                      className="px-4 py-2.5 bg-slate-900/60 hover:bg-slate-900 text-white backdrop-blur-md rounded-xl font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
                      id="btn-reset-itinerary"
                    >
                      <RotateCcw className="w-[18px] h-[18px]" />
                      <span>New Plan</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Meta details dashboard strip */}
              <div className="p-4 bg-slate-50 border-t border-slate-150 flex flex-wrap gap-4 items-center justify-between text-slate-600 text-xs font-semibold">
                <div className="flex flex-wrap gap-x-6 gap-y-2">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Duration: <strong className="text-slate-800">{itinerary.totalDays} Days</strong></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span>Travelers: <strong className="text-slate-800">{itinerary.travelers} Persons</strong></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span>Intended Budget: <strong className="text-slate-800">₹{itinerary.budgetInINR.toLocaleString("en-IN")} INR</strong></span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Dialect: <strong className="text-slate-800">{itinerary.language}</strong></span>
                  </span>
                </div>

                <div className="bg-emerald-100/70 border border-emerald-200/50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-[11px] text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Generated via: <strong>{apiMetadata.source || "Expert Database"}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick alert bar describing the API success or fallback */}
            {apiMetadata.message && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{apiMetadata.message}</span>
              </div>
            )}

            {/* Dashboard grid structure */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left/Middle Column: Day by Day Timeline */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                
                {/* Day-by-day Itinerary controls */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                        <Compass className="w-[18px] h-[18px] text-emerald-600" />
                        <span>Day-by-Day Program</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">Click on any tab below or expand the entire schedule timeline.</p>
                    </div>
                    
                    <button
                      onClick={() => setShowAllDays(!showAllDays)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        showAllDays 
                          ? "bg-slate-950 text-white border-slate-950" 
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      {showAllDays ? "Show Single Day View" : "Expand All Days Timeline"}
                    </button>
                  </div>

                  {/* Tabs Slider (Only if single day view is active) */}
                  {!showAllDays && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                      {itinerary.days.map((d) => (
                        <button
                          key={d.dayNumber}
                          onClick={() => setActiveDayTab(d.dayNumber)}
                          className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all border ${
                            activeDayTab === d.dayNumber
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          Day {d.dayNumber}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timeline Render */}
                  <div className="space-y-6">
                    {itinerary.days
                      .filter((d) => showAllDays || d.dayNumber === activeDayTab)
                      .map((day) => (
                        <div key={day.dayNumber} className="relative pl-0 md:pl-6 border-l-0 md:border-l-2 md:border-emerald-100 space-y-4">
                          
                          {/* Day Banner anchor */}
                          <div className="flex items-center gap-2.5 mb-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-extrabold text-white shadow-sm">
                              D{day.dayNumber}
                            </span>
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              Theme: {day.theme || `Exploring ${itinerary.destination}`}
                            </h4>
                          </div>

                          {/* Sub-Day Activities list */}
                          <div className="space-y-3.5 pl-2 md:pl-0">
                            <h5 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Places & Activities</h5>
                            {day.activities && day.activities.length > 0 ? (
                              day.activities.map((act, aIdx) => (
                                <div key={aIdx} className="bg-slate-50/50 border border-slate-200/60 p-4 rounded-xl flex flex-col md:flex-row gap-3 items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                        {act.time}
                                      </span>
                                      <strong className="text-slate-800 text-xs font-extrabold">{act.placeName}</strong>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                      {act.description}
                                    </p>
                                  </div>
                                  <span className="text-xs font-bold text-slate-600 bg-white border border-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                                    {act.costInINR > 0 ? `₹${act.costInINR.toLocaleString("en-IN")}` : "Free Entry"}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic">No scheduled activities listed for this day.</p>
                            )}
                          </div>

                          {/* Sub-Day Food Recommendations */}
                          <div className="space-y-3.5 pl-2 md:pl-0 pt-2 border-t border-dashed border-slate-200">
                            <h5 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 flex items-center gap-1">
                              <UtensilsCrossed className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Food Recommendations & Diners</span>
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              {day.foodRecommendations && day.foodRecommendations.length > 0 ? (
                                day.foodRecommendations.map((food, fIdx) => (
                                  <div key={fIdx} className="bg-amber-50/30 border border-amber-100 p-3 rounded-xl flex flex-col justify-between gap-1.5 text-left">
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] uppercase font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-sm">
                                        {food.meal}
                                      </span>
                                      <div className="font-bold text-xs text-slate-800 mt-1">{food.placeSuggestion}</div>
                                      <p className="text-[11px] text-slate-500 leading-normal italic">
                                        "{food.dishDescription}"
                                      </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 mt-1 border-t border-slate-100 pt-1 block">
                                      Avg Spend: ₹{food.estimatedCostInINR}/person
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 italic col-span-3">No specific dining records reported.</p>
                              )}
                            </div>
                          </div>

                        </div>
                      ))}
                  </div>

                </div>

              </div>

              {/* Right Column: Cost Statistics, Checklists, Tips */}
              <div className="flex flex-col gap-6">
                
                {/* Visual Expenses Breakdown */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-4">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <TrendingUp className="w-[18px] h-[18px] text-emerald-600" />
                      <span>Estimated Expense Breakdown</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Total estimated sum compared to your budget constraint.</p>
                  </div>

                  {/* Expense comparison meter */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-500">Total Spent Estimate</span>
                      <span className={`${itinerary.estimatedTotalExpense > itinerary.budgetInINR ? "text-red-600" : "text-emerald-700"}`}>
                        ₹{itinerary.estimatedTotalExpense.toLocaleString("en-IN")} / ₹{itinerary.budgetInINR.toLocaleString("en-IN")}
                      </span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          itinerary.estimatedTotalExpense > itinerary.budgetInINR 
                            ? "bg-red-500" 
                            : itinerary.estimatedTotalExpense > itinerary.budgetInINR * 0.85 
                              ? "bg-amber-500" 
                              : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min(100, (itinerary.estimatedTotalExpense / itinerary.budgetInINR) * 100)}%` }}
                      ></div>
                    </div>
                    
                    {/* Comparison Status Text */}
                    <div className="text-[10px] font-semibold text-slate-400 flex items-center justify-between">
                      <span>0%</span>
                      <span>
                        {itinerary.estimatedTotalExpense > itinerary.budgetInINR 
                          ? "⚠️ ₹" + (itinerary.estimatedTotalExpense - itinerary.budgetInINR).toLocaleString() + " over intended budget" 
                          : "🟢 ₹" + (itinerary.budgetInINR - itinerary.estimatedTotalExpense).toLocaleString() + " under budget cushion"}
                      </span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* List of categories with visual mini-bars */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">Itemized Budget Pillars</h4>
                    {itinerary.expenseBreakdown && itinerary.expenseBreakdown.length > 0 ? (
                      itinerary.expenseBreakdown.map((item, idx) => {
                        const ratio = Math.max(5, Math.round((item.amountInINR / itinerary.estimatedTotalExpense) * 100));
                        return (
                          <div key={idx} className="space-y-1 text-left">
                            <div className="flex justify-between text-xs">
                              <span className="font-semibold text-slate-700 truncate max-w-[180px]">{item.category}</span>
                              <span className="font-bold text-slate-900">₹{item.amountInINR.toLocaleString("en-IN")} ({ratio}%)</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-slate-400 rounded-full"
                                style={{ width: `${ratio}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">No breakdown available.</p>
                    )}
                  </div>
                </div>

                {/* Interactive Packing Checklist */}
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-3">
                  <div className="border-b border-slate-100 pb-2.5">
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Briefcase className="w-[18px] h-[18px] text-emerald-600" />
                      <span>Custom Packing Checklist</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Tailored recommendations. Check items off as you pack!</p>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {itinerary.packingChecklist && itinerary.packingChecklist.length > 0 ? (
                      itinerary.packingChecklist.map((item, idx) => {
                        const isChecked = packingStatus[itinerary.id]?.[item] || false;
                        return (
                          <div 
                            key={idx}
                            onClick={() => handleTogglePacking(itinerary.id, item)}
                            className={`flex items-start gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors text-left text-xs ${
                              isChecked ? "text-slate-400 line-through bg-slate-50/40" : "text-slate-700 font-medium"
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                            <span>{item}</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 italic">No specific checklists calculated.</p>
                    )}
                  </div>
                </div>

                {/* Smart Travel Tips / Survival */}
                <div className="bg-amber-50/20 border border-amber-200 p-4 rounded-2xl shadow-sm space-y-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Sparkles className="w-[18px] h-[18px] text-amber-600" />
                      <span>Smart Survival Travel Tips</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Crucial local guidelines and etiquette parameters.</p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-left">
                    {itinerary.travelTips && itinerary.travelTips.length > 0 ? (
                      itinerary.travelTips.map((tip, idx) => (
                        <li key={idx} className="flex gap-2 items-start text-slate-600 font-medium leading-relaxed">
                          <span className="text-amber-500 font-bold mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic">No tips reported.</p>
                    )}
                  </ul>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* EDUCATIONAL ROW: PROMPT ENGINEERING & ARCHITECTURE BEHIND THE SCENES */}
        {showLearningCenter && (
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl p-6 md:p-8 text-left space-y-6" id="view-learning-center">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider">
                  Student Learning Center
                </span>
                <h3 className="text-lg md:text-xl font-extrabold flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-amber-400" />
                  <span>How Prompt Engineering Powers This App</span>
                </h3>
              </div>
              <button 
                onClick={() => setShowLearningCenter(false)}
                className="text-xs font-semibold text-slate-400 hover:text-white transition-colors border border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-800"
              >
                Dismiss Guide
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              This application was architected to help student developers understand how natural language prompts can be combined with visual interfaces to build responsive, robust, and intelligent full-stack applications. Below is an overview of the four key development stages:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Box 1 */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold">1</span>
                  <h4 className="font-bold text-xs text-slate-200">System Instruction Modeling</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We program the model's persona using the <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">systemInstruction</code> parameter inside `@google/genai`. This forces Gemini to act as a seasoned global tour operator rather than a generic text generator, ensuring the output uses professional terminology, proper currency denominations (INR), and consistent formatting.
                </p>
              </div>

              {/* Box 2 */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold">2</span>
                  <h4 className="font-bold text-xs text-slate-200">Guaranteed Structuring (JSON Schema)</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Historically, developers struggled with parsing messy, raw Markdown tick outputs (<code className="text-amber-300">```json</code>) from LLMs. By setting the <code className="text-amber-300">responseMimeType: "application/json"</code> and defining a strict <code className="text-amber-300">responseJsonSchema</code> object matching our TypeScript types, we ensure Gemini returns a structured data tree that never crashes the frontend.
                </p>
              </div>

              {/* Box 3 */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold">3</span>
                  <h4 className="font-bold text-xs text-slate-200">Model Choice & Latency Optimization</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We selected <code className="text-amber-300">gemini-3.8-flash</code> as our master engine. It offers exceptional speed, optimized token pricing for long itineraries, and native support for complex structured schemas, striking a perfect balance for rapid, live prototypes.
                </p>
              </div>

              {/* Box 4 */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold">4</span>
                  <h4 className="font-bold text-xs text-slate-200">Error Handling & High-Fidelity Fallback</h4>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Production-grade apps cannot break when an API limit is exceeded or keys are not ready. This portal implements a try-catch fail-safe wrapper. If the Google Cloud API is unreachable, it fires our local offline engine, which uses deterministic algorithms to generate beautifully styled, custom itineraries on the fly.
                </p>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-current" />
                <span>Crafted as a professional, open educational prototype.</span>
              </span>
              <span>Class Reference: CS-501 AI Application Architectures</span>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 TravelMate AI. All rights reserved. Built with Google AI Studio.</p>
          <div className="flex gap-4">
            <a href="#" onClick={(e) => { e.preventDefault(); setStep("home"); }} className="hover:text-emerald-600 transition-colors">Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setStep("form"); }} className="hover:text-emerald-600 transition-colors">Plan Trip</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setShowLearningCenter(true); }} className="hover:text-emerald-600 transition-colors">Learning Guide</a>
          </div>
        </div>
      </footer>

    </div>
  );
}