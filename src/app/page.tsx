import Hero from "../components/homepage/hero/Hero";
import About from "../components/homepage/about/About";
import Projects from "../components/homepage/projects/Projects";
import Contact from "../components/homepage/contacts/Contact";
import TechLogos from "../components/homepage/tech-logos/TechLogos";
import TimeLine from "../components/homepage/TimeLine/TimelineSection";

export default function Home() {
  return (
    <div className="">
      <Hero />
      <About />
      <TimeLine />
      <Projects />
      <TechLogos />
      <Contact />
    </div>
  );
}
