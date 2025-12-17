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

  useEffect(() => {
  const load = async () => {
    try {
      const t = await readingApi.getPublicTopics();
      const s = await readingApi.getPublicSubtopics();

      setTopics([...t].sort((a, b) => a.id - b.id));
      setSubtopics([...s].sort((a, b) => a.id - b.id));
    } catch (err) {
      console.error("Failed to load public topics/subtopics", err);
    }
  };

  load();
}, []);


  const getSubtopics = (topicId: number) =>
  subtopics.filter((s) => s.topic === topicId);


  return (
    <div className="mt-3 flex flex-col pl-3 border-l-2 border-gray-200">
      <h2 className="text-xl font-extrabold text-[#3776AB] mb-4 tracking-wide">
        TOPICS
      </h2>

      <div className="flex flex-col gap-3">
        {topics.map((topic) => {
          const isOpen = openTopic === topic.id;

          return (
            <div key={topic.id}>
              <button
                onClick={() => setOpenTopic(isOpen ? null : topic.id)}
                className={`
  w-full flex flex-row items-center justify-start gap-3
  px-4 py-3 rounded-xl transition
  ${isOpen ? "bg-blue-50 border border-[#3776AB]" : "hover:bg-gray-100"}
`}

              >
                <span className={`font-bold text-lg text-left flex-1
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
                <div className="ml-4 mt-3 flex flex-col">
                  {getSubtopics(topic.id).map((sub) => (
                    <div
                      key={sub.id}
                      onClick={() => onSelectSubtopic(sub.id)}
                      className={`text-sm py-2 pl-2 border-b border-gray-300 cursor-pointer
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