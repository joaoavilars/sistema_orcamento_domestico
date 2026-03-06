import React from 'react';

/**
 * Componente base de Input
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.id
 * @param {string} [props.error]
 * @param {string} [props.className]
 */
export const Input = React.forwardRef(({ label, id, error, className = '', ...props }, ref) => {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <input
                id={id}
                ref={ref}
                className={`block w-full border rounded-md p-2 text-sm transition-colors focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-200 ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';
