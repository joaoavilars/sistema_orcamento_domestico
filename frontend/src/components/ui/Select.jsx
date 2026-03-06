import React from 'react';

/**
 * Componente base de Select
 * @param {Object} props
 * @param {string} props.label
 * @param {string} props.id
 * @param {Array<{value: string|number, label: string}>} props.options
 * @param {string} [props.error]
 * @param {string} [props.placeholder]
 * @param {string} [props.className]
 */
export const Select = React.forwardRef(({ label, id, options, error, placeholder = 'Selecione...', className = '', ...props }, ref) => {
    return (
        <div className={className}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <select
                id={id}
                ref={ref}
                className={`block w-full border rounded-md p-2 text-sm transition-colors focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 dark:text-gray-200 ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                {...props}
            >
                <option value="" disabled>{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
});

Select.displayName = 'Select';
