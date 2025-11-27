import React, { useState } from 'react'
import { Plus, CreditCard, Smartphone, Edit2, Trash2, X, Loader2, Check, Star, Wallet, Link as LinkIcon, AlertCircle } from 'lucide-react'
import { useI18n } from '../context/I18nContext'
import { useCreditCards, useMobileWallets } from '../context/PaymentDataContext' 
import { Layout } from '../Layout'
import HeaderWithName from '../component/HeaderWithName'
import { showToast } from '../utils/toast'
import ImageWithLoader from '../component/ImageWithLoader'

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
                ? 'accentPrimBg border-transparent' 
                : 'bg-transparent border-gray-300 dark:border-slate-600 group-hover:border-blue-400'}
        `}>
            {checked && <Check size={12} className="text-white" strokeWidth={3} />}
            <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
        </div>
        <span className="text-sm primText">{label}</span>
    </label>
);

// Improved Visual Card with Subtle Gradient
const CreditCardItem = ({ card, onDelete, t }) => (
    <div className="relative w-full aspect-[1.586/1] max-h-[190px] rounded-xl overflow-hidden primBorder group bg-white dark:bg-slate-900">
        <div className="relative h-full p-4 flex flex-col justify-between z-10">
            {/* Top */}
            <div className="flex justify-between items-start">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider secText opacity-70">{t('cardBrand')}</span>
                    <div className="font-bold text-lg primText capitalize leading-tight">{card.brand}</div>
                </div>
                {card.isDefault && (
                    <div className="flex items-center gap-1 badgeSuccess px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                        <Star size={10} fill="currentColor" />
                        <span className="text-[10px] font-bold uppercase">{t('default')}</span>
                    </div>
                )}
            </div>

            {/* Middle */}
            <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-1 secText text-sm tracking-widest opacity-60">
                    <span>••••</span><span>••••</span><span>••••</span>
                </div>
                <span className="font-mono text-xl font-bold primText tracking-widest">{card.last4Digits}</span>
            </div>

            {/* Bottom */}
            <div className="flex justify-between items-end">
                <div>
                    <span className="text-[10px] uppercase secText block mb-0.5 opacity-70">{t('expires')}</span>
                    <span className="font-medium primText text-sm">{String(card.expiryMonth).padStart(2, '0')}/{card.expiryYear}</span>
                </div>
                <button 
                    onClick={() => onDelete(card._id)} 
                    aria-label={t('delete')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors focusRing"
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
                    ? 'secBg primBorder' 
                    : 'bg-transparent border-2 border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer group'}
            `}
        >
            {/* Logo Section */}
            <div className={`
                w-12 h-12 rounded-lg flex items-center justify-center p-1.5 flex-shrink-0
                bg-white dark:bg-white border border-gray-200 dark:border-gray-400
                ${!isLinked ? 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all' : ''}
            `}>
                <ImageWithLoader 
                    src={getWalletLogoSrc(provider)} 
                    alt={provider}
                    imageClassName="w-full h-full object-contain"
                    // Fallback icon if logo fails
                    fallback={<Smartphone className="w-6 h-6 secText" />} 
                />
            </div>

            {/* Info Section */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm ${isLinked ? 'primText' : 'secText group-hover:primText'}`}>
                    {provider}
                </h3>
                {isLinked ? (
                    <p className="text-xs secText truncate font-mono mt-0.5">{wallet.mobileNumber}</p>
                ) : (
                    <p className="text-xs secText text-blue-500 dark:text-blue-400 font-medium mt-0.5 flex items-center gap-1">
                        <Plus size={12} strokeWidth={3} /> {t('linkWallet')}
                    </p>
                )}
            </div>

            {/* Actions */}
            {isLinked ? (
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => onAction(wallet)}
                        className="p-2 rounded-lg secHoverBg secText hover:primText transition-colors focusRing"
                        aria-label={t('edit')}
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => onDelete(wallet.provider)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors focusRing"
                        aria-label={t('delete')}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ) : (
                <div className="pr-2">
                     <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 transition-colors">
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
            <main className="primBg flex-1 overflow-y-auto min-h-full pb-safe">
                <div className="max-w-[430px] mx-auto p-4">
                    
                    {/* --- 1. Mobile Wallets (Priority Section) --- */}
                    <section aria-labelledby="wallets-heading" className="space-y-4">
                        <h2 id="wallets-heading" className="text-lg font-bold primText flex items-center gap-2">
                            <Wallet size={20} className="accentPrimText" />
                            {t('mobileWallets')}
                        </h2>

                        {walletsLoading ? (
                            <div className="space-y-3">
                                <div className="h-16 skeleton rounded-xl" />
                                <div className="h-16 skeleton rounded-xl" />
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
                    {/* High visibility border for accessibility structure */}
                    <div className="my-8" />

                    {/* --- 2. Credit Cards --- */}
                    <section aria-labelledby="cards-heading" className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 id="cards-heading" className="text-lg font-bold primText flex items-center gap-2">
                                <CreditCard size={20} className="accentPrimText" />
                                {t('creditDebitCards')}
                            </h2>
                        </div>

                        {cardsLoading ? (
                            <div className="space-y-4">
                                <div className="h-44 skeleton rounded-xl" />
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
                                    <div className="secBg primBorder border-dashed border-2 rounded-xl p-6 flex flex-col items-center text-center">
                                        <CreditCard className="w-10 h-10 secText opacity-30 mb-2" />
                                        <p className="text-xs secText">{t('noCards')}</p>
                                    </div>
                                )}
                                
                                <button 
                                    onClick={() => handleOpenModal('card')}
                                    className="w-full py-3.5 border-2 border-gray-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold secText hover:primText hover:border-gray-400 dark:hover:border-slate-500 transition-all focusRing bg-gray-50/50 dark:bg-slate-900/20"
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

function CreditCardModal({ onClose, onSave, isSaving, setIsSaving, t }) {
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
                className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto secBg rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="dividerBorder p-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold primText">{t('addCardTitle')}</h2>
                    <button onClick={onClose} className="btnSecondary rounded-full p-2 h-10 w-10 flex items-center justify-center" disabled={isSaving}>
                        <X size={20} />
                    </button>
                </header>
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
                    <fieldset disabled={isSaving} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2 primText">{t('cardBrand')}</label>
                            <div className="relative">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 secText" size={18} />
                                <input type="text" name="brand" value={formData.brand} onChange={handleChange} required placeholder={t('brandPlaceholder')} className="inputField pl-10" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 primText">{t('cardNumber')}</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                name="last4Digits"
                                value={formData.last4Digits}
                                onChange={(e) => handleChange({target: {name: 'last4Digits', value: e.target.value.replace(/\D/g, '')}})}
                                required
                                className="inputField font-mono tracking-widest"
                                placeholder={t('last4Digits')}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 primText">{t('expiryDate')}</label>
                            <div className="flex gap-4">
                                <input type="text" inputMode="numeric" name="expiryMonth" value={formData.expiryMonth} onChange={(e) => handleChange({target: {name: 'expiryMonth', value: e.target.value.replace(/\D/g, '')}})} required className="inputField text-center" placeholder="MM" />
                                <span className="self-center text-xl secText">/</span>
                                <input type="text" inputMode="numeric" name="expiryYear" value={formData.expiryYear} onChange={(e) => handleChange({target: {name: 'expiryYear', value: e.target.value.replace(/\D/g, '')}})} required className="inputField text-center" placeholder="YYYY" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <CustomCheckbox checked={formData.isDefault} onChange={(e) => setFormData(prev => ({...prev, isDefault: e.target.checked}))} label={t('setAsDefault')} />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btnSecondary flex-1 py-3.5 rounded-xl font-medium">{t('cancel')}</button>
                            <button type="submit" className="btnPrimary flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2">{isSaving ? <Loader2 size={20} className="animate-spin" /> : t('save')}</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </>
    );
}

function MobileWalletModal({ onClose, onSave, isSaving, setIsSaving, t, walletData }) {
    // walletData contains { provider } at minimum, even for new links
    const [formData, setFormData] = useState({
        provider: walletData?.provider || '',
        mobileNumber: walletData?.mobileNumber || '',
    });

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
            <div className="fixed bottom-0 left-0 right-0 z-50 max-w-[430px] mx-auto secBg rounded-t-2xl shadow-2xl flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <header className="dividerBorder p-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold primText">
                        {walletData?.mobileNumber ? t('editWalletTitle') : t('addWalletTitle')}
                    </h2>
                    <button onClick={onClose} className="btnSecondary rounded-full p-2 h-10 w-10 flex items-center justify-center" disabled={isSaving}>
                        <X size={20} />
                    </button>
                </header>
                
                <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
                    <fieldset disabled={isSaving} className="space-y-4">
                        {/* Display Provider (Fixed) */}
                        <div className="flex items-center gap-4 p-4 secBg primBorder rounded-xl bg-white dark:bg-slate-900">
                             <div className="w-10 h-10 rounded-lg bg-white dark:bg-white border border-gray-200 dark:border-gray-400 flex items-center justify-center p-1">
                                <ImageWithLoader 
                                    src={getWalletLogoSrc(formData.provider)} 
                                    alt={formData.provider}
                                    fallback={<Smartphone className="w-5 h-5 secText" />} 
                                />
                             </div>
                             <div>
                                 <p className="text-xs secText uppercase tracking-wide font-bold">{t('walletProvider')}</p>
                                 <p className="text-lg font-bold primText">{formData.provider}</p>
                             </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 primText">{t('mobileNumber')}</label>
                            <div className="relative">
                                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 secText" size={18} />
                                <input 
                                    type="tel" 
                                    name="mobileNumber" 
                                    value={formData.mobileNumber} 
                                    onChange={handleChange} 
                                    required 
                                    className="inputField pl-10"
                                    placeholder="03XX XXXXXXX"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button type="button" onClick={onClose} className="btnSecondary flex-1 py-3.5 rounded-xl font-medium">{t('cancel')}</button>
                            <button type="submit" className="btnPrimary flex-1 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2">
                                {isSaving ? <Loader2 size={20} className="animate-spin" /> : t('save')}
                            </button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </>
    );
}