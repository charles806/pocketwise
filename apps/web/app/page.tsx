import WaitlistSection from "../components/Sections/CTA";
import FAQSection from "../components/Sections/FAQ";
import FeaturesSection from "../components/Sections/Features";
import Hero from "../components/Sections/Hero";
import HowItWorksSection from "../components/Sections/How-it-works";
import WhySection from "../components/Sections/WhyPocketWise";
import ScrollRevealInit from "../components/Sections/ScrollRevealInit";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";

const App = () => {
  return (
    <>
      <Header />
      <main id="main-content" className="pt-18 mt-8 md:mt-0">
        <Hero />
        <HowItWorksSection />
        <WhySection />
        <FeaturesSection />
        <FAQSection />
        <WaitlistSection />
        <ScrollRevealInit />
      </main>
      <Footer />
    </>
  );
};

export default App;

