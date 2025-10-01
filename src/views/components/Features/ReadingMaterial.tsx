import { useEffect, useState } from "react";
import { getReadingMaterials } from "../../../api/readingApi";
interface ReadingMaterialType {
  id: number;
  title: string;
  content: string;
  topic_ref: number;
  subtopic_ref: number;
}


const ReadingMaterial = () => {
  const [materials, setMaterials] = useState<ReadingMaterialType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getReadingMaterials()
      .then((res: any) => {
        
        setMaterials(res.data.results || res.data);
      })
      .catch((err: unknown) => {
        console.error("Error fetching reading materials:", err);
      })
      .finally(() => setLoading(false));
  }, []);

    return (
    <div className="w-full h-full rounded-md bg-white shadow-md p-4 overflow-y-auto">
      {loading ? (
        <p>Loading materials...</p>
      ) : (
        <ul className="space-y-3">
          {materials.map((m) => (
            <li key={m.id} className="border-b pb-2">
              <h2 className="font-semibold text-lg">{m.title}</h2>
              <p className="text-gray-700 whitespace-pre-line">{m.content}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReadingMaterial;
