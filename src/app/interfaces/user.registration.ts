export interface UserRegistration {
  // Unique ID
  id?: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  picture?: string;
  birthDate?: Date | string | undefined;
  gender?: string | undefined;
}
