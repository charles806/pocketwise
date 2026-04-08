import WaitlistSection from "../components/Sections/CTA";
import FAQSection from "../components/Sections/FAQ";
import FeaturesSection from "../components/Sections/Features";
import Hero from "../components/Sections/Hero";
import HowItWorksSection from "../components/Sections/How-it-works";
import WhySection from "../components/Sections/WhyPocketWise";
import ScrollRevealInit from "../components/Sections/ScrollRevealInit";

const App = () => {
  return (
    <>
      <main>
        <Hero />
        <HowItWorksSection />
        <WhySection />
        <FeaturesSection />
        <FAQSection />
        <WaitlistSection />
        <ScrollRevealInit />
      </main>
    </>
  );
};

export default App;
