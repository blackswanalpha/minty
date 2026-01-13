import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { InstallSection } from "@/components/InstallSection";
import { CommandsSection } from "@/components/CommandsSection";
import { Footer } from "@/components/Footer";
import { ToolsSidebar } from "@/components/ToolsSidebar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ToolsSidebar />
      <div className="pl-14">
        <HeroSection />
        <FeaturesSection />
        <InstallSection />
        <CommandsSection />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
