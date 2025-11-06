export interface Team{

    teamId: string
    players: string[] //ids of the players in this team
    team_name: string
    position_in_tournament: string
    tournament_id: string //Tournament for which team was affiliated
}