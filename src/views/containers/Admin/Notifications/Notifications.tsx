import { useState, useEffect } from 'react';
import { adminApi } from '../../../../api/adminApi';
import type { AdminNotification, SendNotificationPayload } from '../../../../types/admin';
import { AdminModal, BackButton } from '../../../components/UI';
import { ADMIN_BUTTON_STYLES } from '../../../components/Layout';
import {
    FiBell, FiTrash2, FiSend, FiUsers, FiUser,
    FiAlertCircle, FiAward, FiInfo, FiPlus
} from 'react-icons/fi';

const TYPE_META = {
    general: { label: 'General', color: 'bg-blue-100 text-blue-800', icon: <FiInfo className="w-3 h-3" /> },
    achievement: { label: 'Achievement', color: 'bg-yellow-100 text-yellow-800', icon: <FiAward className="w-3 h-3" /> },
    system: { label: 'System', color: 'bg-red-100 text-red-800', icon: <FiAlertCircle className="w-3 h-3" /> },
};

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const defaultForm: SendNotificationPayload = {
    title: '',
    message: '',
    notification_type: 'general',
    is_broadcast: false,
    recipient: undefined,
};

const Notifications = () => {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form, setForm] = useState<SendNotificationPayload>(defaultForm);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const PAGE_SIZE = 10;

    useEffect(() => {
        fetchNotifications();
    }, [currentPage]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminApi.getAllNotifications({ page: currentPage, page_size: PAGE_SIZE });
            setNotifications(data.results);
            setTotal(data.count);
        } catch {
            setError('Failed to load notifications.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this notification?')) return;
        try {
            await adminApi.deleteNotification(id);
            await fetchNotifications();
        } catch {
            setError('Failed to delete notification.');
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitError('');
        try {
            const payload: SendNotificationPayload = { ...form };
            if (payload.is_broadcast) delete payload.recipient;
            await adminApi.sendNotification(payload);
            setIsModalOpen(false);
            setForm(defaultForm);
            setSuccessMsg('Notification sent successfully.');
            setTimeout(() => setSuccessMsg(''), 3000);
            await fetchNotifications();
        } catch (err: any) {
            setSubmitError(err?.response?.data?.message || err?.message || 'Failed to send notification.');
        } finally {
            setSubmitting(false);
        }
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
            <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Send and manage platform notifications</p>
                </div>
                <button
                    onClick={() => { setIsModalOpen(true); setForm(defaultForm); setSubmitError(''); }}
                    className={ADMIN_BUTTON_STYLES.PRIMARY}
                >
                    <FiPlus className="w-4 h-4" />
                    Send Notification
                </button>
            </div>

            {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    {successMsg}
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FiBell className="w-4 h-4 text-[#7054D0]" />
                        <span className="font-semibold text-gray-700 text-sm">All Notifications</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{total}</span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-sm text-gray-400">Loading...</div>
                ) : notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <FiBell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No notifications yet.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                <tr>
                                    <th className="px-4 py-3 text-left">Title</th>
                                    <th className="px-4 py-3 text-left">Message</th>
                                    <th className="px-4 py-3 text-center">Type</th>
                                    <th className="px-4 py-3 text-center">Recipient</th>
                                    <th className="px-4 py-3 text-center">Read</th>
                                    <th className="px-4 py-3 text-left">Sent</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {notifications.map((n) => {
                                    const meta = TYPE_META[n.notification_type];
                                    return (
                                        <tr key={n.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800 max-w-[160px] truncate">
                                                {n.title}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 max-w-[240px]">
                                                <p className="line-clamp-2">{n.message}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${meta.color}`}>
                                                    {meta.icon} {meta.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {n.is_broadcast ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                        <FiUsers className="w-3 h-3" /> All Users
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                        <FiUser className="w-3 h-3 text-gray-400" />
                                                        {n.recipient_username || `#${n.recipient}`}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`px-2 py-1 rounded-full text-xs ${n.is_read ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                    {n.is_read ? 'Read' : 'Unread'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                                {formatDate(n.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => handleDelete(n.id)}
                                                    className={ADMIN_BUTTON_STYLES.ICON_DANGER}
                                                    title="Delete"
                                                >
                                                    <FiTrash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                        <span>{total} total</span>
                        <div className="flex gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => p - 1)}
                                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                            >
                                Prev
                            </button>
                            <span className="px-3 py-1">{currentPage} / {totalPages}</span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => p + 1)}
                                className="px-3 py-1 rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Send Notification Modal */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Send Notification"
            >
                <form onSubmit={handleSend} className="space-y-4">
                    {/* Broadcast toggle */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="is_broadcast"
                            checked={form.is_broadcast}
                            onChange={e => setForm(f => ({ ...f, is_broadcast: e.target.checked, recipient: undefined }))}
                            className="w-4 h-4 text-[#7054D0] rounded"
                        />
                        <label htmlFor="is_broadcast" className="text-sm font-medium text-purple-800 flex items-center gap-1.5">
                            <FiUsers className="w-4 h-4" /> Broadcast to all learners
                        </label>
                    </div>

                    {/* Recipient (single user) */}
                    {!form.is_broadcast && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recipient User ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                value={form.recipient ?? ''}
                                onChange={e => setForm(f => ({ ...f, recipient: e.target.value ? Number(e.target.value) : undefined }))}
                                placeholder="e.g. 3"
                                required={!form.is_broadcast}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#7054D0]"
                            />
                        </div>
                    )}

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={form.notification_type}
                            onChange={e => setForm(f => ({ ...f, notification_type: e.target.value as SendNotificationPayload['notification_type'] }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#7054D0]"
                        >
                            <option value="general">General</option>
                            <option value="achievement">Achievement</option>
                            <option value="system">System</option>
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            required
                            placeholder="Notification title"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#7054D0]"
                        />
                    </div>

                    {/* Message */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            required
                            rows={3}
                            placeholder="Write your message..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#7054D0] resize-none"
                        />
                    </div>

                    {submitError && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{submitError}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setIsModalOpen(false)} className={ADMIN_BUTTON_STYLES.SECONDARY}>
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className={ADMIN_BUTTON_STYLES.PRIMARY}>
                            <FiSend className="w-4 h-4" />
                            {submitting ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
            </AdminModal>
        </div>
    );
};

export default Notifications;
