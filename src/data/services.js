import {
  WrenchScrewdriverIcon,
  BoltIcon,
  PaintBrushIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  TruckIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

export const services = [
  {
    id: 1,
    name: "Plumbing Services",
    icon: WrenchScrewdriverIcon,
    description: "Professional plumbing repairs and installations",
    price: "₹499/visit",
    categories: ["Repair", "Installation", "Maintenance"],
    features: [
      "24/7 Emergency Service",
      "Licensed Professionals",
      "90-Day Service Warranty"
    ],
    options: [
      "Pipe Repair/Replacement",
      "Drain Cleaning",
      "Water Heater Services",
      "Bathroom Fixtures",
      "Leak Detection",
      "Sewer Line Services"
    ]
  },
  {
    id: 2,
    name: "Electrical Work",
    icon: BoltIcon,
    description: "Complete electrical solutions for your home",
    price: "₹599/visit",
    categories: ["Repair", "Installation", "Safety Inspection"],
    features: [
      "Licensed Electricians",
      "Same Day Service",
      "Safety Guaranteed"
    ],
    options: [
      "Wiring Installation",
      "Circuit Breaker Service",
      "Lighting Installation",
      "Electrical Safety Inspection",
      "Generator Installation",
      "Smart Home Setup"
    ]
  },
  {
    id: 3,
    name: "Painting",
    icon: PaintBrushIcon,
    description: "Professional painting services for your space",
    price: "₹40/sqft",
    categories: ["Interior", "Exterior", "Touch-up"],
    features: [
      "Premium Quality Paints",
      "Expert Painters",
      "Clean Work Environment"
    ],
    options: [
      "Interior Painting",
      "Exterior Painting",
      "Wallpaper Installation",
      "Texture Painting",
      "Wood Finishing",
      "Metal Painting"
    ]
  },
  // Add more services as needed
]; 