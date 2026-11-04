export type CrmSuiteMode = 'GYMDASH' | 'CLUBDASH' | 'COACHDASH' | 'ORGANIZERDASH';

export type CrmAudience = 'ALL' | 'SEGMENT_1' | 'SEGMENT_2' | 'SEGMENT_3';

export interface CrmBroadcast {
  id: string;
  suiteMode: CrmSuiteMode;
  senderName: string;
  senderAvatar: string;
  senderRole?: string;
  audience: CrmAudience;
  targetAthleteId?: string; // e.g. "usr_athlete_01" (Darelle Navarette) or undefined for ALL
  targetAthleteName?: string;
  title: string;
  body: string;
  promoCode?: string;
  createdAt: string;
  badgeText?: string;
}

export interface CrmChatMessage {
  id: string;
  threadId: string;
  senderId: 'business' | string; // 'business' or athlete ID (e.g. 'usr_athlete_01')
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
  time: string;
  isCrmBroadcast?: boolean;
  broadcastData?: {
    title: string;
    body: string;
    promoCode?: string;
    suiteMode: CrmSuiteMode;
  };
}
