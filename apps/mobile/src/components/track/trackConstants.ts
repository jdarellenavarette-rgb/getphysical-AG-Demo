import type { MoveSportType } from "../../store/trackingStore";

export const SPORTS_LIST: { id: MoveSportType; label: string; icon: string; rateKcal: number }[] = [
  { id: "run", label: "Run", icon: "🏃", rateKcal: 68 },
  { id: "cycling", label: "Ride", icon: "🚴", rateKcal: 45 },
  { id: "walk", label: "Walk", icon: "🚶", rateKcal: 38 },
  { id: "pickleball", label: "Pickleball", icon: "🎾", rateKcal: 52 },
  { id: "tennis", label: "Tennis", icon: "🎾", rateKcal: 60 },
  { id: "boxing", label: "Boxing", icon: "🥊", rateKcal: 75 },
  { id: "basketball", label: "Hoops", icon: "🏀", rateKcal: 70 },
  { id: "swimming", label: "Swim", icon: "🏊", rateKcal: 65 },
  { id: "hiit", label: "HIIT", icon: "⚡", rateKcal: 80 },
  { id: "rowing", label: "Row", icon: "🚣", rateKcal: 62 },
  { id: "yoga", label: "Yoga", icon: "🧘", rateKcal: 30 },
];

export const BGC_CIRCUIT: [number, number][] = [
  [14.5492, 121.0487],
  [14.5505, 121.0498],
  [14.5518, 121.0512],
  [14.5532, 121.0526],
  [14.5546, 121.0512],
  [14.5535, 121.0495],
  [14.5512, 121.0482],
  [14.5492, 121.0487],
];
