import { useState, useEffect } from 'react';
import Modal from './Modal';
import { ADMIN_BUTTON_STYLES } from '../../Layout';
import type { AdminZone } from '../../../../types/adaptive';

type FormData = {
    name: string;
    description: string;
    order: number;
};

type ZoneModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        description: string;
        order: number;
    }) => Promise<void>;
    initialData?: AdminZone;
    title: string;
};

const ZoneModal = ({ isOpen, onClose, onSubmit, initialData, title }: ZoneModalProps) => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        order: 0
    });

    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                description: initialData.description,
                order: initialData.order
            });
        } else {
            setFormData({
                name: '',
                description: '',
                order: 0
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            setError('Name is required');
            return;
        }

        try {
            await onSubmit(formData);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md">
                        {error}
                    </div>
                )}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData((prev: FormData) => ({ ...prev, name: e.target.value }))}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData((prev: FormData) => ({ ...prev, description: e.target.value }))}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                        rows={3}
                    />
                </div>
                <div>
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                        Order
                    </label>
                    <input
                        type="number"
                        id="order"
                        value={formData.order}
                        onChange={(e) => setFormData((prev: FormData) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="mt-1 w-full rounded-md border border-gray-300 p-2"
                    />
                </div>
                <div className="flex justify-end gap-3 mt-4">
                    <button 
                        type="button" 
                        onClick={onClose}
                        className={ADMIN_BUTTON_STYLES.SECONDARY}
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit"
                        className={ADMIN_BUTTON_STYLES.PRIMARY}
                    >
                        {initialData ? 'Update' : 'Create'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default ZoneModal;
