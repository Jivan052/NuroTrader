import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import NeuroTrader from "@/components/NeuroTrader";
import MultiChainSection from "@/components/MultiChainSection";
import WaitingListCounter from "@/components/WaitingListCounter";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <NeuroTrader />
      <MultiChainSection />
      <Footer />
    </main>
  );
};

export default Index;
