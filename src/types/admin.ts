
export interface AdminUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  token: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  last_login?: string | null;
  date_joined: string;
}

export interface AdminUserListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminUser[];
}

export interface AdminNotification {
  id: number;
  recipient: number | null;
  recipient_username: string | null;
  title: string;
  message: string;
  notification_type: 'general' | 'achievement' | 'system';
  is_read: boolean;
  is_broadcast: boolean;
  created_at: string;
}

export interface AdminNotificationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminNotification[];
}

export interface SendNotificationPayload {
  title: string;
  message: string;
  notification_type: 'general' | 'achievement' | 'system';
  is_broadcast: boolean;
  recipient?: number;
}