export const rules = {
  propertyListings: {
    title: "Property Listings",
    rules: [
      "All properties listed for sale or rent must be legally owned by the seller/landlord or listed with their authorization",
      "Listings must include accurate details such as: Location, asking price, property description, amenities, and photographs",
      "Legal status of the property (e.g., clear tittle deeds, no encumbrances)",
      "The terms of sale or rent, including deposit and maintenance terms for rentals"
    ],
    note: "Encumbrances (EC): An Encumbrance Certificate (EC) is a legal document that verifies a property's ownership and confirms that it's free of legal or financial issues."
  },

  pgHostelListings: {
    title: "PG Hostel Listings",
    requirements: [
      "Provide clear descriptions of the hostel, including rent, deposit, and the type of accommodations available",
      "List amenities, occupancy restrictions, gender-specific areas, and available facilities (e.g., Wi-Fi, meals, security)",
      "Include detailed house rules regarding check-in/out, visitor policies, and payment terms",
      "Maintain the safety, cleanliness, and legal compliance of the hostel"
    ]
  },

  paymentTerms: {
    title: "Payment Terms",
    terms: [
      "Payments for transactions (rentals, sales, bookings) must be completed through secure and authorized payment gateways",
      "BrokerIn does not directly handle payments between users but offers a platform for users to connect and initiate transactions"
    ]
  },

  prohibitedActivities: {
    title: "Prohibited Activities",
    activities: [
      "Posting fraudulent or misleading listings",
      "Using the platform for illegal activities",
      "Using offensive language or discriminatory content",
      "Engaging in transactions that violate local laws or regulations"
    ]
  },

  userVerification: {
    title: "User Verification",
    process: [
      "Users may be required to verify their identity before posting listings",
      "Verification may include submitting documents providing property ownership or authorization for listing properties/hostels",
      "Once the property is posted in website, brokerin employee will visit the property / hostels and if it reaches to brokerin rules will provide the access"
    ]
  },

  safetyAndSecurity: {
    title: "Safety and Security",
    guidelines: [
      "BrokerIn advises verifying all details before completing any deal",
      "If the property lacks accurate or complete information, proceed with caution and verify all details before making any decisions"
    ]
  },

  cancellationAndRefund: {
    title: "Cancellation and Refund Policies",
    policies: [
      "Property sales and rental agreements are regulated by the specific terms outlined in the contract between the parties",
      "Last-minute cancellations are not permitted"
    ]
  },

  userResponsibilities: {
    title: "User Responsibilities and Guidelines",
    guidelines: [
      "Users must ensure that all listings are accurate, truthful, and up-to-date",
      "Legal Compliance: Users must ensure they follow all applicable laws, including real estate regulations, tenancy laws, and health and safety standards for PG hostels",
      "Clear Framework: Our Terms & Conditions and Rules & Regulations outline a transparent process for property transactions, rentals, and PG hostel listings",
      "User Awareness: These guidelines help users understand their rights, responsibilities, and obligations while using BrokerIn, ensuring a smooth and secure experience"
    ],
    note: "It is always recommended to have these documents reviewed by a legal professional to ensure compliance with local laws and regulations, providing added protection for your platform and its users"
  },

  signupProcess: {
    title: "How to Sign Up / Sign In to BrokerIn",
    steps: [
      {
        step: 1,
        title: "Create an Account",
        description: "Sign up or log in to the BrokerIn platform to access your dashboard"
      },
      {
        step: 2,
        description: "Provide basic information such as your name, email address, and contact number"
      },
      {
        step: 3,
        title: "Choose Property Type",
        options: [
          "Residential (For Sale, For Rent)",
          "Commercial (For Sale, For Rent)",
          "PG Hostels (For Men or Women)"
        ]
      },
      {
        step: 4,
        title: "Property Details Form",
        details: {
          residential: [
            "Property Title",
            "Property Type (Sale/Rent)",
            "Location (Pin Code, Locality)",
            "Property Price",
            "Area (Sq. Ft.)",
            "Bedrooms and Bathrooms",
            "Property Description",
            "Images",
            "Floor Plan",
            "Amenities",
            "Property Status",
            "Owner/Agent Contact Details"
          ]
        }
      }
    ]
  },

  companyInfo: {
    title: "Our Story – BrokerIn Pvt. Ltd.",
    established: "December 2014",
    location: "Bangalore, Karnataka",
    vision: {
      title: "Our Vision",
      points: [
        {
          title: "Hassle-Free Transactions",
          description: "Making Real Estate Easy – We're here to take the stress out of buying, selling, and renting"
        },
        {
          title: "Trust and Transparency",
          description: "Honest Deals, No Surprises – Our vision is a real estate market built on fairness and honesty"
        },
        {
          title: "Affordable and Accessible",
          description: "Real Estate for Everyone – Finding a home or investment should be within reach for all"
        },
        {
          title: "Customer-First Approach",
          description: "People First, Always – Providing personalized guidance and support at every step"
        },
        {
          title: "Innovation and Growth",
          description: "Smarter Solutions, Better Results – Using modern tools for efficient real estate transactions"
        }
      ]
    },
    team: [
      {
        name: "Santhosh Srinivas",
        designation: "Founder & CEO",
        company: "BrokerIn Pvt. Ltd"
      },
      {
        name: "Roshan Vennavalli",
        designation: "Managing Director",
        company: "BrokerIn Pvt. Ltd"
      },
      {
        name: "Bhavani.S",
        designation: "Accounts",
        company: "BrokerIn Pvt. Ltd"
      }
    ]
  }
}; 