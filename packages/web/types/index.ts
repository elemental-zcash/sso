
export interface Viewer {
  isAuthenticated: boolean;
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
}
