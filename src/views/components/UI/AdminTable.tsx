import React from 'react';
import { Pagination } from '.';
import { ADMIN_BUTTON_STYLES } from '../Layout';

interface AdminTableProps<T> {
    title: string;
    loading: boolean;
    error?: string;
    items: T[];
    total?: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onAdd?: () => void;
    renderRow: (item: T) => React.ReactNode;
    headerColumns: string[];
    itemsPerPage?: number; // Make this configurable
}

const AdminTable = <T extends { id: number }>({
    title,
    loading,
    error,
    items = [],
    total,
    currentPage,
    onPageChange,
    onAdd,
    renderRow,
    headerColumns,
    itemsPerPage = 10 // Default to 10 items per page
}: AdminTableProps<T>) => {
    // Don't do local pagination if total is provided (indicates server-side pagination)
    const displayItems = total ? items : items?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage) || [];
    const totalItems = total || items.length;

    return (
        <div className="w-full mx-auto relative content-table-container">
            {onAdd && (
                <div className="flex justify-end items-center mb-4 sm:absolute sm:-top-12 sm:right-0 z-10 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                        onClick={onAdd}
                        className={ADMIN_BUTTON_STYLES.PRIMARY}
                    >
                        Add New {title.replace(' Management', '')}
                    </button>
                </div>
            )}

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="w-full text-center py-4">Loading...</div>
            ) : (
                <>
                    <div className="w-full overflow-x-auto rounded-lg border border-gray-200 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <table className="min-w-full table-auto divide-y divide-gray-200">
                            <thead className="bg-[#6B4ECA]">
                                <tr>
                                    {headerColumns.map((column, index) => {
                                        // Base styling for headers
                                        let columnClass = "px-3 py-3 text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap ";
                                        let widthClass = "";
                                        
                                        // Center align specific column types
                                        const centerAlignColumns = ['id', 'type', 'difficulty', 'status', 'actions', 'order', 'role'];
                                        const shouldCenter = centerAlignColumns.some(col => column.toLowerCase().includes(col));
                                        
                                        if (shouldCenter) {
                                            columnClass += "text-center ";
                                        }
                                        
                                        // Column-specific width classes
                                        if (column.toLowerCase() === 'id') {
                                            widthClass = "w-16"; // Smaller ID column
                                        } else if (column.toLowerCase() === 'question') {
                                            widthClass = "min-w-[300px] max-w-[400px]"; // Question text needs more space
                                        } else if (column.toLowerCase() === 'zone' || column.toLowerCase() === 'topic' || column.toLowerCase() === 'subtopic') {
                                            widthClass = "min-w-[120px] max-w-[150px]"; // Topic-related columns
                                        } else if (column.toLowerCase() === 'topics') {
                                            widthClass = "min-w-[150px] max-w-[200px]"; // Pre-assessment topics
                                        } else if (column.toLowerCase() === 'type' || column.toLowerCase() === 'difficulty') {
                                            widthClass = "min-w-[100px]"; // Status badges
                                        } else if (column.toLowerCase() === 'status') {
                                            widthClass = "min-w-[120px]"; // Status with icon
                                        } else if (column.toLowerCase() === 'order') {
                                            widthClass = "w-16"; // Small order column
                                        } else if (column.toLowerCase() === 'actions') {
                                            widthClass = "w-20"; // Actions column
                                        } else if (column.toLowerCase() === 'user') {
                                            widthClass = "min-w-[150px]"; // User column
                                        } else if (column.toLowerCase() === 'email') {
                                            widthClass = "min-w-[200px]"; // Email column
                                        } else if (column.toLowerCase() === 'name' || column.toLowerCase() === 'description') {
                                            widthClass = "min-w-[150px]"; // Name/Description columns
                                        } else if (column.toLowerCase() === 'joined' || column.toLowerCase() === 'role') {
                                            widthClass = "min-w-[100px]"; // Date/Role columns
                                        } else {
                                            widthClass = "min-w-[100px]"; // Default minimum width
                                        }

                                        return (
                                            <th
                                                key={index}
                                                className={`${columnClass} ${widthClass}`}
                                            >
                                                <div className="truncate">
                                                    {column}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {displayItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={headerColumns.length}
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No items found
                                        </td>
                                    </tr>
                                ) : (
                                    displayItems.map(renderRow)
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {totalItems > itemsPerPage && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={totalItems}
                                itemsPerPage={itemsPerPage}
                                onPageChange={onPageChange}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AdminTable;
