import { useState, useEffect } from 'react';
import AdminModal from './Modals/AdminModal';
import type { PreAssessmentBulkGenerationParams } from '../../../types/questions';
import type { AdminZone } from '../../../types/adaptive';
import { adminApi } from '../../../api';

interface BulkGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PreAssessmentBulkGenerationParams) => Promise<void>;
}

export const BulkGenerationModal = ({ isOpen, onClose, onSubmit }: BulkGenerationModalProps) => {
    const [preassessmentData, setPreassessmentData] = useState<PreAssessmentBulkGenerationParams>({
        topic_ids: [],
        total_questions: 20
    });
    const [zones, setZones] = useState<AdminZone[]>([]);
    const [topics, setTopics] = useState<{ id: number; name: string; zone_id: number }[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedZones, setSelectedZones] = useState<number[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<{ id: number; name: string; zone_id: number }[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchZones();
            fetchTopics();
        }
    }, [isOpen]);

    const fetchZones = async () => {
        try {
            const data = await adminApi.getAllZonesNoPagination();
            console.log('🔍 DEBUG: Zones fetched:', data);
            console.log('🔍 DEBUG: Zone details:', data.map(zone => ({
                id: zone.id,
                name: zone.name,
                topics_count: zone.topics_count
            })));
            setZones(data);
        } catch (err) {
            console.error('Error fetching zones:', err);
        }
    };

    const fetchTopics = async () => {
        try {
            const data = await adminApi.getAllTopicsNoPagination();
            console.log('🔍 DEBUG: Raw topics data:', data);
            
            const transformedTopics = data.map(topic => ({
                id: topic.id,
                name: topic.name,
                zone_id: topic.zone
            }));
            
            console.log('🔍 DEBUG: Transformed topics:', transformedTopics);
            
            // Group topics by zone for debugging
            const topicsByZone = transformedTopics.reduce((acc, topic) => {
                if (!acc[topic.zone_id]) acc[topic.zone_id] = [];
                acc[topic.zone_id].push(topic);
                return acc;
            }, {} as Record<number, any[]>);
            
            console.log('🔍 DEBUG: Topics grouped by zone:', topicsByZone);
            
            setTopics(transformedTopics);
            setFilteredTopics(transformedTopics);
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            // Determine which topic IDs to send based on user selections
            let topicIdsToSend: number[] | undefined;
            
            if (preassessmentData.topic_ids?.length) {
                // User selected specific topics
                topicIdsToSend = preassessmentData.topic_ids;
            } else if (selectedZones.length > 0) {
                // User selected zones but no specific topics - send all topics from selected zones
                topicIdsToSend = topics
                    .filter(topic => selectedZones.includes(topic.zone_id))
                    .map(topic => topic.id);
            } else {
                // No specific selection - send all topics
                topicIdsToSend = topics.map(topic => topic.id);
            }
            
            const submissionData = {
                ...preassessmentData,
                topic_ids: topicIdsToSend?.length ? topicIdsToSend : undefined
            };
            
            await onSubmit(submissionData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to generate questions');
        } finally {
            setLoading(false);
        }
    };

    const toggleZone = (zoneId: number) => {
        const newSelectedZones = selectedZones.includes(zoneId)
            ? selectedZones.filter(id => id !== zoneId)
            : [...selectedZones, zoneId];
        
        console.log('🔍 DEBUG: Zone toggled:', zoneId);
        console.log('🔍 DEBUG: New selected zones:', newSelectedZones);
        
        setSelectedZones(newSelectedZones);
        
        // Filter topics based on selected zones
        if (newSelectedZones.length > 0) {
            const filtered = topics.filter(topic => newSelectedZones.includes(topic.zone_id));
            console.log('🔍 DEBUG: Filtered topics for zones', newSelectedZones, ':', filtered);
            console.log('🔍 DEBUG: All available topics:', topics);
            console.log('🔍 DEBUG: Topics in selected zones breakdown:', newSelectedZones.map(zoneId => ({
                zone: zoneId,
                topics: topics.filter(t => t.zone_id === zoneId)
            })));
            setFilteredTopics(filtered);
        } else {
            console.log('🔍 DEBUG: No zones selected, showing all topics:', topics);
            setFilteredTopics(topics);
        }
    };

    const toggleTopic = (topicId: number) => {
        setPreassessmentData(prev => ({
            ...prev,
            topic_ids: prev.topic_ids?.includes(topicId)
                ? prev.topic_ids.filter(id => id !== topicId)
                : [...(prev.topic_ids || []), topicId]
        }));
    };

    return (
        <AdminModal isOpen={isOpen} onClose={onClose} title="Generate Pre-assessment Questions">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Questions
                    </label>
                    <input
                        type="number"
                        min={1}
                        max={50}
                        value={preassessmentData.total_questions}
                        onChange={(e) => setPreassessmentData(prev => ({
                            ...prev,
                            total_questions: parseInt(e.target.value) || 20
                        }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Zones (Optional - for filtering topics)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Select zones to filter available topics below
                    </p>
                    <div className="max-h-32 overflow-y-auto border rounded-md p-2">
                        {zones.map(zone => (
                            <label key={zone.id} className="flex items-center py-1">
                                <input
                                    type="checkbox"
                                    checked={selectedZones.includes(zone.id)}
                                    onChange={() => toggleZone(zone.id)}
                                    className="mr-2"
                                />
                                {zone.name} ({zone.topics_count} topics)
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Topics (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        {selectedZones.length > 0 
                            ? 'Topics filtered by selected zones. Leave empty to use all topics from selected zones.' 
                            : 'Leave empty to generate for all topics'
                        }
                    </p>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                        {filteredTopics.map(topic => (
                            <label key={topic.id} className="flex items-center py-1">
                                <input
                                    type="checkbox"
                                    checked={preassessmentData.topic_ids?.includes(topic.id) || false}
                                    onChange={() => toggleTopic(topic.id)}
                                    className="mr-2"
                                />
                                {topic.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-[#3776AB] text-white rounded-md hover:brightness-110 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Questions'}
                    </button>
                </div>
            </form>
        </AdminModal>
    );
};
