import React from 'react';
import { Pagination } from '.';

interface AdminTableProps<T> {
    title: string;
    loading: boolean;
    error?: string;
    items: T[];
    total?: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onAdd: () => void;
    renderRow: (item: T) => React.ReactNode;
    headerColumns: string[];
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
    headerColumns
}: AdminTableProps<T>) => {
    const ITEMS_PER_PAGE = 10;
    const paginatedItems = items?.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE) || [];

    return (
        <div className="p-6 w-full mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                <button
                    onClick={onAdd}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                    Add New {title.replace(' Management', '')}
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="w-full text-center py-4">Loading...</div>
            ) : (
                <>
                    <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                        <table className="min-w-full table-auto divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {headerColumns.map((column, index) => {
                                        // Base styling for all headers
                                        let columnClass = "px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ";
                                        let widthClass = "";
                                        let lastColumn = index === headerColumns.length - 1;
                                        
                                        // Column-specific width classes
                                        if (column.toLowerCase() === 'id') {
                                            widthClass = "w-20"; // 80px fixed width
                                        } else if (column.toLowerCase() === 'name') {
                                            widthClass = "w-44"; // 176px fixed width
                                        } else if (column.toLowerCase() === 'description') {
                                            widthClass = ""; // Flex grow
                                        } else if (column.toLowerCase() === 'order') {
                                            widthClass = "w-20"; // 80px fixed width
                                        } else if (column.toLowerCase() === 'actions') {
                                            widthClass = "w-24"; // 96px fixed width
                                            columnClass += "text-center"; // Center align actions header
                                        } else {
                                            widthClass = "w-32"; // 128px default width
                                        }

                                        return (
                                            <th
                                                key={index}
                                                className={`${columnClass} ${widthClass}`}
                                            >
                                                <div className={`truncate ${lastColumn ? "text-center" : ""}`}>
                                                    {column}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedItems.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={headerColumns.length}
                                            className="px-6 py-4 text-center text-gray-500"
                                        >
                                            No items found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedItems.map(renderRow)
                                )}
                            </tbody>
                        </table>
                    </div>
                    {(total || items.length) > ITEMS_PER_PAGE && (
                        <div className="mt-4">
                            <Pagination
                                currentPage={currentPage}
                                totalItems={total || items.length}
                                itemsPerPage={ITEMS_PER_PAGE}
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
