import React from 'react';
import { Button } from './Button';

/**
 * Componente base de Modal
 * @param {Object} props
 * @param {string} props.title
 * @param {boolean} props.isOpen
 * @param {function} props.onClose
 * @param {React.ReactNode} props.children
 * @param {React.ReactNode} [props.footer]
 * @param {string} [props.maxWidth='max-w-md']
 */
export const ModalWrapper = ({ title, isOpen, onClose, children, footer, maxWidth = 'max-w-md' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity animate-fade-in">
            <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col overflow-hidden`}>

                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 shrink-0">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none transition-colors"
                        aria-label="Fechar modal"
                    >
                        &times;
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="p-4 border-t dark:border-gray-700 flex justify-end gap-3 shrink-0 bg-gray-50 dark:bg-gray-800/50">
                        {footer}
                    </div>
                )}

            </div>
        </div>
    );
};
