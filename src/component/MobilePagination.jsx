import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

/**
 * JumpToPageModal (Redesigned)
 * A more compact and efficient modal for page navigation.
 * - Smaller footprint on the screen.
 * - Quick-jump buttons for "First" and "Last" pages.
 * - Clear visual hierarchy.
 */
const JumpToPageModal = ({ isOpen, onClose, totalPages, onJump, currentPage }) => {
    const { t } = useI18n();
    const [pageInput, setPageInput] = useState('');
    const inputRef = useRef(null);

    // Focus the input field when the modal opens.
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setPageInput(''); // Reset input on open
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

    const handleQuickJump = (pageNum) => {
        onJump(pageNum);
        onClose();
    };

    const isInputValid = !isNaN(parseInt(pageInput, 10)) && parseInt(pageInput, 10) >= 1 && parseInt(pageInput, 10) <= totalPages;

    if (!isOpen) return null;

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex justify-center items-center bg-black/60 p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="jump-to-page-title"
        >
            {/* Modal Content - Made more compact with max-w-xs */}
            <div
                className="secBg rounded-2xl p-4 space-y-2 w-full max-w-xs shadow-lg"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center gap-2"> {/* Added gap-2 for spacing */}
                    {/* The title now grows but also truncates if too long */}
                    <h2 id="jump-to-page-title" className="text-base font-semibold primText flex-1 truncate">
                        {t('searchResults.pagination.jumpToPageTitle', 'Jump to Page')}
                    </h2>

                    {/* The button is now told not to shrink */}
                    <button
                        onClick={onClose}
                        aria-label={t('common.close')}
                        className="btnSecondary rounded-lg !p-0 h-8 w-8 flex items-center justify-center flex-shrink-0"
                    >
                        <X size={18} />
                    </button>
                </header>

                <div className="border-t dividerBorder" />

                <form onSubmit={handleJump}>
                    <p className="text-sm secText mb-2 text-center">
                        {t('searchResults.pagination.jumpToPagePrompt', 'Enter page (1 - {{totalPages}}):').replace('{{totalPages}}', totalPages)}
                    </p>
                    <input
                        ref={inputRef}
                        type="number"
                        inputMode="numeric"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        placeholder={t('searchResults.pagination.currentPagePlaceholder', `Current: ${currentPage}`).replace('{{currentPage}}', currentPage)}
                        className="inputField w-full text-center text-lg h-12"
                        min="1"
                        max={totalPages}
                        aria-label={t('searchResults.pagination.pageInputAriaLabel', 'Page number input')}
                    />
                    <button type="submit" disabled={!isInputValid} className="w-full min-h-12 btnPrimary rounded-lg mt-3 disabled:opacity-50 disabled:cursor-not-allowed">
                        {t('searchResults.pagination.goButton', 'Go')}
                    </button>
                </form>
            </div>
        </div>
    );
};


/**
 * MobilePagination Component (Redesigned with improved hierarchy)
 * - The central area now displays page status as non-interactive text.
 * - A small, clear "Jump to..." link below it triggers the modal.
 * - This improves clarity and prevents accidental taps.
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
                className="flex items-center justify-between gap-3 p-4 mt-4 dividerBorder"
            >
                {/* Previous Page Button */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={isFirstPage}
                    aria-label={t('searchResults.pagination.previousButtonAriaLabel', 'Go to previous page')}
                    className="btnSecondary min-h-12 min-w-12 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focusRing"
                >
                    <ChevronLeft size={22} />
                </button>

                {/* Page Status & Jump Trigger */}
                <div className="flex-1 text-center flex flex-col items-center justify-center min-h-12">
                    <p className="font-semibold primText text-sm" aria-live="polite">
                        {pageInfo}
                    </p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-xs accentPrimText underline-offset-2 hover:underline focusRing rounded-sm px-1"
                        aria-label={t('searchResults.pagination.jumpToPageAriaLabel', 'Tap to jump to a specific page.')}
                    >
                        {t('searchResults.pagination.jumpToLink', 'Jump to...')}
                    </button>
                </div>

                {/* Next Page Button */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLastPage}
                    aria-label={t('searchResults.pagination.nextButtonAriaLabel', 'Go to next page')}
                    className="btnSecondary min-h-12 min-w-12 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focusRing"
                >
                    <ChevronRight size={22} />
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