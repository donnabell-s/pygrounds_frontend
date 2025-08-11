import * as Components from "../../components";
import { FaArrowRight } from "react-icons/fa";
import { FaCode, FaChartLine  } from "react-icons/fa6";
import { RiBrain2Line } from "react-icons/ri";
import HeroImage from "../../../assets/images/landing-hero.png";

const Landing = () => {
  const features = [
    {
      title: "Interactive Coding",
      description: "Write real Python code to solve challenges and debug problems.",
      icon: <FaCode size={38} className="inline-block text-[#704EE7]" />,
    },
    {
      title: "Progress Tracking",
      description: "Visual skill tracking with XP, levels, and personalized learning paths.",
      icon: <FaChartLine size={38} className="inline-block p-1 text-[#704EE7]" />,
    },
    {
      title: "Adaptive Learning",
      description: "AI-powered content that adapts to your strengths and weaknesses.",
      icon: <RiBrain2Line size={38} className="inline-block text-[#704EE7]" />,
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
            <Components.PrimaryButton label="Start Learning" icon={<FaArrowRight size={16} />} iconPosition="right" />
          </div>

          {/* Right Image */}
          <div className="relative mt-12 lg:mt-0 flex justify-center">
            <img src={HeroImage} alt="Learning Python" className="max-w-md w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white shadow-md py-16">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <div className="flex flex-col justify-center items-center mb-12 gap-2">
            <h2 className="text-4xl font-bold text-center">Made for the Way You Learn</h2>
            <p>Clear, motivating, and designed for real results.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-7">
            {features.map((f, idx) => (
              <div key={idx} className="bg-[#704EE7]/5 shadow-md rounded-xl p-8 flex flex-col items-start text-center hover:shadow-lg transition gap-6">
                <div className="text-4xl mb-4">{f.icon}</div>
                <div className="flex-row">
                  <h3 className="text-xl font-semibold text-left mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-left text-sm">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="py-16">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto text-center">
          <h3 className="text-3xl font-semibold mb-6">Turn Practice Into Progress</h3>
          <div className="flex flex-row justify-center">
            <Components.PrimaryButton label="Get Started" px="px-8" py="py-3" fontSize="text-md" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
