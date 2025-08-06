import * as Components from "../../components";
import { FaArrowRight } from "react-icons/fa";
import HeroImage from "../../../assets/images/landing-hero.png";


const Landing = () => {
  const features = [
    {
      title: "Interactive Coding",
      description: "Write real Python code to solve challenges and debug problems.",
      icon: "",
    },
    {
      title: "Progress Tracking",
      description: "Visual skill tracking with XP, levels, and personalized learning paths.",
      icon: "",
    },
    {
      title: "Adaptive Learning",
      description: "AI-powered content that adapts to your strengths and weaknesses.",
      icon: "",
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#704EE7]/10 to-[#4497FF]/10">
      <Components.Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:pl-25 xl:pr-15 mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between lg:space-x-16">
          {/* Left Text */}
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Master Python Through <span className="text-[#704EE7]">Interactive Gaming</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Level up your Python skills with adaptive minigames, real-time progress tracking, and personalized learning paths that adapt to you.
            </p>
            <Components.PrimaryButton
              label="Start Learning"
              icon={<FaArrowRight size={16} />}
              iconPosition="right"
            />
          </div>

          {/* Right Image */}
          <div className="relative mt-12 lg:mt-0 flex justify-center">
          <img
            src={HeroImage}
            alt="Learning Python"
            className="max-w-md w-full object-cover"
          />

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white shadow-md py-16">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose PyGrounds?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="bg-white shadow-md rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-12">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto text-center">
          <h3 className="text-2xl font-bold mb-6">Start Your Coding Journey Today!</h3>
          <div className="flex flex-row justify-center">
            <Components.PrimaryButton label="Get Started" px="px-8" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
