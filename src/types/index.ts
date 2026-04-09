// src/types/index.ts

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImageUrl?: string;
}

export interface Community {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  categoryName?: string; // Topluluğun kategorisi (Spor, Sanat, Bilim vb.)
  memberCount?: number;
}

export interface Event {
  id: number;
  communityId: number;
  community: Community;
  title: string;
  description: string;
  startDate: string; // ISO formatında gelecek (Örn: 2026-03-15T14:30:00)
  endDate?: string;
  location?: string;
  posterUrl?: string;
  category?: string;
  latitude?: number;
  longitude?: number;
}
export interface CommunityMemberDto {
  userId: number;
  fullName: string;
  profileImageUrl?: string;
  roleName: string;
}

export interface CommunityAnnouncementDto {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export interface CommunityDetail {
  id: number;
  name: string;
  description: string;
  logoUrl?: string;
  coverImageUrl?: string;
  memberCount: number;
  boardMembers: CommunityMemberDto[];
  upcomingEvents: Event[]; // Yukarıda Event tipini tanımlamıştık
  recentAnnouncements: CommunityAnnouncementDto[];
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}