import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AnalyticsHub from "@/components/AnalyticsHub";
import NeuroTrader from "@/components/NeuroTrader";
import MultiChainSection from "@/components/MultiChainSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <AnalyticsHub />
      <NeuroTrader />
      <MultiChainSection />
      <Footer />
    </main>
  );
};

export default Index;
