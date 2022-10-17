import { UserType } from "../models";

export interface Viewer extends UserType {
  userId?: string;
  isPublic?: boolean,
  isAuthenticating?: boolean,
};
