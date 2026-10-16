import Hero from "../components/homepage/hero/Hero";
import About from "../components/homepage/about/About";
import Projects from "../components/homepage/projects/Projects";
import Contact from "../components/homepage/contacts/Contact";
import TechLogos from "../components/homepage/tech-logos/TechLogos";
import TimeLine from "../components/homepage/TimeLine/TimelineSection";
import SocMonitor from "../components/homepage/soc-monitor/SocMonitor";
import { getProjects } from "@/src/lib/db";

export default async function Home() {
  const projects = await getProjects().catch(() => undefined);
  return (
    <div className="">
      <Hero />
      <About />
      <TimeLine />
      <Projects initialProjects={projects} />
      <TechLogos />
      <SocMonitor />
      <Contact />
    </div>
  );
}
