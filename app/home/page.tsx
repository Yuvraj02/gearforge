import Carousel from "./Carousel";
import Popular from "./sections/Popular";

function HomePage() {
 

  return (
    <main className="flex min-h-screen w-full">
      <div className="flex flex-col w-full min-h-screen">
        <Carousel />
        <Popular />
      </div>
    </main>
  )
}

export default HomePage;
