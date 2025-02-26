import MarketSection from './MarketSection';
import GamesSection from './GamesSection';

const MarketAndGamesContainer = () => {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <MarketSection />
      <GamesSection />
    </div>
  );
};

export default MarketAndGamesContainer;
