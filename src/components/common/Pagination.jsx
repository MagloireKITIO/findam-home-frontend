// src/components/common/Pagination.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  // Generate page numbers to display
  const generatePagination = () => {
    // Always show first page, last page, current page, and siblings
    const pageNumbers = [];
    
    // Calculate range of pages to show
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);
    
    // Do we need to show dots on left side?
    const showLeftDots = leftSiblingIndex > 2;
    // Do we need to show dots on right side?
    const showRightDots = rightSiblingIndex < totalPages - 1;
    
    // Add first page
    if (totalPages > 1) {
      pageNumbers.push(1);
    }
    
    // Add left dots if needed
    if (showLeftDots) {
      pageNumbers.push('...');
    }
    
    // Add pages in range [leftSiblingIndex, rightSiblingIndex]
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) { // Don't duplicate first and last page
        pageNumbers.push(i);
      }
    }
    
    // Add right dots if needed
    if (showRightDots) {
      pageNumbers.push('...');
    }
    
    // Add last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pagination = generatePagination();

  if (totalPages <= 1) return null;

  return (
    <nav className="flex justify-center mt-8">
      <ul className="flex items-center space-x-2">
        {/* Previous Page Button */}
        <li>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg
              ${currentPage === 1
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'}
            `}
          >
            <FiChevronLeft size={20} />
          </motion.button>
        </li>

        {/* Page Numbers */}
        {pagination.map((page, index) => (
          <li key={index}>
            {page === '...' ? (
              <span className="flex items-center justify-center w-10 h-10 text-gray-500">
                ...
              </span>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPageChange(page)}
                className={`
                  flex items-center justify-center w-10 h-10 rounded-lg font-medium
                  ${currentPage === page
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'}
                `}
              >
                {page}
              </motion.button>
            )}
          </li>
        ))}

        {/* Next Page Button */}
        <li>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg
              ${currentPage === totalPages
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 hover:bg-gray-100'}
            `}
          >
            <FiChevronRight size={20} />
          </motion.button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;