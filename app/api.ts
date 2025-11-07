import axios from "axios";
import { User } from "./models/user_model";
import { Tournament } from "./models/tournament_model";
import { FinishPayload } from "./tournaments/[tournamentId]/ParticipantBoard";
/*
    Interfaces : LoginData & RegistrationData
        -> Both of them will be referenced in files /auth/page.tsx & /auth/register/page.tsx
        -> Hence they are exported
*/

export interface LoginData {
  email: string;
  password: string;
}

export interface RegistrationData {
  user_id: string;
  name: string;
  email: string;
  password: string;
  user_name: string;
}

export interface LoginResponseData {
  status: string;
  data: User;
}

export interface UserTournament {
  userId: string;
  type: string;
}

// export const API_BASE_URL: string = "http://localhost:8080";
// export const API_BASE_URL: string = "http://107.20.59.138:8080";
export const API_BASE_URL = "https://2984e4256bab.ngrok-free.app";

// if (process.env.NEXT_NODE_ENV == "prod") {
//   API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_PROD!;
// } else if (process.env.NEXT_NODE_ENV == "dev") {
//   API_BASE_URL = process.env.NEXT_PUBLIC_BASE_API_DEV!;
// }

export async function login(data: LoginData): Promise<LoginResponseData> {
  const response = await axios.post(`${API_BASE_URL}/login`, data, {
    //Set this otherwise cookies won't be retrieved or send
    withCredentials: true,
  });
  return response.data;
}

export async function register(data: RegistrationData) {
  const response = await axios.post(`${API_BASE_URL}/register`, data);
  return response.data;
}

export async function autoLogin() {
  const response = await axios.get(`${API_BASE_URL}/me`, {
    withCredentials: true,
  });
  return response.data;
}

export async function refreshToken() {
  console.log("Refresh Token triggered");
  const response = await axios.post(`${API_BASE_URL}/refresh`, null, {
    withCredentials: true,
  });
  return response.data;
}

export async function logout() {
  const response = await axios.post(`${API_BASE_URL}/logout`, null, {
    withCredentials: true,
  });
  return response.data;
}

export async function getUserData(user_id: string) {
  console.log("User id : ", user_id);
  const response = await axios.post(
    `${API_BASE_URL}/user`,
    { user_id: user_id },
    {
      withCredentials: true,
    }
  );

  return response.data;
}

export async function verifyResetLink(token: string) {
  console.log("Reset Token is : ", token);
  const response = await axios.post(
    `${API_BASE_URL}/reset_pwd/verify`,
    { token: token },
    {
      withCredentials: true,
    }
  );
  return response.data;
}

export async function resetPassword(user_id: string, password: string) {
  const response = await axios.patch(
    `${API_BASE_URL}/update_pwd`,
    { user_id: user_id, password: password },
    {
      withCredentials: true,
    }
  );

  return response.data;
}

export async function requestPasswordReset(email: string) {
  const response = await axios.post(
    `${API_BASE_URL}/reset_pwd_req`,
    { email: email },
    {
      withCredentials: true,
    }
  );
  return response.data;
}

export async function updateUser(
  userId: string,
  username?: string | null,
  name?: string | null
) {
  // Build the payload shape:

  // {
  //   "data": { "user_id": "...", "user_name": "...", "name": "..." }
  // }

  const data: { user_id: string; user_name?: string; name?: string } = {
    user_id: userId,
  };

  const hasUsername =
    typeof username === "string" && username.trim().length > 0;
  const hasName = typeof name === "string" && name.trim().length > 0;

  if (hasUsername) data.user_name = username!.trim();
  if (hasName) data.name = name!.trim();

  // Require at least one updatable field
  if (!hasUsername && !hasName) {
    throw new Error("Nothing to update. Provide username and/or name.");
  }

  const res = await axios.patch(
    `${API_BASE_URL}/update_user`,
    { data }, // <-- matches your required payload format
    { withCredentials: true }
  );

  return res.data;
}

export async function updateUserPassword(
  user_id: string,
  current_pwd: string,
  new_pwd: string
) {
  const res = await axios.patch(
    `${API_BASE_URL}/update_user_pwd`,
    {
      user_id: user_id,
      current_pwd: current_pwd,
      new_pwd: new_pwd,
    },
    { withCredentials: true }
  );

  return res.data;
}

// api.ts
export async function getUserTournaments(ids: string[]) {
  const res = await axios.post(
    `${API_BASE_URL}/get_user_tournaments`,
    { tournament_ids: ids },
    { withCredentials: true }
  );

  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.tournaments)) return data.tournaments;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export async function createTournament(payload: Tournament) {
  const res = await axios.post(`${API_BASE_URL}/create_tournament`, payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function getTournaments() {
  const res = await axios.get(`${API_BASE_URL}/tournaments`);
  return res.data;
}

export async function getUserByEmail(email: string) {
  const res = await axios.post(`${API_BASE_URL}/user_by_email`, {email:email}, {withCredentials:true});
  return res.data;
}

export async function finishTournament(payload:FinishPayload){
  const res = await axios.post(`${API_BASE_URL}/finish_tournament`, payload, {withCredentials:true})
  return res.data
}

export async function getParticipants(tournament_id:string){
  const res = await axios.post(`${API_BASE_URL}/participants`, {tournament_id:tournament_id}, {withCredentials:true})
  return res.data.data
}

export async function getLeaderboard(tournament_id:string, game_category:string){
  const res = await axios.post(`${API_BASE_URL}/leaderboard`, {tournament_id:tournament_id, game_category:game_category}, {withCredentials:true})
  return res.data
}

export async function getTournamentById(tournament_id:string) : Promise<Tournament>{

  const res = await axios.post(`${API_BASE_URL}/get_tournament`, {tournament_id:tournament_id}, {withCredentials:true})
  return res.data
}

export async function updateTournamentStatus(registration_status?:'open'|'close', coming_soon?:boolean, tournament_id?:string){
  const res = await axios.patch(`${API_BASE_URL}/update_tournament_status`, {tournament_id:tournament_id,registration_status:registration_status, coming_soon:coming_soon}, {withCredentials:true})
  return res
}