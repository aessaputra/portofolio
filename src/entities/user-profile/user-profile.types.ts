export interface UserProfile {
  id: number;
  email: string;
  name: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserProfileData {
  email: string;
  name?: string;
  profileImageUrl?: string;
}

export interface UpdateUserProfileData {
  name?: string;
  profileImageUrl?: string;
}
