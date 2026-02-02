import Hero from "@/components/Hero";
import CoursesGrid from "@/components/CoursesGrid";
import AboutSection from "@/components/AboutSection";
import WorkShowcase from "@/components/WorkShowcase";
import ProcessSection from "@/components/ProcessSection";
import MentorShowcase from "@/components/MentorShowcase";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Hero />
      <AboutSection />
      <ProcessSection />
      <CoursesGrid />
      <WorkShowcase />
      <MentorShowcase />
      <Footer />
    </>
  );
}
