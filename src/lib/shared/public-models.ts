export interface ProfileCard {
  id: string;
  slug: string;
  name: string;
  photoPath: string | null;
  batchYear: number;
  currentActivity: string | null;
  currentPlaceName: string | null;
  currentPlaceSlug: string | null;
  fieldLabels: string[];
  updatedAt: string;
}

export interface JourneyChapter {
  id: string;
  activity: string;
  placeName: string | null;
  startYear: number | null;
  endYear: number | null;
  story: string | null;
}

export interface ProudMoment {
  id: string;
  title: string;
  description: string | null;
  placeName: string | null;
  year: number | null;
  imagePath: string | null;
  externalUrl: string | null;
}

export interface ProfileDetail {
  id: string;
  slug: string;
  name: string;
  photoPath: string | null;
  batchYear: number;
  bio: string | null;
  location: string | null;
  currentActivity: string | null;
  currentPlaceName: string | null;
  currentPlaceSlug: string | null;
  sinceSoonStory: string | null;
  turningPointStory: string | null;
  currentDirectionStory: string | null;
  linkedinUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  journeys: JourneyChapter[];
  fieldLabels: string[];
  proudMoments: ProudMoment[];
  relatedProfiles: ProfileCard[];
  updatedAt: string;
}

export interface HomeStory {
  featured: ProfileDetail;
  contactSheet: ProfileCard[];
  totalPublishedProfiles: number;
}

export interface ExploreResult {
  profiles: ProfileCard[];
  total: number;
}
