import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api';
import type { BulkGenerationParams } from '../../../../types/questions';
import type { AdminZone, AdminSubtopic } from '../../../../types/adaptive';
import { FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';

interface MinigameBulkGenerationProps {
    onBack: () => void;
    onSubmit: (data: BulkGenerationParams) => Promise<void>;
}

const difficultyLevels = ['beginner', 'intermediate', 'advanced', 'master'] as const;

const MinigameBulkGeneration = ({ onBack, onSubmit }: MinigameBulkGenerationProps) => {
    const [formData, setFormData] = useState<BulkGenerationParams>({
        game_type: 'non_coding',
        difficulty_levels: [],
        num_questions_per_subtopic: 5,
        subtopic_ids: []
    });

    const [zones, setZones] = useState<AdminZone[]>([]);
    const [topics, setTopics] = useState<{ id: number; name: string; zone_id: number }[]>([]);
    const [subtopics, setSubtopics] = useState<AdminSubtopic[]>([]);
    
    const [selectedZones, setSelectedZones] = useState<number[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
    const [filteredTopics, setFilteredTopics] = useState<{ id: number; name: string; zone_id: number }[]>([]);
    const [filteredSubtopics, setFilteredSubtopics] = useState<AdminSubtopic[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchZones();
        fetchTopics();
        fetchSubtopics();
    }, []);

    // Cross-reference check when both topics and subtopics are loaded
    useEffect(() => {
        if (topics.length > 0 && subtopics.length > 0) {
            console.log('🎮 DEBUG: Cross-reference check - Topics vs Subtopics');
            
            // Check which topics have subtopics
            topics.forEach(topic => {
                const topicSubtopics = subtopics.filter(sub => sub.topic === topic.id);
                console.log(`🎮 DEBUG: Topic "${topic.name}" (ID: ${topic.id}, Zone: ${topic.zone_id}) has ${topicSubtopics.length} subtopics:`, 
                    topicSubtopics.map(sub => sub.name));
            });
            
            // Check for orphaned subtopics
            const topicIds = topics.map(t => t.id);
            const orphanedSubtopics = subtopics.filter(sub => !topicIds.includes(sub.topic));
            if (orphanedSubtopics.length > 0) {
                console.log('🎮 DEBUG: Orphaned subtopics (no matching topic):', orphanedSubtopics);
            }
        }
    }, [topics, subtopics]);

    const fetchZones = async () => {
        try {
            const data = await adminApi.getAllZonesNoPagination();
            setZones(data);
        } catch (err) {
            console.error('Error fetching zones:', err);
        }
    };

    const fetchTopics = async () => {
        try {
            const data = await adminApi.getAllTopicsNoPagination();
            console.log('🎮 DEBUG: Minigame - Raw topics data:', data);
            
            const transformedTopics = data.map(topic => ({
                id: topic.id,
                name: topic.name,
                zone_id: topic.zone
            }));
            
            console.log('🎮 DEBUG: Minigame - Transformed topics:', transformedTopics);
            
            // Group topics by zone for debugging
            const topicsByZone = transformedTopics.reduce((acc, topic) => {
                if (!acc[topic.zone_id]) acc[topic.zone_id] = [];
                acc[topic.zone_id].push(topic);
                return acc;
            }, {} as Record<number, any[]>);
            
            console.log('🎮 DEBUG: Minigame - Topics grouped by zone:', topicsByZone);
            
            // Check specifically which topics are in zones 2, 3, 4
            const problemZones = [2, 3, 4];
            problemZones.forEach(zoneId => {
                const topicsInZone = transformedTopics.filter(t => t.zone_id === zoneId);
                console.log(`🎮 DEBUG: Minigame - Topics in zone ${zoneId}:`, topicsInZone);
            });
            
            setTopics(transformedTopics);
        } catch (err) {
            console.error('Error fetching topics:', err);
        }
    };

    const fetchSubtopics = async () => {
        try {
            const data = await adminApi.getAllSubtopicsNoPagination();
            console.log('🎮 DEBUG: Minigame - Raw subtopics data:', data);
            console.log('🎮 DEBUG: Minigame - Total subtopics count:', data.length);
            
            // Show first few subtopics to check structure
            console.log('🎮 DEBUG: Minigame - Sample subtopics:', data.slice(0, 5));
            
            // Check which topic IDs have subtopics
            const topicIdsWithSubtopics = [...new Set(data.map(sub => sub.topic))].sort();
            console.log('🎮 DEBUG: Minigame - Topic IDs that have subtopics:', topicIdsWithSubtopics);
            
            // Group subtopics by topic for debugging
            const subtopicsByTopic = data.reduce((acc, subtopic) => {
                if (!acc[subtopic.topic]) acc[subtopic.topic] = [];
                acc[subtopic.topic].push(subtopic);
                return acc;
            }, {} as Record<number, any[]>);
            
            console.log('🎮 DEBUG: Minigame - Subtopics grouped by topic:', subtopicsByTopic);
            
            // Check specifically for topic 6 (the one you tested)
            const topic6Subtopics = data.filter(sub => sub.topic === 6);
            console.log('🎮 DEBUG: Minigame - Subtopics for topic 6 specifically:', topic6Subtopics);
            
            setSubtopics(data);
            setFilteredSubtopics(data);
        } catch (err) {
            console.error('Error fetching subtopics:', err);
        }
    };

    const toggleZone = (zoneId: number) => {
        const newSelectedZones = selectedZones.includes(zoneId)
            ? selectedZones.filter(id => id !== zoneId)
            : [...selectedZones, zoneId];
        
        console.log('🎮 DEBUG: Minigame - Zone toggled:', zoneId);
        console.log('🎮 DEBUG: Minigame - New selected zones:', newSelectedZones);
        
        setSelectedZones(newSelectedZones);
        
        // Update filtered topics based on selected zones
        if (newSelectedZones.length > 0) {
            const filtered = topics.filter(topic => newSelectedZones.includes(topic.zone_id));
            console.log('🎮 DEBUG: Minigame - Filtered topics for zones', newSelectedZones, ':', filtered);
            console.log('🎮 DEBUG: Minigame - Topics breakdown by zone:', newSelectedZones.map(zoneId => ({
                zone: zoneId,
                topics: topics.filter(t => t.zone_id === zoneId)
            })));
            setFilteredTopics(filtered);
        } else {
            console.log('🎮 DEBUG: Minigame - No zones selected, clearing topics and subtopics');
            setFilteredTopics([]);
            setSelectedTopics([]);
            setFilteredSubtopics([]);
        }
        
        // Zone selection is only for UI filtering, not sent to backend
    };

    const toggleTopic = (topicId: number) => {
        const newSelectedTopics = selectedTopics.includes(topicId)
            ? selectedTopics.filter(id => id !== topicId)
            : [...selectedTopics, topicId];
        
        console.log('🎮 DEBUG: Minigame - Topic toggled:', topicId);
        console.log('🎮 DEBUG: Minigame - New selected topics:', newSelectedTopics);
        
        setSelectedTopics(newSelectedTopics);
        
        // Update filtered subtopics based on selected topics
        if (newSelectedTopics.length > 0) {
            const filtered = subtopics.filter(sub => newSelectedTopics.includes(sub.topic));
            console.log('🎮 DEBUG: Minigame - Filtered subtopics for topics', newSelectedTopics, ':', filtered);
            console.log('🎮 DEBUG: Minigame - Subtopics breakdown by topic:', newSelectedTopics.map(topicId => ({
                topic: topicId,
                subtopics: subtopics.filter(s => s.topic === topicId)
            })));
            setFilteredSubtopics(filtered);
        } else {
            console.log('🎮 DEBUG: Minigame - No topics selected, clearing subtopics');
            setFilteredSubtopics([]);
        }
        
        // Topic selection is only for UI filtering, not sent to backend
    };

    const toggleSubtopic = (subtopicId: number) => {
        setFormData(prev => ({
            ...prev,
            subtopic_ids: prev.subtopic_ids?.includes(subtopicId)
                ? prev.subtopic_ids.filter(id => id !== subtopicId)
                : [...(prev.subtopic_ids || []), subtopicId]
        }));
    };

    const toggleDifficulty = (difficulty: typeof difficultyLevels[number]) => {
        setFormData(prev => {
            const currentLevels = prev.difficulty_levels ?? [];
            return {
                ...prev,
                difficulty_levels: currentLevels.includes(difficulty)
                    ? currentLevels.filter(d => d !== difficulty)
                    : [...currentLevels, difficulty]
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            // Determine which subtopic IDs to send based on user selections
            let subtopicIdsToSend: number[] | undefined;
            
            if (formData.subtopic_ids?.length) {
                // User selected specific subtopics
                subtopicIdsToSend = formData.subtopic_ids;
            } else if (selectedTopics.length > 0) {
                // User selected topics but no specific subtopics - send all subtopics from selected topics
                subtopicIdsToSend = subtopics
                    .filter(sub => selectedTopics.includes(sub.topic))
                    .map(sub => sub.id);
            } else if (selectedZones.length > 0) {
                // User selected zones but no topics - send all subtopics from topics in selected zones
                const topicsInSelectedZones = topics
                    .filter(topic => selectedZones.includes(topic.zone_id))
                    .map(topic => topic.id);
                subtopicIdsToSend = subtopics
                    .filter(sub => topicsInSelectedZones.includes(sub.topic))
                    .map(sub => sub.id);
            } else {
                // No specific selection - send all subtopics
                subtopicIdsToSend = subtopics.map(sub => sub.id);
            }
            
            const submissionData = {
                ...formData,
                difficulty_levels: (formData.difficulty_levels?.length ?? 0) > 0 
                    ? formData.difficulty_levels 
                    : ['beginner', 'intermediate', 'advanced', 'master'] as ('beginner' | 'intermediate' | 'advanced' | 'master')[],
                subtopic_ids: subtopicIdsToSend?.length ? subtopicIdsToSend : undefined
            };
            
            await onSubmit(submissionData);
        } catch (err: any) {
            setError(err.message || 'Failed to generate questions');
        } finally {
            setLoading(false);
        }
    };

    const clearAllSelections = () => {
        setSelectedZones([]);
        setSelectedTopics([]);
        setFilteredTopics([]);
        setFilteredSubtopics([]);
        setFormData(prev => ({
            ...prev,
            subtopic_ids: []
        }));
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
                >
                    <FiArrowLeft /> Back to Question Bank
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Bulk Generate Minigame Questions</h1>
                <p className="text-gray-600 mt-2">
                    Configure your bulk generation settings. Select zones to show topics, then select topics to show subtopics.
                </p>
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Settings */}
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-lg font-semibold mb-4">Basic Settings</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Game Type
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        checked={formData.game_type === 'coding'}
                                        onChange={() => setFormData(prev => ({ ...prev, game_type: 'coding' }))}
                                        className="mr-2"
                                    />
                                    Coding Questions
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        checked={formData.game_type === 'non_coding'}
                                        onChange={() => setFormData(prev => ({ ...prev, game_type: 'non_coding' }))}
                                        className="mr-2"
                                    />
                                    Non-Coding Questions
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Questions per Subtopic
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                value={formData.num_questions_per_subtopic}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    num_questions_per_subtopic: parseInt(e.target.value) || 5
                                }))}
                                className="w-full rounded-md border border-gray-300 p-2"
                            />
                            <p className="text-sm text-gray-500 mt-1">1-50 questions per subtopic</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty Levels
                            </label>
                            <p className="text-xs text-gray-500 mb-2">
                                Leave empty for all levels
                            </p>
                            <div className="space-y-1">
                                {difficultyLevels.map(difficulty => (
                                    <label key={difficulty} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.difficulty_levels?.includes(difficulty) ?? false}
                                            onChange={() => toggleDifficulty(difficulty)}
                                            className="mr-2"
                                        />
                                        <span className="capitalize text-sm">{difficulty}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Zone Selection */}
                <div className="bg-white rounded-lg border p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Zone Selection</h2>
                        <button
                            type="button"
                            onClick={clearAllSelections}
                            className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                            <FiX className="w-4 h-4" /> Clear All Selections
                        </button>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                        Select zones to filter available topics. Leave empty to generate for all zones.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {zones.map(zone => (
                            <div key={zone.id} className="border rounded-lg p-3 hover:bg-gray-50">
                                <label className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedZones.includes(zone.id)}
                                        onChange={() => toggleZone(zone.id)}
                                        className="mt-1"
                                    />
                                    <div>
                                        <div className="font-medium">{zone.name}</div>
                                        <div className="text-sm text-gray-500">{zone.topics_count} topics</div>
                                        {zone.description && (
                                            <div className="text-sm text-gray-600 mt-1">{zone.description}</div>
                                        )}
                                    </div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Topic Selection - Only show if zones are selected */}
                {selectedZones.length > 0 && (
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-lg font-semibold mb-4">Topic Selection</h2>
                        <p className="text-gray-600 mb-4">
                            Topics from selected zones. Select specific topics or leave empty to use all topics from selected zones.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTopics.map(topic => (
                                <div key={topic.id} className="border rounded-lg p-3 hover:bg-gray-50">
                                    <label className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedTopics.includes(topic.id)}
                                            onChange={() => toggleTopic(topic.id)}
                                        />
                                        <div className="font-medium">{topic.name}</div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Subtopic Selection - Only show if topics are selected */}
                {selectedTopics.length > 0 && (
                    <div className="bg-white rounded-lg border p-6">
                        <h2 className="text-lg font-semibold mb-4">Subtopic Selection</h2>
                        <p className="text-gray-600 mb-4">
                            Subtopics from selected topics. Select specific subtopics or leave empty to use all subtopics from selected topics.
                        </p>
                        
                        {filteredSubtopics.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredSubtopics.map(subtopic => (
                                    <div key={subtopic.id} className="border rounded-lg p-3 hover:bg-gray-50">
                                        <label className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={formData.subtopic_ids?.includes(subtopic.id) || false}
                                                onChange={() => toggleSubtopic(subtopic.id)}
                                                className="mt-1"
                                            />
                                            <div>
                                                <div className="font-medium">{subtopic.name}</div>
                                                <div className="text-sm text-gray-500">{subtopic.topic_name}</div>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-yellow-800">
                                    <span className="font-medium">⚠️ No Subtopics Found</span>
                                </div>
                                <p className="text-yellow-700 mt-1">
                                    The selected topics don't have any subtopics in the database. 
                                    Questions will be generated at the topic level instead.
                                </p>
                                <p className="text-sm text-yellow-600 mt-2">
                                    Selected topics: {selectedTopics.map(id => {
                                        const topic = topics.find(t => t.id === id);
                                        return topic?.name;
                                    }).join(', ')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Generation Summary */}
                <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-blue-800">Generation Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Game Type:</span>
                            <div className="capitalize">{formData.game_type.replace('_', ' ')}</div>
                        </div>
                        <div>
                            <span className="font-medium">Questions/Subtopic:</span>
                            <div>{formData.num_questions_per_subtopic}</div>
                        </div>
                        <div>
                            <span className="font-medium">Difficulty Levels:</span>
                            <div>{formData.difficulty_levels?.length ? formData.difficulty_levels.join(', ') : 'All levels'}</div>
                        </div>
                        <div>
                            <span className="font-medium">Scope:</span>
                            <div>
                                {(() => {
                                    if (formData.subtopic_ids?.length) {
                                        return `${formData.subtopic_ids.length} selected subtopic(s)`;
                                    } else if (selectedTopics.length > 0) {
                                        const subtopicCount = subtopics.filter(sub => selectedTopics.includes(sub.topic)).length;
                                        return `All subtopics from ${selectedTopics.length} topic(s) (${subtopicCount} subtopics)`;
                                    } else if (selectedZones.length > 0) {
                                        const topicsInZones = topics.filter(topic => selectedZones.includes(topic.zone_id)).map(topic => topic.id);
                                        const subtopicCount = subtopics.filter(sub => topicsInZones.includes(sub.topic)).length;
                                        return `All subtopics from ${selectedZones.length} zone(s) (${subtopicCount} subtopics)`;
                                    } else {
                                        return `All subtopics (${subtopics.length} subtopics)`;
                                    }
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-[#3776AB] text-white rounded-md hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>Generating...</>
                        ) : (
                            <>
                                <FiCheck className="w-4 h-4" />
                                Generate Questions
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MinigameBulkGeneration;