import React, { useEffect, useState } from 'react';
import type { AdminTopic, AdminZone } from '../../../types/adaptive';
import { adminApi } from '../../../api';

interface TopicFormProps {
    onSubmit: (data: Omit<AdminTopic, 'id'>) => void;
    onCancel: () => void;
    initialValues?: Partial<AdminTopic>;
    isLoading?: boolean;
}

const TopicForm: React.FC<TopicFormProps> = ({ onSubmit, onCancel, initialValues, isLoading }) => {
    const [formData, setFormData] = useState({
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        zone: initialValues?.zone || 0
    });

    const [errors, setErrors] = useState({
        name: '',
        description: '',
        zone: ''
    });

    const [zones, setZones] = useState<AdminZone[]>([]);
    const [loadingZones, setLoadingZones] = useState(true);

    // Function to reset form to initial values
    const handleReset = () => {
        setFormData({
            name: initialValues?.name || '',
            description: initialValues?.description || '',
            zone: initialValues?.zone || 0
        });
        setErrors({
            name: '',
            description: '',
            zone: ''
        });
    };

    // Validate form fields
    const validateForm = (): boolean => {
        const newErrors = {
            name: '',
            description: '',
            zone: ''
        };

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.zone) {
            newErrors.zone = 'Zone is required';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const zonesData = await adminApi.getAllZones();
                setZones(zonesData);
            } catch (error) {
                console.error('Failed to fetch zones:', error);
            } finally {
                setLoadingZones(false);
            }
        };
        fetchZones();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            // Find the zone name for the submission
            const selectedZone = zones.find(z => z.id === formData.zone);
            onSubmit({ 
                ...formData, 
                zone_name: selectedZone?.name || '',
                subtopics_count: 0 
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                        setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    value={formData.description}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, description: e.target.value }));
                        setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    required
                    rows={3}
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Zone</label>
                <select
                    value={formData.zone}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, zone: parseInt(e.target.value, 10) }));
                        setErrors(prev => ({ ...prev, zone: '' }));
                    }}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                        errors.zone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    disabled={loadingZones}
                >
                    <option value="">Select a zone</option>
                    {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                            {zone.name}
                        </option>
                    ))}
                </select>
                {errors.zone && <p className="mt-1 text-sm text-red-600">{errors.zone}</p>}
            </div>
            <div className="flex justify-end gap-2">
                <button
                    type="button"
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Reset
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default TopicForm;
        