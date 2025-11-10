export interface User {
  user_id: string;
  name: string;
  user_name: string;
  email:string;
  current_team?: string
  past_teams? : string[]
  participated_tournaments?: string[];
  won_tournaments?: string[]; //Will have tournament id which are won by user
  division: number; //There will be 3 divisions, By defeault user will start with division 3
  division_score?:number //Division Points
  discord_id?: string;
  role:"player" | "admin"
}
