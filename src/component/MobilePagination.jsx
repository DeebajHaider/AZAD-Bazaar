import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

/**
 * JumpToPageModal (Redesigned)
 * MD3: Uses Surface Container High for dialogs.
 */
const JumpToPageModal = ({ isOpen, onClose, totalPages, onJump, currentPage }) => {
    const { t } = useI18n();
    const [pageInput, setPageInput] = useState('');
    const inputRef = useRef(null);

    // Focus the input field when the modal opens.
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
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

    const isInputValid = !isNaN(parseInt(pageInput, 10)) && parseInt(pageInput, 10) >= 1 && parseInt(pageInput, 10) <= totalPages;

    if (!isOpen) return null;

    return (
        // Backdrop: Scrim
        <div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="jump-to-page-title"
        >
            {/* Modal Content: Surface Container High */}
            <div
                className="bg-md-surface-container-high rounded-2xl p-5 space-y-4 w-full max-w-xs shadow-xl animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center gap-2">
                    <h2 id="jump-to-page-title" className="text-lg font-bold text-md-on-surface flex-1 truncate">
                        {t('searchResults.pagination.jumpToPageTitle', 'Jump to Page')}
                    </h2>

                    {/* Close Button: Subtle Ghost Button */}
                    <button
                        onClick={onClose}
                        aria-label={t('common.close')}
                        className="w-8 h-8 rounded-md flex items-center justify-center text-md-on-surface-variant hover:bg-md-on-surface/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </header>

                <div className="border-t border-md-outline-variant/50" />

                <form onSubmit={handleJump} className="space-y-4">
                    <p className="text-sm text-md-on-surface-variant text-center">
                        {t('searchResults.pagination.jumpToPagePrompt', 'Enter page (1 - {{totalPages}}):').replace('{{totalPages}}', totalPages)}
                    </p>
                    
                    {/* Input: Filled Style (Surface Container Highest) */}
                    <input
                        ref={inputRef}
                        type="number"
                        inputMode="numeric"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        placeholder={t('searchResults.pagination.currentPagePlaceholder', `Current: ${currentPage}`).replace('{{currentPage}}', currentPage)}
                        className="w-full h-14 text-center text-xl rounded-md bg-md-surface-container-highest text-md-on-surface placeholder:text-md-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-md-primary transition-all"
                        min="1"
                        max={totalPages}
                        aria-label={t('searchResults.pagination.pageInputAriaLabel', 'Page number input')}
                    />
                    
                    {/* Action: Primary Button */}
                    <button 
                        type="submit" 
                        disabled={!isInputValid} 
                        className="w-full h-12 rounded-md bg-md-primary text-md-on-primary font-bold shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed transition-all"
                    >
                        {t('searchResults.pagination.goButton', 'Go')}
                    </button>
                </form>
            </div>
        </div>
    );
};


/**
 * MobilePagination Component
 * MD3: Uses Tonal Buttons (Secondary Container) for navigation actions.
 */
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
                {/* Previous Page: Tonal Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    aria-label={t('searchResults.pagination.previousButtonAriaLabel', 'Go to previous page')}
                    className="min-h-[48px] min-w-[48px] rounded-md bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
                >
                    <ChevronLeft size={24} />
                </button>

                {/* Page Status & Jump Trigger */}
                <div className="flex-1 text-center flex flex-col items-center justify-center min-h-[48px]">
                    <p className="font-semibold text-md-on-surface text-sm" aria-live="polite">
                        {pageInfo}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-xs text-md-primary font-medium mt-0.5 py-1 px-2 rounded-md hover:bg-md-primary/10 transition-colors"
                        aria-label={t('searchResults.pagination.jumpToPageAriaLabel', 'Tap to jump to a specific page.')}
                    >
                        {t('searchResults.pagination.jumpToLink', 'Jump to...')}
                    </button>
                </div>

                {/* Next Page: Tonal Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage}
                    aria-label={t('searchResults.pagination.nextButtonAriaLabel', 'Go to next page')}
                    className="min-h-[48px] min-w-[48px] rounded-md bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-transform"
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