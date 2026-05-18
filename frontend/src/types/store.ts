import type { User } from "./user";
export interface AuthState {
  accessToken: String | null;
  user: User | null;
  loading: boolean;
  clearState:()=>void;
  setAccessToken:(accessToken:String)=>void;
  signUp: (
    username: String,
    password: String,
    email: String,
    firstname: String,
    lastname: String,
  ) => Promise<void>;
  signIn:(
    username:String,
    password: String
  )=>Promise<void>;
  signOut:()=>Promise<void>;
  fetchMe:()=>Promise<void>;
  refresh:()=>Promise<void>;
}
