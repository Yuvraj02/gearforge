'use client'

import React from "react";
import DraggableScroll from "@/app/components/common/DraggableScroll";
import TournamentCard from "../../components/common/TournamentCard";

const upcomingTournaments = [
  {
    id: 1,
    name: "Apex Legends Arena Cup",
    cover: { url: "/assets/apex-banner.jpg" },
    registrationDeadline: "June 30, 2025",
  },
  {
    id: 2,
    name: "Overwatch Global Clash",
    cover: { url: "/assets/overwatch-banner.jpg" },
    registrationDeadline: "July 5, 2025",
  },
  {
    id: 3,
    name: "Fortnite Build Brawl",
    cover: { url: "/assets/fortnite-banner.jpg" },
    registrationDeadline: "July 10, 2025",
  },
];

const UpcomingTournaments: React.FC = () => {
  return (
    <div className="flex flex-col m-12">
      <p className="text-white text-3xl mb-4">Upcoming Tournaments</p>

      <DraggableScroll>
        <div className="flex gap-4">
          {upcomingTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} game={tournament} type="upcoming" />
          ))}
        </div>
      </DraggableScroll>

      <div className="flex flex-row-reverse mt-2">
        <p className="p-2 cursor-pointer hover:text-white text-gray-400">
          View All Upcoming Tournaments
        </p>
      </div>
    </div>
  );
};

export default UpcomingTournaments;
