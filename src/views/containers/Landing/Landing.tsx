import * as Components from "../../components";

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
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-[#E4ECF7] to-[#FFFBEC] text-gray-900">
      <Components.Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto flex flex-col lg:flex-row items-center justify-center lg:justify-between lg:space-x-16">
          {/* Left Text */}
          <div className="max-w-xl text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold font-asap leading-tight mb-6">
              Master Python Through <span className="text-[#3776AB]">Interactive Gaming</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8">
              Level up your Python skills with adaptive minigames, real-time progress tracking, and personalized learning paths that adapt to you.
            </p>
            <button className="bg-[#3776AB] text-white px-6 py-3 rounded-lg text-lg font-semibold hover:brightness-110 transition">
              Start Learning
            </button>
          </div>

          {/* Right Asymmetric Cards */}
          <div className="relative mt-12 lg:mt-0 transform lg:-translate-x-12">
            {/* Backdrop Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#3776AB]/10 to-[#FFB703]/10 blur-3xl rounded-full"></div>

            <div className="relative w-full flex justify-center items-center h-[320px] lg:h-[360px]">
              {/* Top Right Card */}
              <div className="absolute transform -rotate-3 lg:-rotate-6 -top-6 lg:-top-15 right-30 lg:right-25 w-48 h-60 bg-white rounded-2xl shadow-xl p-3 overflow-hidden lg:z-10">
                <img
                  src="https://source.unsplash.com/200x300/?python,code"
                  alt="XP Boost"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Center Card */}
              <div className="relative transform rotate-2 lg:rotate-2 w-56 h-80 bg-white rounded-2xl shadow-2xl p-4 z-20 overflow-hidden">
                <img
                  src="https://source.unsplash.com/300x400/?learning,technology"
                  alt="Current Level"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>

              {/* Bottom Left Card */}
              <div className="absolute transform rotate-3 lg:rotate-4 bottom-7 lg:-bottom-13 left-30 lg:left-30 w-48 h-64 bg-white rounded-2xl shadow-xl p-3 overflow-hidden lg:z-5">
                <img
                  src="https://source.unsplash.com/220x350/?gaming,education"
                  alt="Challenges Completed"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white shadow-md py-16">
        <div className="w-full max-w-screen-xl px-4 sm:px-6 md:px-10 lg:px-16 xl:px-25 mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 font-asap">Why Choose PyGrounds?</h2>
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
          <h3 className="text-2xl font-bold mb-6 font-asap">Start Your Coding Journey Today!</h3>
          <button className="bg-[#3776AB] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:brightness-110 transition">
            Get Started
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
