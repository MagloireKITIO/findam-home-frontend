// src/components/common/SectionTitle.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SectionTitle = ({ 
  title, 
  subtitle, 
  align = 'center', 
  withLine = true,
  className = '' 
}) => {
  const alignments = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={`mb-8 ${alignments[align]} ${className}`}>
      <motion.h2 
        className="text-3xl font-bold text-gray-900"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {title}
      </motion.h2>
      
      {withLine && (
        <motion.div 
          className={`h-1 bg-primary-500 rounded w-20 mt-2 mb-4 ${
            align === 'center' ? 'mx-auto' : align === 'right' ? 'ml-auto' : ''
          }`}
          initial={{ opacity: 0, width: 0 }}
          whileInView={{ opacity: 1, width: 80 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      )}
      
      {subtitle && (
        <motion.p 
          className="mt-3 text-lg text-gray-600"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};

export default SectionTitle;