export const propertyFilters = {
  propertyType: {
    title: "Property Type",
    options: [
      { id: "office_space", label: "Office Space" },
      { id: "co_working", label: "Co-Working" },
      { id: "shop", label: "Shop" },
      { id: "showroom", label: "Showroom" },
      { id: "industrial_building", label: "Industrial Building" },
      { id: "industrial_shed", label: "Industrial Shed" },
      { id: "godown_warehouse", label: "Gowdown/Warehouse" },
      { id: "other_business", label: "Other business" },
      { id: "restaurant_cafe", label: "Restaurant/Cafe" }
    ]
  },

  searchType: {
    title: "Search Type",
    options: [
      {
        id: "locality",
        label: "Locality Search",
        placeholder: "Search upto 3 localities or landmarks"
      },
      {
        id: "metro",
        label: "Search along Metro",
        placeholder: "Search Metro Stations or Lines"
      }
    ]
  },

  lookingFor: {
    title: "Looking For",
    options: [
      { id: "rent", label: "Rent" },
      { id: "buy", label: "Buy" }
    ]
  },

  priceRange: {
    title: "Rent Range",
    min: 0,
    max: 100000,
    step: 1000,
    unit: "₹",
    maxLabel: "1Cr"
  },

  builtUpArea: {
    title: "BuiltUp Area",
    min: 0,
    max: 100000,
    step: 100,
    unit: "Sq.ft"
  },

  availability: {
    title: "Availability",
    options: [
      { id: "immediate", label: "Immediate" },
      { id: "within_15_days", label: "Within 15 Days" },
      { id: "within_30_days", label: "Within 30 Days" },
      { id: "after_30_days", label: "After 30 Days" }
    ]
  },

  furnishing: {
    title: "Furnishing",
    options: [
      { id: "full", label: "Full" },
      { id: "semi", label: "Semi" },
      { id: "none", label: "None" }
    ]
  },

  buildingType: {
    title: "Building Type",
    options: [
      {
        id: "independent_house",
        label: "Independent House"
      },
      {
        id: "business_park",
        label: "Business Park"
      },
      {
        id: "mall",
        label: "Mall"
      },
      {
        id: "independent_shop",
        label: "Independent shop"
      },
      {
        id: "standalone_building",
        label: "Standalone building"
      }
    ]
  },

  parking: {
    title: "Parking",
    options: [
      {
        id: "public",
        label: "Public"
      },
      {
        id: "reserved",
        label: "Reserved"
      }
    ]
  }
}; 