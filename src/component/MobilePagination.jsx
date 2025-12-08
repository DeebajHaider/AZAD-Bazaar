import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, Plus, Minus } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * JumpToPageModal (Redesigned with Stepper Controls)
 * HCI/UX Notes:
 * - Augments the text input with large, easy-to-tap '+' and '-' buttons for fine-tuning the page number.
 * - This hybrid approach supports both quick, ergonomic adjustments (tapping) and large jumps (typing), reducing user friction.
 * - The stepper is styled as a single, cohesive unit for a clean, modern appearance.
 * - Buttons are intelligently disabled at boundary conditions (page 1 and max page).
 */
const JumpToPageModal = ({ isOpen, onClose, totalPages, onJump, currentPage }) => {
    const { t } = useI18n();
    const [pageInput, setPageInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 150);
            setPageInput('');
        }
    }, [isOpen]);

    const handleJump = (e) => {
        e.preventDefault();
        const pageNum = parseInt(pageInput, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
            onJump(pageNum);
            onClose();
        }
    };

    const currentPageNumber = parseInt(pageInput, 10);
    const isInputValid = !isNaN(currentPageNumber) && currentPageNumber >= 1 && currentPageNumber <= totalPages;

    const handleIncrement = () => {
        const currentVal = isNaN(currentPageNumber) ? currentPage : currentPageNumber;
        const newVal = Math.min(currentVal + 1, totalPages);
        setPageInput(String(newVal));
    };

    const handleDecrement = () => {
        const currentVal = isNaN(currentPageNumber) ? currentPage : currentPageNumber;
        const newVal = Math.max(currentVal - 1, 1);
        setPageInput(String(newVal));
    };


    const sheetVariants = {
        hidden: { y: "100%" },
        visible: { y: 0, transition: { type: "tween", duration: 0.25, ease: "easeOut" } },
        exit: { y: "100%", transition: { duration: 0.2 } }
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-end justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="jump-to-page-title"
                >
                    <motion.div
                        key="jump-backdrop"
                        variants={backdropVariants}
                        initial="hidden" animate="visible" exit="exit"
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60"
                    />

                    <motion.div
                        key="jump-sheet"
                        variants={sheetVariants}
                        initial="hidden" animate="visible" exit="exit"
                        className="relative bg-md-surface-container-high w-full max-w-[430px] rounded-t-2xl shadow-2xl flex flex-col z-10"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                            <div className="w-12 h-1 rounded-md bg-md-on-surface-variant/40"></div>
                        </div>

                        <header className="flex justify-between items-center gap-2 px-5 pt-2 pb-2">
                            <h2 id="jump-to-page-title" className="text-lg font-bold text-md-on-surface">
                                {t('searchResults.pagination.jumpToPageTitle', 'Jump to Page')}
                            </h2>
                            <button
                                onClick={onClose}
                                aria-label={t('common.close')}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-md-on-surface-variant hover:bg-md-on-surface/10 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </header>
                        
                        <div className="px-5 border-b border-md-outline-variant/30" />

                        <form onSubmit={handleJump} className="p-5 space-y-4 pb-safe">
                            <p className="text-sm text-md-on-surface-variant text-center">
                                {t('searchResults.pagination.jumpToPagePrompt', 'Enter page (1 - {{totalPages}}):').replace('{{totalPages}}', totalPages)}
                            </p>
                            
                            {/* --- NEW STEPPER CONTROL --- */}
                            <div className="flex items-center h-16 rounded-md bg-md-surface-container-highest focus-within:ring-2 focus-within:ring-md-primary transition-all">
                                {/* Decrement Button */}
                                <button
                                    type="button"
                                    onClick={handleDecrement}
                                    disabled={currentPageNumber === 1}
                                    aria-label={t('common.decrement', 'Decrement')}
                                    className="h-full w-16 flex items-center justify-center text-md-on-surface-variant disabled:opacity-30 rounded-l-md hover:bg-md-on-surface/10 transition-colors"
                                >
                                    <Minus size={24} />
                                </button>
                                
                                {/* Numeric Input */}
                                <input
                                    ref={inputRef}
                                    type="number"
                                    inputMode="numeric"
                                    value={pageInput}
                                    onChange={(e) => setPageInput(e.target.value)}
                                    placeholder={String(currentPage)}
                                    className="flex-1 h-full text-center text-2xl font-semibold bg-transparent text-md-on-surface placeholder:text-md-on-surface-variant/50 focus:outline-none"
                                    min="1"
                                    max={totalPages}
                                    aria-label={t('searchResults.pagination.pageInputAriaLabel', 'Page number input')}
                                />
                                
                                {/* Increment Button */}
                                <button
                                    type="button"
                                    onClick={handleIncrement}
                                    disabled={currentPageNumber === totalPages}
                                    aria-label={t('common.increment', 'Increment')}
                                    className="h-full w-16 flex items-center justify-center text-md-on-surface-variant disabled:opacity-30 rounded-r-md hover:bg-md-on-surface/10 transition-colors"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={!isInputValid} 
                                className="w-full h-12 rounded-md bg-md-primary text-md-on-primary font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                            >
                                {t('searchResults.pagination.goButton', 'Go')}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};


// The MobilePagination component does not need to be changed.
const MobilePagination = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useI18n();
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (totalPages <= 1) return null;

    const isFirstPage = currentPage === 1;
    const isLastPage = currentPage === totalPages;

    const pageInfo = t('searchResults.pagination.pageInfo', 'Page {{currentPage}} of {{totalPages}}')
        .replace('{{currentPage}}', currentPage)
        .replace('{{totalPages}}', totalPages);

    return (
        <>
            <nav
                aria-label={t('searchResults.pagination.navAriaLabel', 'Search results pagination')}
                className="flex items-center justify-between gap-3 p-4 mt-2 border-t border-md-outline-variant/30"
            >
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    aria-label={t('searchResults.pagination.previousButtonAriaLabel', 'Go to previous page')}
                    className="h-12 w-12 rounded-md bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                    <ChevronLeft size={24} />
                </button>

                <button
                    onClick={() => setIsModalOpen(true)}
                    aria-label={`${pageInfo}. ${t('searchResults.pagination.jumpToPageAriaLabel', 'Tap to jump to a specific page.')}`}
                    className="flex-1 h-12 px-4 rounded-md border border-md-outline-variant text-md-on-surface bg-md-surface hover:bg-md-surface-container transition-colors"
                >
                    <span className="font-semibold text-sm" aria-live="polite">
                        {pageInfo}
                    </span>
                </button>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage}
                    aria-label={t('searchResults.pagination.nextButtonAriaLabel', 'Go to next page')}
                    className="h-12 w-12 rounded-md bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                    <ChevronRight size={24} />
                </button>
            </nav>

            <JumpToPageModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                totalPages={totalPages}
                currentPage={currentPage}
                onJump={onPageChange}
            />
        </>
    );
};

export default MobilePagination;