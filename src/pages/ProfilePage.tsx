import React, { useEffect, useState } from 'react';
import {
  Camera,
  Mail,
  Phone,
  MapPin,
  Landmark,
  ShieldCheck,
  CalendarDays,
  Save,
  UserRound,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/stores/useAuthStore';
import { authApi } from '@/lib/api/financeApi';
import { User } from '@/types';

type ProfileForm = {
  name: string;
  email: string;
  avatar: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: string;
  city: string;
  country: string;
  emergencyContact: string;
  emergencyPhone: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  bankCode: string;
  iban: string;
  accountType: string;
};

const getDefaultProfileForm = (user: User | null): ProfileForm => ({
  name: user?.name || '',
  email: user?.email || '',
  avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb',
  phoneNumber: user?.phoneNumber || '',
  dateOfBirth: user?.dateOfBirth || '',
  address: user?.address || '',
  city: user?.city || '',
  country: user?.country || '',
  emergencyContact: user?.emergencyContact || '',
  emergencyPhone: user?.emergencyPhone || '',
  bankName: user?.bankName || '',
  accountHolderName: user?.accountHolderName || '',
  accountNumber: user?.accountNumber || '',
  bankCode: user?.bankCode || '',
  iban: user?.iban || '',
  accountType: user?.accountType || '',
});

const inputClassName =
  'w-full rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

export const ProfilePage: React.FC = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [form, setForm] = useState<ProfileForm>(getDefaultProfileForm(user));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setForm(getDefaultProfileForm(user));
  }, [user]);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((prev) => ({ ...prev, avatar: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const payload: Partial<User> = {
        name: form.name.trim() || user?.name || '',
        avatar: form.avatar,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
        city: form.city,
        country: form.country,
        emergencyContact: form.emergencyContact,
        emergencyPhone: form.emergencyPhone,
        bankName: form.bankName,
        accountHolderName: form.accountHolderName,
        accountNumber: form.accountNumber,
        bankCode: form.bankCode,
        iban: form.iban,
        accountType: form.accountType,
      };

      const { user: updatedUser } = await authApi.updateProfile(payload);
      updateUserProfile(updatedUser);
      setMessage('Profile updated successfully.');
    } catch (error) {
      console.error('Failed to update profile:', error);
      setMessage('Unable to save your profile right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
            Personal profile
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            My account
          </h1>
        </div>
        <Button size="md" onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
          Save changes
        </Button>
      </div>

      {message && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
        <section className="rounded-3xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <img
                src={form.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                alt={form.name || 'User avatar'}
                className="h-32 w-32 rounded-full object-cover ring-4 ring-brand-500/20 shadow-lg shadow-brand-500/10"
              />
              <label className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white bg-brand-600 text-white shadow-lg shadow-brand-500/30 hover:bg-brand-500 transition-colors">
                <Camera className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </label>
            </div>

            <div className="mt-5 space-y-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{form.name || 'Your name'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{form.email || 'No email provided'}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-slate-900/40 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                <BadgeCheck className="h-3.5 w-3.5" /> Active
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Member since</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">2026</span>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-brand-500/10 p-2 text-brand-500">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Profile details</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Basic personal information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Full name</span>
                <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={inputClassName} placeholder="Jane Doe" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.email} disabled className={`${inputClassName} pl-9 bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400`} />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone number</span>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.phoneNumber} onChange={(e) => handleChange('phoneNumber', e.target.value)} className={`${inputClassName} pl-9`} placeholder="+234 800 000 0000" />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Date of birth</span>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input type="date" value={form.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} className={`${inputClassName} pl-9`} />
                </div>
              </label>

              <label className="md:col-span-2 space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Address</span>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)} className={`${inputClassName} min-h-24 pl-9`} placeholder="12 Financial Avenue, Lekki Phase 1" />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">City</span>
                <input value={form.city} onChange={(e) => handleChange('city', e.target.value)} className={inputClassName} placeholder="Lagos" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Country</span>
                <input value={form.country} onChange={(e) => handleChange('country', e.target.value)} className={inputClassName} placeholder="Nigeria" />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emergency contact</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Trusted person and backup details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Emergency contact</span>
                <input value={form.emergencyContact} onChange={(e) => handleChange('emergencyContact', e.target.value)} className={inputClassName} placeholder="Ada Okafor" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Emergency number</span>
                <input value={form.emergencyPhone} onChange={(e) => handleChange('emergencyPhone', e.target.value)} className={inputClassName} placeholder="+234 800 000 0000" />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-500">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bank credentials</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Account and payout information</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bank name</span>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input value={form.bankName} onChange={(e) => handleChange('bankName', e.target.value)} className={`${inputClassName} pl-9`} placeholder="Wema Bank" />
                </div>
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Account holder</span>
                <input value={form.accountHolderName} onChange={(e) => handleChange('accountHolderName', e.target.value)} className={inputClassName} placeholder="Jane Doe" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Account number</span>
                <input value={form.accountNumber} onChange={(e) => handleChange('accountNumber', e.target.value)} className={inputClassName} placeholder="0123456789" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Bank code</span>
                <input value={form.bankCode} onChange={(e) => handleChange('bankCode', e.target.value)} className={inputClassName} placeholder="035" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">IBAN / Sort code</span>
                <input value={form.iban} onChange={(e) => handleChange('iban', e.target.value)} className={inputClassName} placeholder="NG1234567890" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Account type</span>
                <input value={form.accountType} onChange={(e) => handleChange('accountType', e.target.value)} className={inputClassName} placeholder="Checking" />
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
