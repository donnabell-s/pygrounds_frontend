import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { readingApi } from "../../../../../api/readingApi";
import ReactMarkdown from "react-markdown";

interface ReadingMaterial {
  id: number;
  title: string;
  content: string;
  topic_ref?: number;
  subtopic_ref?: number;
  topic_name?: string;
  subtopic_name?: string;
}

interface Topic {
  id: number;
  name: string;
}

const TopicView = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<ReadingMaterial[]>([]);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const response = await readingApi.getAll();
        const data: ReadingMaterial[] = Array.isArray(response)
          ? response
          : response?.results ?? [];

        const topicsMap = new Map<number, string>();
        data.forEach((item) => {
          if (item.topic_ref && item.topic_name) {
            topicsMap.set(item.topic_ref, item.topic_name);
          }
        });

        const sortedTopics = Array.from(topicsMap.entries())
          .map(([id, name]) => ({ id, name }))
          .sort((a, b) => a.id - b.id);
        setAllTopics(sortedTopics);

        const currentTopicId = Number(topicId);
        const filtered = data.filter(
          (item: ReadingMaterial) => item.topic_ref === currentTopicId
        );
        setMaterials(filtered);

        const CIndex = sortedTopics.findIndex(
          (topic) => topic.id === currentTopicId
        );
        setCurrentIndex(CIndex);
      } catch (err) {
        setError("Failed to load reading materials.");
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchMaterials();
    }
  }, [topicId]);

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevTopicId = allTopics[currentIndex - 1].id;
      navigate(`/user/python-learn/${prevTopicId}`);
    }
  };

  const handleNext = () => {
    if (currentIndex < allTopics.length - 1) {
      const nextTopicId = allTopics[currentIndex + 1].id;
      navigate(`/user/python-learn/${nextTopicId}`);
    }
  };

  const NavButtons = () => (
    <div className="flex justify-between items-center my-4">
      <button
        onClick={handlePrev}
        disabled={currentIndex <= 0}
        className="bg-[#7053D0] text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &#10094; Previous
      </button>
      <button
        onClick={handleNext}
        disabled={currentIndex >= allTopics.length - 1}
        className="bg-[#7053D0] text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next &#10095;
      </button>
    </div>
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="flex flex-col">
      <NavButtons />
      <div className="flex flex-col gap-6">
        {materials.map((mat) => (
          <div
            key={mat.id}
            id={`subtopic-${mat.subtopic_ref}`}
            className="scroll-mt-32 bg-white border border-gray-200 rounded-lg p-5 shadow-sm"
          >
            <h3 className="text-xl font-semibold text-gray-900">{mat.title}</h3>
            <div className="prose prose-lg max-w-none mt-2">
              <ReactMarkdown>{mat.content}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <NavButtons />
    </div>
  );
};

export default TopicView;
