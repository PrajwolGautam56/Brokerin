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
  SwimmingPoolIcon,
  UserGroupIcon,
  HeartIcon,
  ParkingIcon,
  VideoCameraIcon,
  WrenchScrewdriverIcon,
  BeakerIcon,
  TreeIcon,
  BuildingLibraryIcon,
  TableTennisIcon,
  TrophyIcon,
  SunIcon
} from '@heroicons/react/24/outline';

const iconMap = {
  hospital: BuildingOfficeIcon,
  pharmacy: BeakerIcon,
  supermarket: HomeModernIcon,
  spa: SparklesIcon,
  cafe: FireIcon,
  badminton: TableTennisIcon,
  tennis: TrophyIcon,
  tableTennis: TableTennisIcon,
  snooker: TrophyIcon,
  gym: UserGroupIcon,
  pool: SwimmingPoolIcon,
  security: ShieldCheckIcon,
  power: BoltIcon,
  housekeeping: SparklesIcon,
  playground: TreeIcon,
  petPark: TreeIcon,
  partyHall: BuildingLibraryIcon,
  plumbing: WrenchScrewdriverIcon,
  cctv: VideoCameraIcon,
  water: BeakerIcon,
  garden: TreeIcon,
  clubhouse: BuildingLibraryIcon,
  basketball: TrophyIcon,
  solar: SunIcon,
  wifi: WifiIcon,
  tv: TvIcon,
  home: HomeIcon,
  parking: ParkingIcon,
  health: HeartIcon,
  default: HomeIcon
};

function AmenityIcon({ name, className = "w-5 h-5" }) {
  const Icon = iconMap[name.toLowerCase()] || iconMap.default;
  return <Icon className={className} />;
}

export default AmenityIcon; 