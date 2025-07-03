'use client'

import React from "react";
import DraggableScroll from "@/app/components/common/DraggableScroll";
import TournamentCard from "../../components/common/TournamentCard";

const tournaments = [
  {
    id: 1,
    name: "Valorant Champions Tour",
    cover: { url: "/assets/valorant-banner.jpg" },
    status: "Live Now",
  },
  {
    id: 2,
    name: "CS:GO Blast Premier",
    cover: { url: "/assets/csgo-banner.jpg" },
    status: "Live Now",
  },
  {
    id: 3,
    name: "League of Legends Worlds",
    cover: { url: "/assets/lol-banner.jpg" },
    status: "Live Now",
  },
  {
    id: 4,
    name: "Dota 2 The International",
    cover: { url: "/assets/dota2-banner.jpg" },
    status: "Live Now",
  },
];


const LiveTournaments: React.FC = () => {
  return (
    <div className="flex flex-col m-12">
      <p className="text-white text-3xl mb-4">Live Tournaments</p>

      <DraggableScroll>
        <div className="flex gap-4">
          {tournaments.map((tournament) => (
            <TournamentCard key={tournament.id} game={tournament} />
          ))}
        </div>
      </DraggableScroll>

      <div className="flex flex-row-reverse mt-2">
        <p className="p-2 cursor-pointer hover:text-white text-gray-400">
          View All Live Tournaments
        </p>
      </div>
    </div>
  );
};

export default LiveTournaments;
