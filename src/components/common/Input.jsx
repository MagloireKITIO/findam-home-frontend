// src/components/common/Input.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

const Input = ({
  type = 'text',
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error = null,
  icon = null,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            {icon}
          </div>
        )}

        <motion.input
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          initial={{ borderColor: 'rgb(209 213 219)' }}
          animate={{ 
            borderColor: error 
              ? 'rgb(239 68 68)' 
              : isFocused 
                ? 'rgb(20 184 166)' 
                : 'rgb(209 213 219)' 
          }}
          className={`
            w-full px-3 py-2 
            ${icon ? 'pl-10' : ''} 
            ${isPassword ? 'pr-10' : ''}
            border rounded-lg shadow-sm focus:outline-none 
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'focus:ring-primary-500 focus:border-primary-500'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          required={required}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
          >
            {showPassword ? (
              <FiEyeOff className="text-gray-500" />
            ) : (
              <FiEye className="text-gray-500" />
            )}
          </button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 flex items-center text-sm text-red-600"
        >
          <FiAlertCircle className="mr-1" />
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default Input;