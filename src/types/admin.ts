
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