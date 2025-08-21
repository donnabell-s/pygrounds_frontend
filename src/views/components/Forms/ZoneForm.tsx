import React, { useMemo } from 'react';
import type { AdminZone } from '../../../types/adaptive';

interface ZoneFormProps {
    onSubmit: (data: Omit<AdminZone, 'id'>) => void;
    onCancel: () => void;
    initialValues?: Partial<AdminZone>;
    isLoading?: boolean;
    existingZones: AdminZone[];
}

const ZoneForm: React.FC<ZoneFormProps> = ({ 
    onSubmit, 
    onCancel, 
    initialValues, 
    isLoading,
    existingZones 
}) => {
    const [formData, setFormData] = React.useState({
        name: initialValues?.name || '',
        description: initialValues?.description || '',
        order: initialValues?.order || getNextAvailableOrder(existingZones)
    });

    const [errors, setErrors] = React.useState({
        name: '',
        description: '',
        order: ''
    });

    // Function to reset form to initial values
    const handleReset = () => {
        setFormData({
            name: initialValues?.name || '',
            description: initialValues?.description || '',
            order: initialValues?.order || getNextAvailableOrder(existingZones)
        });
        setErrors({
            name: '',
            description: '',
            order: ''
        });
    };

    // Validate form fields
    const validateForm = (): boolean => {
        const newErrors = {
            name: '',
            description: '',
            order: ''
        };

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.order) {
            newErrors.order = 'Order is required';
        }

        setErrors(newErrors);
        return !Object.values(newErrors).some(error => error !== '');
    };

    // Calculate available order numbers
    const availableOrders = useMemo(() => {
        const takenOrders = new Set(existingZones.map(zone => zone.order));
        // If we're editing, add the current order back to available options
        if (initialValues?.order !== undefined) {
            takenOrders.delete(initialValues.order);
        }
        
        // Find the highest order number
        const maxOrder = Math.max(...Array.from(takenOrders), 0) + 1;
        
        // Generate array of all possible orders up to maxOrder
        const allOrders = Array.from({ length: maxOrder }, (_, i) => i + 1);
        
        // Filter out taken orders
        return allOrders.filter(order => !takenOrders.has(order));
    }, [existingZones, initialValues?.order]);

    // Helper function to get next available order
    function getNextAvailableOrder(zones: AdminZone[]): number {
        if (zones.length === 0) return 1;
        const takenOrders = new Set(zones.map(zone => zone.order));
        let order = 1;
        while (takenOrders.has(order)) {
            order++;
        }
        return order;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({ ...formData, topics_count: 0 });
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
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
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
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <select
                    value={formData.order}
                    onChange={(e) => {
                        setFormData(prev => ({ ...prev, order: parseInt(e.target.value, 10) }));
                        setErrors(prev => ({ ...prev, order: '' }));
                    }}
                    required
                    className={`mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                        errors.order ? 'border-red-500' : 'border-gray-300'
                    }`}
                >
                    {availableOrders.map((order) => (
                        <option key={order} value={order}>
                            {order}
                        </option>
                    ))}
                </select>
                {errors.order && <p className="mt-1 text-sm text-red-600">{errors.order}</p>}
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

export default ZoneForm;
