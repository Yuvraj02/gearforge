import AboutGearForge from "./sections/AboutGearForge";
import Carousel from "./sections/Carousel";
import EsportsDescription from "./sections/EsportsDescription";
import GamesMarquee from "./sections/GamesMarquee";
import TournamentFormat from "./sections/TournamentFormat";
import Tournaments from "./sections/Tournaments";

function HomePage() {
 
  return (
    <main className="flex min-h-screen w-full">
      <div className="flex flex-col w-full min-h-screen">
        <Carousel />
        <Tournaments/>
        <GamesMarquee/>
        <AboutGearForge/>
        <EsportsDescription/>
        <TournamentFormat/>   
      </div>
    </main>
  )
}

export default HomePage;
