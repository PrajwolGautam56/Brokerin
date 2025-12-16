import {
  BuildingOfficeIcon,
  HomeModernIcon,
  ShieldCheckIcon,
  WifiIcon,
  TvIcon,
  HomeIcon,
  SparklesIcon,
  BoltIcon,
  FireIcon,
  UserGroupIcon,
  HeartIcon,
  TruckIcon,
  VideoCameraIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  BuildingLibraryIcon,
  TrophyIcon,
  SunIcon
} from '@heroicons/react/24/outline';

const iconMap = {
  // Common amenities (handles both lowercase and uppercase)
  gym: UserGroupIcon,
  'gymnasium': UserGroupIcon,
  'fitness': UserGroupIcon,
  'fitnesscenter': UserGroupIcon,
  'fitness center': UserGroupIcon,
  
  parking: TruckIcon,
  'parking space': TruckIcon,
  'car parking': TruckIcon,
  'parking lot': TruckIcon,
  
  pool: SparklesIcon,
  'swimming pool': SparklesIcon,
  'swimmingpool': SparklesIcon,
  
  wifi: WifiIcon,
  'wifi internet': WifiIcon,
  'internet': WifiIcon,
  'free wifi': WifiIcon,
  
  tv: TvIcon,
  'television': TvIcon,
  'cable tv': TvIcon,
  
  security: ShieldCheckIcon,
  '24/7 security': ShieldCheckIcon,
  'security guard': ShieldCheckIcon,
  'security system': ShieldCheckIcon,
  
  power: BoltIcon,
  'power backup': BoltIcon,
  'backup power': BoltIcon,
  'generator': BoltIcon,
  
  cctv: VideoCameraIcon,
  'cctv camera': VideoCameraIcon,
  'surveillance': VideoCameraIcon,
  
  lift: BuildingOfficeIcon,
  'elevator': BuildingOfficeIcon,
  
  hospital: BuildingOfficeIcon,
  'near hospital': BuildingOfficeIcon,
  
  pharmacy: BeakerIcon,
  'near pharmacy': BeakerIcon,
  
  supermarket: HomeModernIcon,
  'near supermarket': HomeModernIcon,
  'grocery': HomeModernIcon,
  
  spa: SparklesIcon,
  'spa & wellness': SparklesIcon,
  
  cafe: FireIcon,
  'restaurant': FireIcon,
  'near restaurant': FireIcon,
  
  badminton: TrophyIcon,
  'badminton court': TrophyIcon,
  
  tennis: TrophyIcon,
  'tennis court': TrophyIcon,
  
  'table tennis': TrophyIcon,
  'tabletennis': TrophyIcon,
  
  snooker: TrophyIcon,
  'snooker table': TrophyIcon,
  
  housekeeping: SparklesIcon,
  'house keeping': SparklesIcon,
  
  playground: SunIcon,
  'play ground': SunIcon,
  'kids playground': SunIcon,
  
  'pet park': SunIcon,
  'petpark': SunIcon,
  'pet friendly': SunIcon,
  
  'party hall': BuildingLibraryIcon,
  'partyhall': BuildingLibraryIcon,
  'community hall': BuildingLibraryIcon,
  
  plumbing: WrenchScrewdriverIcon,
  'plumbing service': WrenchScrewdriverIcon,
  
  water: BeakerIcon,
  'water supply': BeakerIcon,
  '24/7 water': BeakerIcon,
  
  garden: SunIcon,
  'landscaped garden': SunIcon,
  'green garden': SunIcon,
  
  clubhouse: BuildingLibraryIcon,
  'club house': BuildingLibraryIcon,
  'community center': BuildingLibraryIcon,
  
  basketball: TrophyIcon,
  'basketball court': TrophyIcon,
  
  solar: SunIcon,
  'solar power': SunIcon,
  'solar panel': SunIcon,
  
  home: HomeIcon,
  health: HeartIcon,
  'health center': HeartIcon,
  'medical center': HeartIcon,
  
  default: HomeIcon
};

function AmenityIcon({ name, className = "w-5 h-5" }) {
  // Normalize the name: lowercase, remove spaces, handle common variations
  const normalized = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '') // Remove all spaces
    .replace(/[^a-z0-9]/g, ''); // Remove special characters
  
  // Try exact match first
  let Icon = iconMap[normalized];
  
  // If not found, try partial matches
  if (!Icon) {
    const keys = Object.keys(iconMap);
    const match = keys.find(key => 
      normalized.includes(key) || key.includes(normalized)
    );
    Icon = match ? iconMap[match] : iconMap.default;
  }
  
  return <Icon className={className} />;
}

export default AmenityIcon; 