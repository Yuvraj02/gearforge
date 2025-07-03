import React from "react";
import LiveTournaments from "./sections/LiveTournaments";
import UpcomingTournaments from "./sections/UpcomingTournaments";

const Tournaments: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex flex-col w-full min-h-screen">
        <LiveTournaments />
        <UpcomingTournaments />
      </div>
    </div>
  );
};

export default Tournaments;


