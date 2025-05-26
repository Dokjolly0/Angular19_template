export interface User {
  // Unique ID
  id?: string;

  // Base Info
  firstName: string;
  lastName: string;
  picture?: string;
  birthDate?: Date | string | undefined;
  gender?: string | undefined;

  // Preference
  preferredLanguage?: string | undefined;
  timeZone?: string | undefined;

  // Authentication Info
  status?: string | undefined;
  role: string;

  // Security Info
  createdAt?: Date | string;
  lastUpdateAt?: Date | string | undefined;
  lastLogin?: Date | string | undefined;
  lastAllowedIp?: string | undefined;
  allowedIps?: string[] | undefined;

  // Address Info
  addressInfo?: {
    address: string | undefined;
    city: string | undefined;
    state: string | undefined;
    country: string | undefined;
    zipCode: string | undefined;
    location: {
      latitude: number | undefined;
      longitude: number | undefined;
    };
  };
}
