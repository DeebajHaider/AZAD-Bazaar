import React, { useState, useCallback } from 'react'
import { Plus, CreditCard, Smartphone, Edit2, Trash2, X, Loader2, Check, Star, Wallet, Link as LinkIcon, AlertCircle, Mic } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useCreditCards, useMobileWallets } from '../context/PaymentDataContext' 
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import { showToast } from '../utils/toast'
import ImageWithLoader from '../component/ImageWithLoader'
import { useAccessibility } from '../context/AccessibilityContext'
import VoiceInputModal from '../component/VoiceInputModal'

// --- Language Strings ---
const languageStrings = {
    en: {
        title: 'Manage Payments',
        add: 'Add New',
        creditDebitCards: 'Credit & Debit Cards',
        mobileWallets: 'Mobile Wallets',
        noCards: 'No cards saved yet',
        addFirstCard: 'Add Card',
        linkWallet: 'Link Account',
        tapToConnect: 'Tap to connect',
        default: 'Default',
        expires: 'Exp',
        edit: 'Edit',
        delete: 'Remove',
        confirmDelete: 'Unlink this payment method?',
        deleteSuccess: 'Removed successfully.',
        deleteError: 'Failed to remove.',
        addCardTitle: 'Add New Card',
        addWalletTitle: 'Link Wallet',
        editWalletTitle: 'Update Wallet',
        cardNumber: 'Card Number',
        cardNumberPlaceholder: '0000 0000 0000 0000',
        cardBrand: 'Card Brand',
        expiryDate: 'Expiry Date',
        setAsDefault: 'Use as default',
        walletProvider: 'Wallet Provider',
        mobileNumber: 'Mobile Number',
        cancel: 'Cancel',
        save: 'Save Details',
        saving: 'Processing...',
        saveSuccess: 'Saved successfully.',
        saveError: 'Could not save details.',
        brandPlaceholder: 'e.g. Visa',
        last4Digits: 'Last 4 digits'
    },
    ur: {
        title: 'ادائیگیوں کا نظم کریں',
        add: 'نیا شامل کریں',
        creditDebitCards: 'کریڈٹ اور ڈیبٹ کارڈز',
        mobileWallets: 'موبائل والیٹس',
        noCards: 'کوئی کارڈ محفوظ نہیں',
        addFirstCard: 'کارڈ شامل کریں',
        linkWallet: 'اکاؤنٹ لنک کریں',
        tapToConnect: 'کنیکٹ کرنے کے لیے کلک کریں',
        default: 'ڈیفالٹ',
        expires: 'میعاد',
        edit: 'ترمیم',
        delete: 'ہٹائیں',
        confirmDelete: 'کیا آپ واقعی اس طریقہ کو ختم کرنا چاہتے ہیں؟',
        deleteSuccess: 'کامیابی سے ہٹا دیا گیا۔',
        deleteError: 'ہٹانے میں ناکام۔',
        addCardTitle: 'نیا کارڈ شامل کریں',
        addWalletTitle: 'والیٹ لنک کریں',
        editWalletTitle: 'والیٹ اپ ڈیٹ کریں',
        cardNumber: 'کارڈ نمبر',
        cardNumberPlaceholder: '0000 0000 0000 0000',
        cardBrand: 'کارڈ برانڈ',
        expiryDate: 'میعاد کی تاریخ',
        setAsDefault: 'بطور ڈیفالٹ استعمال کریں',
        walletProvider: 'فراہم کنندہ',
        mobileNumber: 'موبائل نمبر',
        cancel: 'منسوخ',
        save: 'محفوظ کریں',
        saving: 'محفوظ ہو رہا ہے...',
        saveSuccess: 'محفوظ ہو گیا۔',
        saveError: 'محفوظ نہیں ہو سکا۔',
        brandPlaceholder: 'مثلاً ویزا',
        last4Digits: 'آخری 4 ہندسے'
    }
};

// --- Custom Components ---

const CustomCheckbox = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-3 cursor-pointer group select-none">
        <div className={`
            relative w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center
            ${checked 
                ? 'bg-md-primary border-md-primary' 
                : 'bg-transparent border-md-outline hover:border-md-primary'}
        `}>
            {checked && <Check size={12} className="text-md-on-primary" strokeWidth={3} />}
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        </div>
        <span className="text-sm text-md-on-surface">{label}</span>
    </label>
);

// Improved Visual Card with Subtle Gradient
const CreditCardItem = ({ card, onDelete, t }) => (
    <div className="relative w-full aspect-[1.586/1] max-h-[190px] rounded-xl overflow-hidden border border-md-outline-variant group bg-gradient-to-br from-md-surface-container-high to-md-surface-container">
        <div className="relative h-full p-4 flex flex-col justify-between z-10">
            {/* Top */}
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-md-on-surface-variant opacity-70">{t('cardBrand')}</span>
                    <div className="font-bold text-lg text-md-on-surface capitalize leading-tight">{card.brand}</div>
                </div>
                {card.isDefault && (
                    <div className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase">{t('default')}</span>
                    </div>
                )}
            </div>

            {/* Middle */}
            <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 text-md-on-surface-variant text-sm tracking-widest opacity-60">
                    <span>••••</span><span>••••</span><span>••••</span>
                </div>
                <span className="font-mono text-xl font-bold text-md-on-surface tracking-widest">{card.last4Digits}</span>
            </div>

            {/* Bottom */}
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-[10px] uppercase text-md-on-surface-variant block mb-0.5 opacity-70">{t('expires')}</span>
                    <span className="font-medium text-md-on-surface text-sm">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</span>
                </div>
                <button 
                    onClick={() => onDelete(card._id)} 
                    aria-label={t('delete')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-md-error-container hover:text-md-on-error-container text-md-error transition-colors focus:outline-none focus:ring-2 focus:ring-md-error"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    </div>
);

// Helper to get correct logo extension for each provider
function getWalletLogoSrc(provider) {
    const lower = provider.toLowerCase();
    if (lower === 'easypaisa') return '/easypaisa.png';
    if (lower === 'jazzcash') return '/jazzcash.svg';
    return `/${lower}.svg`;
}

// Wallet Row: Handles both Linked and Unlinked states
const WalletRow = ({ provider, wallet, onAction, onDelete, t }) => {
    const isLinked = !!wallet;

    return (
        <div 
            onClick={!isLinked ? onAction : undefined}
            className={`
                w-full p-3 rounded-xl flex items-center gap-4 transition-all duration-200 relative
                ${isLinked 
                    ? 'bg-md-surface-container border border-transparent' 
                    : 'bg-transparent border border-md-outline-variant hover:border-md-primary hover:bg-md-surface-container-high cursor-pointer group'}
            `}
        >
            {/* Logo Section */}
            <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center p-1.5 flex-shrink-0
                bg-white border border-gray-200
                ${!isLinked ? 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all' : ''}
            `}>
                <ImageWithLoader 
                    src={getWalletLogoSrc(provider)} 
                    alt={provider}
                    imageClassName="w-full h-full object-contain"
                    // Fallback icon if logo fails
                    fallback={<Smartphone className="w-6 h-6 text-gray-500" />} 
                />
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm ${isLinked ? 'text-md-on-surface' : 'text-md-on-surface-variant group-hover:text-md-on-surface'}`}>
                    {provider}
                </h3>
                {isLinked ? (
                    <p className="text-xs text-md-on-surface-variant truncate font-mono mt-0.5">{wallet.mobileNumber}</p>
                ) : (
                    <p className="text-xs text-md-primary font-medium mt-0.5 flex items-center gap-1">
                        <Plus size={12} strokeWidth={3} /> {t('linkWallet')}
                    </p>
                )}
            </div>

            {/* Actions */}
            {isLinked ? (
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => onAction(wallet)}
                        className="p-2 rounded-lg hover:bg-md-secondary-container hover:text-md-on-secondary-container text-md-on-surface-variant transition-colors"
                        aria-label={t('edit')}
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => onDelete(wallet.provider)}
                        className="p-2 rounded-lg hover:bg-md-error-container hover:text-md-on-error-container text-md-error transition-colors"
                        aria-label={t('delete')}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ) : (
                <div className="pr-2">
                     <div className="w-8 h-8 rounded-full bg-md-surface-container-highest flex items-center justify-center text-md-on-surface-variant group-hover:bg-md-primary-container group-hover:text-md-on-primary-container transition-colors">
                        <LinkIcon size={16} />
                     </div>
                </div>
            )}
        </div>
    );
};

// --- Main Page Component ---
export default function ManagePayments() {
    const { lang } = useI18n();
    const t = (key) => languageStrings[lang][key] || languageStrings.en[key];

    const { creditCards, loading: cardsLoading, addCreditCard, deleteCreditCard } = useCreditCards();
    const { mobileWallets, loading: walletsLoading, addMobileWallet, updateMobileWallet, deleteMobileWallet } = useMobileWallets();

    const [modal, setModal] = useState({ type: null, data: null }); 
    const [isSaving, setIsSaving] = useState(false);

    // Hardcoded providers specific to Pakistan context
    const walletProviders = ['Easypaisa', 'Jazzcash'];

    const handleOpenModal = (type, data = null) => {
        setModal({ type, data });
    };

    const handleCloseModal = () => {
        if (isSaving) return;
        setModal({ type: null, data: null });
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try {
            if (type === 'card') await deleteCreditCard(id);
            else if (type === 'wallet') await deleteMobileWallet(id);
            showToast('success', t('deleteSuccess'));
        } catch (error) {
            showToast('error', t('deleteError'));
        }
    };

    return (
        <Layout header={<HeaderWithName title={t('title')} />}>
            <main className="bg-md-surface flex-1 overflow-y-auto min-h-full pb-safe">
                <div className="max-w-[430px] mx-auto p-4">
                    
                    {/* --- 1. Mobile Wallets (Priority Section) --- */}
                    <section aria-labelledby="wallets-heading" className="space-y-4">
                        <h2 id="wallets-heading" className="text-lg font-bold text-md-on-surface flex items-center gap-2">
                            <Wallet size={20} className="text-md-primary" />
                            {t('mobileWallets')}
                        </h2>

                        {walletsLoading ? (
                            <div className="space-y-3">
                                <div className="h-16 bg-md-surface-container-highest rounded-xl animate-pulse" />
                                <div className="h-16 bg-md-surface-container-highest rounded-xl animate-pulse" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {walletProviders.map(provider => {
                                    const linkedWallet = mobileWallets?.find(w => w.provider === provider);
                                    return (
                                        <WalletRow 
                                            key={provider}
                                            provider={provider}
                                            wallet={linkedWallet}
                                            onAction={() => handleOpenModal('wallet', linkedWallet || { provider })}
                                            onDelete={(id) => handleDelete('wallet', id)}
                                            t={t}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    {/* --- Divider --- */}
                    <div className="my-8 border-t border-md-outline-variant/30" />

                    {/* --- 2. Credit Cards --- */}
                    <section aria-labelledby="cards-heading" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 id="cards-heading" className="text-lg font-bold text-md-on-surface flex items-center gap-2">
                                <CreditCard size={20} className="text-md-primary" />
                                {t('creditDebitCards')}
                            </h2>
                        </div>

                        {cardsLoading ? (
                            <div className="space-y-4">
                                <div className="h-44 bg-md-surface-container-highest rounded-xl animate-pulse" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {creditCards && creditCards.length > 0 ? (
                                    creditCards.map(card => (
                                        <CreditCardItem 
                                            key={card._id} 
                                            card={card} 
                                            onDelete={(id) => handleDelete('card', id)}
                                            t={t}
                                        />
                                    ))
                                ) : (
                                    <div className="bg-md-surface-container border border-dashed border-md-outline-variant rounded-xl p-6 flex flex-col items-center text-center">
                                        <CreditCard className="w-10 h-10 text-md-on-surface-variant opacity-30 mb-2" />
                                        <p className="text-xs text-md-on-surface-variant">{t('noCards')}</p>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => handleOpenModal('card')}
                                    className="w-full py-3.5 border border-dashed border-md-outline rounded-xl flex items-center justify-center gap-2 text-sm font-semibold text-md-on-surface-variant hover:bg-md-surface-container-high hover:text-md-primary transition-all"
                                >
                                    <Plus size={18} />
                                    {t('addFirstCard')}
                                </button>
                            </div>
                        )}
                    </section>

                </div>
            </main>

            {/* --- Modals --- */}
            {modal.type === 'card' && (
                <CreditCardModal
                    onClose={handleCloseModal}
                    onSave={addCreditCard}
                    isSaving={isSaving}
                    setIsSaving={setIsSaving}
                    t={t}
                />
            )}
             {modal.type === 'wallet' && (
                <MobileWalletModal
                    onClose={handleCloseModal}
                    onSave={modal.data && modal.data.mobileNumber ? updateMobileWallet : addMobileWallet}
                    isSaving={isSaving}
                    setIsSaving={setIsSaving}
                    t={t}
                    walletData={modal.data}
                />
            )}
        </Layout>
    );
}

// --- Modal Sub-Components ---
const inputClass = "w-full h-12 rounded-md bg-md-surface-container-highest px-4 text-md-on-surface placeholder:text-md-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-md-primary transition-all";

function CreditCardModal({ onClose, onSave, isSaving, setIsSaving, t }) {
    const { ascMode } = useAccessibility()
    const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')
    const [voiceModalOpen, setVoiceModalOpen] = useState(false)
    const [voiceTarget, setVoiceTarget] = useState(null)
    const [formData, setFormData] = useState({
        last4Digits: '',
        brand: '',
        expiryMonth: '',
        expiryYear: '',
        isDefault: false
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'last4Digits' && value.length > 4) return;
        if (name === 'expiryMonth' && value.length > 2) return;
        if (name === 'expiryYear' && value.length > 4) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleVoiceConfirm = useCallback((transcript) => {
        if (!voiceTarget) return;
        setFormData(prev => ({ ...prev, [voiceTarget]: transcript }))
        setVoiceModalOpen(false)
        setVoiceTarget(null)
    }, [voiceTarget])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            showToast('success', t('saveSuccess'));
            onClose();
        } catch (error) {
            showToast('error', error.message || t('saveError'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
            <div 
                className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-md-surface-container-high rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="border-b border-md-outline-variant/30 p-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-md-on-surface">{t('addCardTitle')}</h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-md-surface-container-highest text-md-on-surface-variant hover:bg-md-on-surface/10 transition-colors" disabled={isSaving}>
                        <X size={20} />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
                    <fieldset disabled={isSaving} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('cardBrand')}</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant" size={18} />
                                <input type="text" name="brand" value={formData.brand} onChange={handleChange} required placeholder={t('brandPlaceholder')} className={`${inputClass} pl-10 pr-12`} />
                                {isVoiceInput && (
                                    <button
                                    type="button"
                                    onClick={() => { setVoiceTarget('brand'); setVoiceModalOpen(true); }}
                                    className="absolute top-1.5 right-2 z-10 w-9 h-9 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-90 transition-colors"
                                    >
                                    <Mic size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('cardNumber')}</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    name="last4Digits"
                                    value={formData.last4Digits}
                                    onChange={(e) => handleChange({target: {name: 'last4Digits', value: e.target.value.replace(/\D/g, '')}})}
                                    required
                                    className={`${inputClass} font-mono tracking-widest pr-12`}
                                    placeholder={t('last4Digits')}
                                />
                                {isVoiceInput && (
                                    <button
                                    type="button"
                                    onClick={() => { setVoiceTarget('last4Digits'); setVoiceModalOpen(true); }}
                                    className="absolute top-1.5 right-2 z-10 w-9 h-9 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-90 transition-colors"
                                    >
                                    <Mic size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('expiryDate')}</label>
                            <div className="flex gap-4">
                                <input type="text" inputMode="numeric" name="expiryMonth" value={formData.expiryMonth} onChange={(e) => handleChange({target: {name: 'expiryMonth', value: e.target.value.replace(/\D/g, '')}})} required className={`${inputClass} text-center`} placeholder="MM" />
                                <span className="self-center text-xl text-md-on-surface-variant">/</span>
                                <input type="text" inputMode="numeric" name="expiryYear" value={formData.expiryYear} onChange={(e) => handleChange({target: {name: 'expiryYear', value: e.target.value.replace(/\D/g, '')}})} required className={`${inputClass} text-center`} placeholder="YYYY" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <CustomCheckbox checked={formData.isDefault} onChange={(e) => setFormData(prev => ({...prev, isDefault: e.target.checked}))} label={t('setAsDefault')} />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-md bg-md-secondary-container text-md-on-secondary-container font-medium hover:opacity-90 transition-opacity">{t('cancel')}</button>
                            <button type="submit" className="flex-1 py-3.5 rounded-md bg-md-primary text-md-on-primary font-bold flex items-center justify-center gap-2 hover:shadow-md transition-shadow">{isSaving ? <Loader2 size={20} className="animate-spin" /> : t('save')}</button>
                        </div>
                    </fieldset>
                </form>
            </div>
            {isVoiceInput && voiceModalOpen && (
                <VoiceInputModal
                isOpen={voiceModalOpen}
                onClose={() => { setVoiceModalOpen(false); setVoiceTarget(null); }}
                onConfirm={handleVoiceConfirm}
                />
            )}
        </>
    );
}

function MobileWalletModal({ onClose, onSave, isSaving, setIsSaving, t, walletData }) {
    const { ascMode } = useAccessibility()
    const isVoiceInput = typeof ascMode === 'string' && ascMode.includes('voiceInput')
    const [voiceModalOpen, setVoiceModalOpen] = useState(false)
    const [voiceTarget, setVoiceTarget] = useState(null)
    const [formData, setFormData] = useState({
        provider: walletData?.provider || '',
        mobileNumber: walletData?.mobileNumber || '',
    });

    const handleVoiceConfirm = useCallback((transcript) => {
        if (!voiceTarget) return;
        setFormData(prev => ({ ...prev, [voiceTarget]: transcript }))
        setVoiceModalOpen(false)
        setVoiceTarget(null)
    }, [voiceTarget])

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(formData);
            showToast('success', t('saveSuccess'));
            onClose();
        } catch (error) {
            showToast('error', error.message || t('saveError'));
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto bg-md-surface-container-high rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <header className="border-b border-md-outline-variant/30 p-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-md-on-surface">
                        {walletData?.mobileNumber ? t('editWalletTitle') : t('addWalletTitle')}
                    </h2>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-md-surface-container-highest text-md-on-surface-variant hover:bg-md-on-surface/10 transition-colors" disabled={isSaving}>
                        <X size={20} />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
                    <fieldset disabled={isSaving} className="space-y-4">
                        {/* Display Provider (Fixed) */}
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-md-surface-container border border-transparent">
                             <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center p-1">
                                <ImageWithLoader 
                                    src={getWalletLogoSrc(formData.provider)} 
                                    alt={formData.provider}
                                    fallback={<Smartphone className="w-5 h-5 text-gray-500" />} 
                                />
                             </div>
                             <div>
                                 <p className="text-xs text-md-on-surface-variant uppercase tracking-wide font-bold">{t('walletProvider')}</p>
                                 <p className="text-lg font-bold text-md-on-surface">{formData.provider}</p>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-md-on-surface">{t('mobileNumber')}</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-md-on-surface-variant" size={18} />
                                <input 
                                    type="tel" 
                                    name="mobileNumber" 
                                    value={formData.mobileNumber} 
                                    onChange={handleChange} 
                                    required 
                                    className={`${inputClass} pl-10 pr-12`}
                                    placeholder="03XX XXXXXXX"
                                />
                                {isVoiceInput && (
                                    <button
                                    type="button"
                                    onClick={() => { setVoiceTarget('mobileNumber'); setVoiceModalOpen(true); }}
                                    className="absolute top-1.5 right-2 z-10 w-9 h-9 flex items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container hover:opacity-90 transition-colors"
                                    >
                                    <Mic size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-md bg-md-secondary-container text-md-on-secondary-container font-medium hover:opacity-90 transition-opacity">{t('cancel')}</button>
                            <button type="submit" className="flex-1 py-3.5 rounded-md bg-md-primary text-md-on-primary font-bold flex items-center justify-center gap-2 hover:shadow-md transition-shadow">
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : t('save')}
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
            {isVoiceInput && voiceModalOpen && (
                <VoiceInputModal
                isOpen={voiceModalOpen}
                onClose={() => { setVoiceModalOpen(false); setVoiceTarget(null); }}
                onConfirm={handleVoiceConfirm}
                />
            )}
        </>
    );
}