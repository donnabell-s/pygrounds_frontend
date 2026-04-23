import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../../../api/adminApi';
import { useAuth } from '../../../../context/AuthContext';
import type { AdminNotification } from '../../../../types/admin';
import {
    FiUsers, FiBookOpen, FiAlertCircle, FiLayers,
    FiGrid, FiFileText, FiCheckCircle,
    FiClock, FiXCircle, FiLoader, FiBell, FiMail,
    FiShield, FiUser, FiInfo, FiAward,
} from 'react-icons/fi';
import { BsDiagram3 } from 'react-icons/bs';

interface StatsState {
    totalUsers: number | null;
    totalQuestions: number | null;
    pendingQuestions: number | null;
    totalTopics: number | null;
    totalZones: number | null;
    totalSubtopics: number | null;
    documents: {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        failed: number;
    } | null;
}

const TYPE_META = {
    general: { color: 'bg-blue-100 text-blue-700', icon: <FiInfo className="w-3 h-3" /> },
    achievement: { color: 'bg-yellow-100 text-yellow-700', icon: <FiAward className="w-3 h-3" /> },
    system: { color: 'bg-red-100 text-red-700', icon: <FiAlertCircle className="w-3 h-3" /> },
};

const StatCard = ({
    icon, label, value, color, onClick,
}: {
    icon: React.ReactNode;
    label: string;
    value: number | null;
    color: string;
    onClick?: () => void;
}) => (
    <div
        onClick={onClick}
        className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
    >
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-800">
                {value === null ? (
                    <span className="inline-block w-10 h-6 bg-gray-200 animate-pulse rounded" />
                ) : (
                    value.toLocaleString()
                )}
            </p>
        </div>
    </div>
);

const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Dashboard = () => {
    const navigate = useNavigate();
    const { adminId } = useParams();
    const { user } = useAuth();

    const [stats, setStats] = useState<StatsState>({
        totalUsers: null,
        totalQuestions: null,
        pendingQuestions: null,
        totalTopics: null,
        totalZones: null,
        totalSubtopics: null,
        documents: null,
    });
    const [recentNotifs, setRecentNotifs] = useState<AdminNotification[]>([]);
    const [notifsLoading, setNotifsLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            const [users, questions, pending, topics, zones, subtopics, docs] = await Promise.allSettled([
                adminApi.getAllUsers({ page_size: 1 }),
                adminApi.getAllQuestions({ page_size: 1 }),
                adminApi.getAllQuestions({ page_size: 1, validation_status: 'pending' }),
                adminApi.getAllTopics({ page_size: 1 }),
                adminApi.getAllZones({ page_size: 1 }),
                adminApi.getAllSubtopics({ page_size: 1 }),
                adminApi.getAllDocuments(),
            ]);

            setStats({
                totalUsers: users.status === 'fulfilled' ? users.value.count : 0,
                totalQuestions: questions.status === 'fulfilled' ? questions.value.count : 0,
                pendingQuestions: pending.status === 'fulfilled' ? pending.value.count : 0,
                totalTopics: topics.status === 'fulfilled' ? topics.value.count : 0,
                totalZones: zones.status === 'fulfilled' ? zones.value.count : 0,
                totalSubtopics: subtopics.status === 'fulfilled' ? subtopics.value.count : 0,
                documents: docs.status === 'fulfilled' && docs.value.statuses
                    ? { total: docs.value.count, ...docs.value.statuses }
                    : null,
            });
        };

        const fetchNotifs = async () => {
            try {
                const data = await adminApi.getAllNotifications({ page: 1, page_size: 5 });
                setRecentNotifs(data.results);
            } catch {
                setRecentNotifs([]);
            } finally {
                setNotifsLoading(false);
            }
        };

        fetchAll();
        fetchNotifs();
    }, []);

    const goTo = (path: string) => navigate(`/admin/${adminId}/${path}`);

    const initials = user
        ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '') || user.username[0].toUpperCase()
        : '?';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Overview of PyGrounds platform activity</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiUsers className="w-5 h-5 text-white" />}
                    label="Total Users"
                    value={stats.totalUsers}
                    color="bg-[#7054D0]"
                    onClick={() => goTo('users/view/0')}
                />
                <StatCard
                    icon={<FiBookOpen className="w-5 h-5 text-white" />}
                    label="Total Questions"
                    value={stats.totalQuestions}
                    color="bg-[#3776AB]"
                    onClick={() => goTo('questions/view')}
                />
                <StatCard
                    icon={<FiAlertCircle className="w-5 h-5 text-white" />}
                    label="Pending Review"
                    value={stats.pendingQuestions}
                    color={stats.pendingQuestions ? 'bg-orange-500' : 'bg-green-500'}
                    onClick={() => goTo('questions/view')}
                />
                <StatCard
                    icon={<FiLayers className="w-5 h-5 text-white" />}
                    label="Topics"
                    value={stats.totalTopics}
                    color="bg-teal-500"
                    onClick={() => goTo('topics')}
                />
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <p className="text-sm text-gray-500 mb-3 font-medium">Curriculum Structure</p>
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                <BsDiagram3 className="w-4 h-4 text-[#7054D0]" /> Zones
                            </span>
                            <span className="font-semibold text-gray-800">
                                {stats.totalZones === null ? '—' : stats.totalZones}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                <FiBookOpen className="w-4 h-4 text-[#3776AB]" /> Topics
                            </span>
                            <span className="font-semibold text-gray-800">
                                {stats.totalTopics === null ? '—' : stats.totalTopics}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 flex items-center gap-2">
                                <FiGrid className="w-4 h-4 text-teal-500" /> Subtopics
                            </span>
                            <span className="font-semibold text-gray-800">
                                {stats.totalSubtopics === null ? '—' : stats.totalSubtopics}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:col-span-2">
                    <p className="text-sm text-gray-500 mb-3 font-medium">Document Pipeline</p>
                    {stats.documents === null ? (
                        <div className="space-y-2">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-5 bg-gray-100 animate-pulse rounded w-full" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                                <FiFileText className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-600">Total</span>
                                <span className="ml-auto font-semibold text-gray-800">{stats.documents.total}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiClock className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm text-gray-600">Pending</span>
                                <span className="ml-auto font-semibold text-gray-800">{stats.documents.pending}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiLoader className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-600">Processing</span>
                                <span className="ml-auto font-semibold text-gray-800">{stats.documents.processing}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiCheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-gray-600">Completed</span>
                                <span className="ml-auto font-semibold text-gray-800">{stats.documents.completed}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <FiXCircle className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-gray-600">Failed</span>
                                <span className="ml-auto font-semibold text-gray-800">{stats.documents.failed}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Profile + Recent Notifications */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Admin Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[#7054D0] flex items-center justify-center text-white text-2xl font-bold mb-3">
                        {initials}
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">
                        {user?.first_name || user?.username} {user?.last_name}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">@{user?.username}</p>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1 mb-4">
                        <FiShield className="w-3 h-3" /> Admin
                    </span>
                    <div className="w-full space-y-2 text-sm text-left border-t border-gray-100 pt-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <FiMail className="w-4 h-4 text-gray-400" />
                            <span className="truncate">{user?.email || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <FiUser className="w-4 h-4 text-gray-400" />
                            <span>ID: {user?.id}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
                    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FiBell className="w-4 h-4 text-[#7054D0]" />
                            <span className="font-semibold text-gray-700 text-sm">Recent Notifications</span>
                        </div>
                        <button
                            onClick={() => goTo('notifications')}
                            className="text-xs text-[#7054D0] hover:underline"
                        >
                            View all
                        </button>
                    </div>

                    {notifsLoading ? (
                        <div className="p-5 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-10 bg-gray-100 animate-pulse rounded" />
                            ))}
                        </div>
                    ) : recentNotifs.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-gray-400">
                            <FiBell className="w-8 h-8 mb-2" />
                            <p className="text-sm">No notifications sent yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {recentNotifs.map((n) => {
                                const meta = TYPE_META[n.notification_type];
                                return (
                                    <div key={n.id} className="px-5 py-3 flex items-start gap-3">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 flex-shrink-0 ${meta.color}`}>
                                            {meta.icon}
                                            {n.notification_type}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{n.message}</p>
                                        </div>
                                        <span className="text-xs text-gray-400 flex-shrink-0 whitespace-nowrap">
                                            {formatDate(n.created_at)}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
