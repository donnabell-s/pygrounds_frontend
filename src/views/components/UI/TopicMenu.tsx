import { useEffect, useState } from "react";
import type { Topic, Subtopic } from "../../../api/readingApi";
import { readingApi } from "../../../api/readingApi";
import { FiChevronRight } from "react-icons/fi";



interface Props {
  onSelectSubtopic: (id: number) => void;
  activeSubtopic: number | null;
}

const TopicMenu = ({ onSelectSubtopic, activeSubtopic }: Props) => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  const [openTopic, setOpenTopic] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Check cache first
        const cachedTopics = sessionStorage.getItem("topics");
        const cachedSubtopics = sessionStorage.getItem("subtopics");

        if (cachedTopics && cachedSubtopics) {
          setTopics(JSON.parse(cachedTopics));
          setSubtopics(JSON.parse(cachedSubtopics));
        } else {
          const [t, s] = await Promise.all([
            readingApi.getPublicTopics(),
            readingApi.getPublicSubtopics(),
          ]);

          const sortedTopics = [...t].sort((a, b) => a.id - b.id);
          const sortedSubtopics = [...s].sort((a, b) => a.id - b.id);

          setTopics(sortedTopics);
          setSubtopics(sortedSubtopics);

          // Store in cache
          sessionStorage.setItem("topics", JSON.stringify(sortedTopics));
          sessionStorage.setItem("subtopics", JSON.stringify(sortedSubtopics));
        }
      } catch (err) {
        console.error("Failed to load public topics/subtopics", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);


  const getSubtopics = (topicId: number) =>
  subtopics.filter((s) => s.topic === topicId);


  if (loading) {
    return <div className="p-4">Loading topics...</div>;
  }

  return (
    <div className="flex flex-col border-l-2 border-gray-200">
      {/* <h2 className="text-xl font-extrabold text-[#3776AB] mb-4 tracking-wide">
        TOPICS
      </h2> */}

      <div className="flex flex-col">
        {topics.map((topic) => {
          const isOpen = openTopic === topic.id;

          return (
            <div key={topic.id}>
              <button
                onClick={() => setOpenTopic(isOpen ? null : topic.id)}
                className={`
  w-full flex flex-row items-center justify-start gap-3
  px-4 py-3 transition cursor-pointer
  ${isOpen ? "bg-blue-50 " : "hover:bg-gray-100"}
`}

              >
                <span className={`font-semibold text-md text-left flex-1
  ${isOpen ? "text-[#3776AB]" : "text-gray-900"}`}>
  {topic.name}
</span>


                <FiChevronRight
  size={18}
  className={`transition-transform ${isOpen ? "rotate-90 text-[#3776AB]" : ""}`}
/>

              </button>

              {/* Subtopics */}
              {isOpen && (
                <div className="ml-4 mt-3 flex flex-col min-w-lg">
                  {getSubtopics(topic.id).map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubtopic(sub.id)}
                      className={`text-sm py-2 pl-2 border-b border-gray-300 cursor-pointer w-50
                        ${
                          activeSubtopic === sub.id
                            ? "text-[#3776AB] font-semibold"
                            : "text-gray-800 hover:text-[#3776AB]"
                        }
                      `}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicMenu