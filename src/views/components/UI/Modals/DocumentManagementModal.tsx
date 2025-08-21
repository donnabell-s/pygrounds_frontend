import { useState } from 'react';
import { Modal } from '.';

interface DocumentManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { file: File; difficulty: string; is_pipeline: boolean }) => Promise<void>;
    editMode?: boolean;
    initialDifficulty?: string;
}

const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'master'] as const;

export const DocumentManagementModal = ({
    isOpen,
    onClose,
    onSubmit,
    editMode = false,
    initialDifficulty
}: DocumentManagementModalProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [difficulty, setDifficulty] = useState<string>(initialDifficulty || 'beginner');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editMode && !file) {
            setError('Please select a file');
            return;
        }

        setError('');
        const data = {
            file: file as File,
            difficulty,
            is_pipeline: false  // Upload only, don't run pipeline automatically
        };
        // Call onSubmit synchronously - parent handles async operations and modal closing
        onSubmit(data);
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={editMode ? "Edit Document" : "Upload Document"}
        >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md">
                        {error}
                    </div>
                )}

                {!editMode && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document File
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="mt-1 block w-full text-sm text-gray-900
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                            accept=".pdf,.doc,.docx,.txt"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                    </label>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    >
                        {difficultyLevels.map((level) => (
                            <option key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#3776AB] text-white rounded-md hover:brightness-110"
                    >
                        {editMode ? 'Save Changes' : 'Upload'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};
