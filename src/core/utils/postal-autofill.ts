export interface CountryInfo {
  code: string; // ISO 2-letter
  name: string;
  dialCode: string;
  flag: string;
  postalCodeRequired: boolean;
  postalCodeRegex?: RegExp;
  postalCodeFormat?: string;
  states: string[];
}

export const COUNTRIES: CountryInfo[] = [
  {
    code: "IN",
    name: "India",
    dialCode: "+91",
    flag: "🇮🇳",
    postalCodeRequired: true,
    postalCodeRegex: /^[1-9][0-9]{5}$/,
    postalCodeFormat: "6 digits PIN code (e.g. 110001, 400001, 560001)",
    states: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
      "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
      "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
      "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
      "Uttar Pradesh", "Uttarakhand", "West Bengal",
      "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
      "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ],
  },
  {
    code: "US",
    name: "United States",
    dialCode: "+1",
    flag: "🇺🇸",
    postalCodeRequired: true,
    postalCodeRegex: /^[0-9]{5}(-[0-9]{4})?$/,
    postalCodeFormat: "5 digits (e.g. 94103, 10001, 90210)",
    states: [
      "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
      "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
      "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
      "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
      "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
      "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
      "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
      "Wisconsin", "Wyoming", "District of Columbia"
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    dialCode: "+971",
    flag: "🇦🇪",
    postalCodeRequired: false,
    postalCodeRegex: /^[0-9]{5}$/,
    postalCodeFormat: "5 digits (optional, e.g. 00000 or 12345)",
    states: [
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "Ajman",
      "Ras Al Khaimah",
      "Fujairah",
      "Umm Al Quwain",
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    dialCode: "+44",
    flag: "🇬🇧",
    postalCodeRequired: true,
    postalCodeRegex: /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i,
    postalCodeFormat: "UK Postcode (e.g. SW1A 1AA, EC1A 1BB, W1A 0AX)",
    states: [
      "England", "Scotland", "Wales", "Northern Ireland", "Greater London", "West Midlands",
      "Greater Manchester", "West Yorkshire"
    ],
  },
  {
    code: "CA",
    name: "Canada",
    dialCode: "+1",
    flag: "🇨🇦",
    postalCodeRequired: true,
    postalCodeRegex: /^[A-Z][0-9][A-Z] ?[0-9][A-Z][0-9]$/i,
    postalCodeFormat: "A1A 1A1 (e.g. M5V 3L9, V6B 2W9)",
    states: [
      "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
      "Nova Scotia", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan"
    ],
  },
  {
    code: "AU",
    name: "Australia",
    dialCode: "+61",
    flag: "🇦🇺",
    postalCodeRequired: true,
    postalCodeRegex: /^[0-9]{4}$/,
    postalCodeFormat: "4 digits (e.g. 2000, 3000, 4000)",
    states: [
      "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia",
      "Tasmania", "Australian Capital Territory", "Northern Territory"
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    dialCode: "+966",
    flag: "🇸🇦",
    postalCodeRequired: false,
    postalCodeRegex: /^[0-9]{5}$/,
    postalCodeFormat: "5 digits (e.g. 11564, 21442)",
    states: [
      "Riyadh", "Makkah", "Madinah", "Eastern Province", "Asir", "Tabuk", "Qassim"
    ],
  },
  {
    code: "DE",
    name: "Germany",
    dialCode: "+49",
    flag: "🇩🇪",
    postalCodeRequired: true,
    postalCodeRegex: /^[0-9]{5}$/,
    postalCodeFormat: "5 digits (e.g. 10115, 80331)",
    states: [
      "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony",
      "North Rhine-Westphalia", "Saxony"
    ],
  },
  {
    code: "FR",
    name: "France",
    dialCode: "+33",
    flag: "🇫🇷",
    postalCodeRequired: true,
    postalCodeRegex: /^[0-9]{5}$/,
    postalCodeFormat: "5 digits (e.g. 75001, 69001)",
    states: [
      "Île-de-France", "Auvergne-Rhône-Alpes", "Provence-Alpes-Côte d'Azur", "Nouvelle-Aquitaine",
      "Occitanie"
    ],
  },
  {
    code: "SG",
    name: "Singapore",
    dialCode: "+65",
    flag: "🇸🇬",
    postalCodeRequired: true,
    postalCodeRegex: /^[0-9]{6}$/,
    postalCodeFormat: "6 digits (e.g. 048624, 238839)",
    states: ["Singapore", "Central", "North", "South", "East", "West"],
  },
];

// Offline Postal Code Knowledge Base for instant auto-population
interface PostalLocation {
  city: string;
  state: string;
}

const POSTAL_LOOKUP_DATABASE: Record<string, Record<string, PostalLocation>> = {
  US: {
    "94103": { city: "San Francisco", state: "California" },
    "94102": { city: "San Francisco", state: "California" },
    "94107": { city: "San Francisco", state: "California" },
    "90210": { city: "Beverly Hills", state: "California" },
    "90001": { city: "Los Angeles", state: "California" },
    "95110": { city: "San Jose", state: "California" },
    "10001": { city: "New York", state: "New York" },
    "10002": { city: "New York", state: "New York" },
    "10019": { city: "New York", state: "New York" },
    "11201": { city: "Brooklyn", state: "New York" },
    "60601": { city: "Chicago", state: "Illinois" },
    "60611": { city: "Chicago", state: "Illinois" },
    "75001": { city: "Dallas", state: "Texas" },
    "77001": { city: "Houston", state: "Texas" },
    "78701": { city: "Austin", state: "Texas" },
    "98101": { city: "Seattle", state: "Washington" },
    "33101": { city: "Miami", state: "Florida" },
    "32801": { city: "Orlando", state: "Florida" },
    "30301": { city: "Atlanta", state: "Georgia" },
    "02108": { city: "Boston", state: "Massachusetts" },
  },
  IN: {
    "110001": { city: "New Delhi", state: "Delhi" },
    "110002": { city: "Central Delhi", state: "Delhi" },
    "110020": { city: "South Delhi / Okhla", state: "Delhi" },
    "110092": { city: "East Delhi", state: "Delhi" },
    "400001": { city: "Mumbai", state: "Maharashtra" },
    "400050": { city: "Bandra", state: "Maharashtra" },
    "400076": { city: "Powai", state: "Maharashtra" },
    "411001": { city: "Pune", state: "Maharashtra" },
    "560001": { city: "Bengaluru", state: "Karnataka" },
    "560034": { city: "Koramangala", state: "Karnataka" },
    "560100": { city: "Electronic City", state: "Karnataka" },
    "600001": { city: "Chennai", state: "Tamil Nadu" },
    "600096": { city: "OMR Chennai", state: "Tamil Nadu" },
    "700001": { city: "Kolkata", state: "West Bengal" },
    "700091": { city: "Salt Lake", state: "West Bengal" },
    "500001": { city: "Hyderabad", state: "Telangana" },
    "500081": { city: "Hitech City", state: "Telangana" },
    "380001": { city: "Ahmedabad", state: "Gujarat" },
    "395001": { city: "Surat", state: "Gujarat" },
    "302001": { city: "Jaipur", state: "Rajasthan" },
    "226001": { city: "Lucknow", state: "Uttar Pradesh" },
    "201301": { city: "Noida", state: "Uttar Pradesh" },
    "122001": { city: "Gurugram", state: "Haryana" },
    "160017": { city: "Chandigarh", state: "Chandigarh" },
    "800001": { city: "Patna", state: "Bihar" },
    "462001": { city: "Bhopal", state: "Madhya Pradesh" },
    "452001": { city: "Indore", state: "Madhya Pradesh" },
    "682001": { city: "Kochi", state: "Kerala" },
    "695001": { city: "Thiruvananthapuram", state: "Kerala" },
    "751001": { city: "Bhubaneswar", state: "Odisha" },
    "781001": { city: "Guwahati", state: "Assam" },
    "834001": { city: "Ranchi", state: "Jharkhand" },
    "492001": { city: "Raipur", state: "Chhattisgarh" },
    "403001": { city: "Panaji", state: "Goa" },
    "141001": { city: "Ludhiana", state: "Punjab" },
    "248001": { city: "Dehradun", state: "Uttarakhand" },
    "190001": { city: "Srinagar", state: "Jammu and Kashmir" },
  },
  GB: {
    "SW1A": { city: "London", state: "Greater London" },
    "EC1A": { city: "London", state: "Greater London" },
    "W1A": { city: "London", state: "Greater London" },
    "M1": { city: "Manchester", state: "Greater Manchester" },
    "B1": { city: "Birmingham", state: "West Midlands" },
    "EH1": { city: "Edinburgh", state: "Scotland" },
    "G1": { city: "Glasgow", state: "Scotland" },
    "CF10": { city: "Cardiff", state: "Wales" },
    "BT1": { city: "Belfast", state: "Northern Ireland" },
  },
  AE: {
    "00000": { city: "Dubai", state: "Dubai" },
    "12345": { city: "Dubai", state: "Dubai" },
    "11111": { city: "Abu Dhabi", state: "Abu Dhabi" },
    "22222": { city: "Sharjah", state: "Sharjah" },
    "33333": { city: "Ajman", state: "Ajman" },
  },
  CA: {
    "M5V": { city: "Toronto", state: "Ontario" },
    "M5H": { city: "Toronto", state: "Ontario" },
    "V6B": { city: "Vancouver", state: "British Columbia" },
    "H3B": { city: "Montreal", state: "Quebec" },
    "T2P": { city: "Calgary", state: "Alberta" },
    "K1P": { city: "Ottawa", state: "Ontario" },
  },
  AU: {
    "2000": { city: "Sydney", state: "New South Wales" },
    "3000": { city: "Melbourne", state: "Victoria" },
    "4000": { city: "Brisbane", state: "Queensland" },
    "6000": { city: "Perth", state: "Western Australia" },
    "5000": { city: "Adelaide", state: "South Australia" },
    "7000": { city: "Hobart", state: "Tasmania" },
  },
  DE: {
    "10115": { city: "Berlin", state: "Berlin" },
    "80331": { city: "Munich", state: "Bavaria" },
    "60311": { city: "Frankfurt", state: "Hesse" },
    "20095": { city: "Hamburg", state: "Hamburg" },
    "50667": { city: "Cologne", state: "North Rhine-Westphalia" },
  },
  FR: {
    "75001": { city: "Paris", state: "Île-de-France" },
    "75008": { city: "Paris", state: "Île-de-France" },
    "69001": { city: "Lyon", state: "Auvergne-Rhône-Alpes" },
    "13001": { city: "Marseille", state: "Provence-Alpes-Côte d'Azur" },
  },
  SG: {
    "048624": { city: "Singapore", state: "Central" },
    "238839": { city: "Singapore", state: "Central" },
  },
};

const INDIAN_PIN_LOCALITIES: Record<string, string[]> = {
  "400001": ["Fort", "Colaba", "Nariman Point", "Ballard Estate"],
  "400050": ["Bandra West", "Pali Hill", "Carter Road", "Bandra Reclamation"],
  "400076": ["Powai", "Hiranandani Gardens", "IIT Bombay"],
  "110001": ["Connaught Place", "Barakhamba Road", "Janpath", "Parliament Street"],
  "110020": ["Okhla Phase 1", "Okhla Phase 2", "Okhla Phase 3", "Tehkhand"],
  "560001": ["MG Road", "Brigade Road", "Cubbon Park", "Shivajinagar"],
  "560034": ["Koramangala 1st Block", "Koramangala 4th Block", "Koramangala 5th Block"],
  "600001": ["George Town", "Parry's Corner", "Sowcarpet"],
  "700001": ["BBD Bagh", "Dalhousie", "Strand Road"],
  "500001": ["Abids", "Koti", "Sultan Bazar"],
  "500081": ["Madhapur", "Hitech City", "Cyber Towers"],
  "201301": ["Sector 15 Noida", "Sector 16 Noida", "Sector 18 Atta"],
  "122001": ["Gurugram Old City", "Railway Station Road", "Sadar Bazar Gurugram"],
};

/**
 * Searches and attempts to auto-populate City and State/Province from country and postal code.
 */
export function lookupPostalCode(
  countryCode: string,
  rawPostalCode: string
): { success: boolean; city?: string; state?: string; localities?: string[]; message?: string } {
  if (!countryCode || !rawPostalCode) {
    return { success: false };
  }

  const cleanCode = rawPostalCode.trim().toUpperCase().replace(/\s+/g, "");
  const countryDb = POSTAL_LOOKUP_DATABASE[countryCode.toUpperCase()];

  if (!countryDb) {
    return {
      success: false,
      message: "Automatic postal code lookup is not enabled for this country. Please fill city and state manually.",
    };
  }

  // Exact match
  if (countryDb[cleanCode]) {
    const locs = countryCode.toUpperCase() === "IN" ? INDIAN_PIN_LOCALITIES[cleanCode] : undefined;
    return {
      success: true,
      city: countryDb[cleanCode].city,
      state: countryDb[cleanCode].state,
      localities: locs,
      message: `Autofilled: ${countryDb[cleanCode].city}, ${countryDb[cleanCode].state}`,
    };
  }

  // Partial outcode match for UK / Canada (e.g. SW1A from SW1A 1AA, or M5V from M5V 3L9)
  for (const prefix of Object.keys(countryDb)) {
    if (cleanCode.startsWith(prefix)) {
      return {
        success: true,
        city: countryDb[prefix].city,
        state: countryDb[prefix].state,
        message: `Autofilled: ${countryDb[prefix].city}, ${countryDb[prefix].state}`,
      };
    }
  }

  // US 5-digit prefix from 9-digit zip
  if (countryCode.toUpperCase() === "US" && cleanCode.length >= 5) {
    const zip5 = cleanCode.substring(0, 5);
    if (countryDb[zip5]) {
      return {
        success: true,
        city: countryDb[zip5].city,
        state: countryDb[zip5].state,
        message: `Autofilled: ${countryDb[zip5].city}, ${countryDb[zip5].state}`,
      };
    }
  }

  return {
    success: false,
    message: "Postal code recognized. Please verify or manually select your city and state.",
  };
}

/**
 * Validates a postal code format for a selected country.
 */
export function validatePostalCode(
  countryCode: string,
  postalCode: string
): { valid: boolean; error?: string } {
  const country = COUNTRIES.find((c) => c.code.toUpperCase() === countryCode.toUpperCase());
  if (!country) return { valid: true };

  const trimmed = postalCode.trim();
  if (!trimmed) {
    if (country.postalCodeRequired) {
      return { valid: false, error: `Postal code is required for ${country.name}` };
    }
    return { valid: true };
  }

  if (country.postalCodeRegex && !country.postalCodeRegex.test(trimmed)) {
    return {
      valid: false,
      error: `Invalid format. Expected: ${country.postalCodeFormat || "valid postal code"}`,
    };
  }

  return { valid: true };
}
