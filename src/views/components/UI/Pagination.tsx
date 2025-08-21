import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalItems, itemsPerPage, onPageChange }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return null;

    // Validate and clamp current page
    const validCurrentPage = Math.max(1, Math.min(currentPage, totalPages));

    // Generate smart page numbers with ellipsis
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 7; // Show max 7 page buttons
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);
            
            if (validCurrentPage <= 4) {
                // Show pages 1, 2, 3, 4, 5, ..., last
                for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (validCurrentPage >= totalPages - 3) {
                // Show pages 1, ..., last-4, last-3, last-2, last-1, last
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show pages 1, ..., current-1, current, current+1, ..., last
                pages.push('...');
                for (let i = validCurrentPage - 1; i <= validCurrentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
    };

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== validCurrentPage) {
            onPageChange(page);
        }
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex justify-center items-center space-x-2 mt-4">
            <button
                onClick={() => handlePageChange(validCurrentPage - 1)}
                disabled={validCurrentPage === 1}
                className={`px-3 py-1 rounded ${
                    validCurrentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
                Previous
            </button>
            
            {pageNumbers.map((page, index) => {
                if (page === '...') {
                    return (
                        <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-1 text-gray-500"
                        >
                            ...
                        </span>
                    );
                }
                
                const pageNumber = page as number;
                return (
                    <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-1 rounded ${
                            validCurrentPage === pageNumber
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                    >
                        {pageNumber}
                    </button>
                );
            })}
            
            <button
                onClick={() => handlePageChange(validCurrentPage + 1)}
                disabled={validCurrentPage === totalPages}
                className={`px-3 py-1 rounded ${
                    validCurrentPage === totalPages
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;
