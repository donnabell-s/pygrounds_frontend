import * as Components from "../../components";
import { FaArrowRight } from "react-icons/fa";
import { FaCode, FaChartLine } from "react-icons/fa6";
import { RiBrain2Line } from "react-icons/ri";
import HeroImage from "../../../assets/images/landing-hero3.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { PATHS } from "../../../constants";
// removed unused social icons

const Landing = () => {
  const features = [
    {
      title: "Interactive Coding",
      description: "Write real Python code to solve challenges and debug problems.",
      icon: <FaCode size={38} className="inline-block text-[#c26cc4]" />,
    },
    {
      title: "Progress Tracking",
      description: "Visual skill tracking with XP, levels, and personalized learning paths.",
      icon: <FaChartLine size={38} className="inline-block p-1 text-[#dc93ca]" />,
    },
    {
      title: "Adaptive Learning",
      description: "AI-powered content that adapts to your strengths and weaknesses.",
      icon: <RiBrain2Line size={38} className="inline-block text-[#bc64c4]" />, // keep feature colors
    },
  ];

  // keep feature card colors as-is
  const cardBgClasses = ["bg-[#c26cc4]/50", "bg-[#dc93ca]/50", "bg-[#bc64c4]/50"];
  const ringClasses = ["ring-[#c26cc4]/60", "ring-[#dc93ca]/60", "ring-[#bc64c4]/60"];
  const dotClasses = ["bg-[#c26cc4]", "bg-[#dc93ca]", "bg-[#bc64c4]"];
  const hoverGlows = [
    // tighter glow: smaller vertical offset, smaller blur/spread, slightly lower opacity
    "hover:shadow-[0_8px_20px_rgba(194,108,196,0.28)]",
    "hover:shadow-[0_8px_20px_rgba(220,147,202,0.28)]",
    "hover:shadow-[0_8px_20px_rgba(188,100,196,0.28)]",
  ];

  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePrimaryClick = () => {
    const token = localStorage.getItem("accessToken");
    if (token || user) {
      // go to user's home
      const storedUser = user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null);
      const userId = storedUser?.id;
      if (userId) navigate(`/${userId}/home`);
      else navigate(PATHS.LOGIN.path);
    } else {
      // go to first registration step
      navigate(`${PATHS.REGISTER.path}/${PATHS.REGISTER.USER_INFO.path}`);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#7053D0]/10 to-[#EAE7FE]/40">
      <Components.Header />

      {/* Hero (refined to match feature styling; no extra elements) */}
      <section className="relative overflow-hidden py-16 lg:py-18">
        {/* soft brand glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-[#7053D0]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[#EAE7FE] blur-3xl" />

        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:pl-25 xl:pr-15 mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Master Python Through{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#7053D0] to-[#482986]">
                Interactive Gaming
              </span>
            </h1>
            <p className="text-lg text-gray-700/90 leading-relaxed mb-8">
              Level up your Python skills with adaptive minigames, real-time progress tracking, and personalized learning paths that adapt to you.
            </p>
            <div className="inline-flex">
              <Components.PrimaryButton
                label="Start Learning"
                icon={<FaArrowRight size={16} />}
                iconPosition="right"
                // palette: primary + support
                onClick={handlePrimaryClick}
              />
            </div>
          </div>

          {/* Right visual → use HeroImage */}
          <div className="relative max-w-xl mx-auto lg:mx-0">
            {/* framed image with consistent rings/shadow */}
            <div>
              {/* subtle top gradient to blend with page glow */}
              <img
                src={HeroImage}
                alt="Level up Python through interactive gaming"
                className="w-full h-auto object-cover"
              />
            </div>

            {/* decorative pulse dot to echo feature cards */}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white/50 backdrop-blur-sm py-20">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <div className="flex flex-col justify-center items-center mb-12 gap-2">
            <h2 className="text-4xl font-bold text-center">Made for the Way You Learn</h2>
            <p className="text-gray-600">Clear, motivating, and designed for real results.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            {features.map((f, idx) => (
              <div
                key={idx}
                className={`group relative overflow-hidden ${cardBgClasses[idx]} rounded-3xl p-8 border border-white/40 ring-1 ${ringClasses[idx]} shadow-md ${hoverGlows[idx]} transition-all duration-300 hover:-translate-y-1`}
              >
                {/* overlay should be UNDER the content */}
                <div className="pointer-events-none absolute inset-0 z-0 rounded-3xl bg-gradient-to-br from-white/30 to-transparent" />

                <div className="relative z-10 mb-6">
                  <div className={`grid place-items-center w-16 h-16 rounded-full bg-white/90 ring-2 ${ringClasses[idx]} shadow-sm`}>
                    {f.icon}
                  </div>
                  <span className={`absolute -right-1 -top-1 w-3 h-3 rounded-full ${dotClasses[idx]} animate-pulse`} />
                </div>

                <div className="relative z-10">
                  <h3 className="text-xl font-semibold text-left mb-2 text-gray-900">{f.title}</h3>
                  <p className="text-gray-700 text-left leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Overlapping CTA (keeps original light styling + heading color) */}
      <section className="bg-white/50 backdrop-blur-sm  relative">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <div className="-mb-20 relative z-10 rounded-3xl bg-white backdrop-blur ring-1 ring-black/5 p-12 md:p-16 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Try it now</p>
              {/* ⬇️ heading color not overridden */}
              <h3 className="text-3xl font-semibold mb-2">Ready to level up your learning process?</h3>
              <p className="text-gray-600">
                Supports skill growth with adaptive minigames, progress analytics, and personalized paths.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Components.PrimaryButton
                label="Get Started Now"
                px="px-8"
                py="py-3"
                fontSize="text-md"
                icon={<FaArrowRight size={14} />}
                iconPosition="right"
                onClick={handlePrimaryClick}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Dark footer */}
      <footer className="bg-white text-slate-300 pt-34 pb-10">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <div className="grid gap-10 md:grid-cols-5 items-start">
            {/* (columns intentionally commented out in your original code) */}
          </div>

          <div className="mt-5 pt-6 border-t border-white/10 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
            <p>© PyGrounds {new Date().getFullYear()}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
