interface PreviewCardsProps {
  header: React.ReactNode;
  children: React.ReactNode;
}

const PreviewCards: React.FC<PreviewCardsProps> = ({ header, children }) => {
  return (
    <div className="bg-white w-full h-full rounded-md shadow border overflow-hidden">
      <div className="bg-gray-100 px-4 py-3 border-b">
        {header}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default PreviewCards;
