'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Clock3,
  CreditCard,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  Sun,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import {
  CommunicationPreferencesCard,
  FormField,
  PrimaryMaterialsCard,
  SectionCard,
  SelectButton,
  SelectInput,
  TextInput,
} from './DetailsFormControls';

const cityOptions = [
  { value: 'bengaluru', label: 'Bengaluru' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'hyderabad', label: 'Hyderabad' },
  { value: 'chennai', label: 'Chennai' },
];

const stateOptions = [
  { value: 'karnataka', label: 'Karnataka' },
  { value: 'maharashtra', label: 'Maharashtra' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'telangana', label: 'Telangana' },
  { value: 'tamil-nadu', label: 'Tamil Nadu' },
];

const quantityOptions = [
  { value: 'under_100', label: '< 100 KG' },
  { value: '100_to_1', label: '100 KG - 1 Ton' },
  { value: '1_to_10', label: '1 - 10 Ton' },
  { value: '10_plus', label: '10+ Ton' },
];

const pickupTimes = [
  { value: 'morning', title: 'Morning', description: '9 AM - 1 PM', Icon: Sun },
  { value: 'afternoon', title: 'Afternoon', description: '2 PM - 6 PM', Icon: Sun },
  { value: 'evening', title: 'Evening', description: '6 PM - 9 PM', Icon: Clock3 },
];

export function CorporateDetailsForm() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    companyName: '',
    gstin: '',
    contactName: '',
    businessEmail: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [quantity, setQuantity] = useState('');
  const [communication, setCommunication] = useState([]);
  const [hasGstCertificate, setHasGstCertificate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const canContinue = Boolean(
    formValues.companyName.trim() &&
      formValues.contactName.trim() &&
      formValues.addressLine1.trim() &&
      formValues.city &&
      formValues.state &&
      isValidPincode(formValues.pincode) &&
      selectedMaterials.length > 0 &&
      quantity &&
      communication.length > 0 &&
      hasGstCertificate &&
      pickupTime
  );

  function updateField(name, value) {
    setFormValues((current) => ({ ...current, [name]: value }));
  }

  function toggleMaterial(value) {
    setSelectedMaterials((current) => {
      if (current.includes(value)) {
        return current.filter((item) => item !== value);
      }

      return [...current, value];
    });
  }

  function toggleCommunication(value) {
    setCommunication((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  }

function handleSubmit(event) {
    event.preventDefault();

    if (!canContinue) {
      return;
    }

    router.push('/sign_in/verification-payout?from=corporate');
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <SectionCard title="Company Information" Icon={Building2}>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField label="Company Name" htmlFor="company-name" required>
            <TextInput
              id="company-name"
              name="companyName"
              value={formValues.companyName}
              onChange={updateField}
              placeholder="Enter company name"
              Icon={Building2}
              autoComplete="organization"
            />
          </FormField>

          <FormField label="GSTIN" htmlFor="corporate-gstin" helper="Optional">
            <TextInput
              id="corporate-gstin"
              name="gstin"
              value={formValues.gstin}
              onChange={updateField}
              placeholder="Enter GSTIN"
              Icon={CreditCard}
            />
          </FormField>

          <FormField label="Contact Person Name" htmlFor="corporate-contact-name" required>
            <TextInput
              id="corporate-contact-name"
              name="contactName"
              value={formValues.contactName}
              onChange={updateField}
              placeholder="Enter contact person name"
              Icon={UserRound}
              autoComplete="name"
            />
          </FormField>

          <FormField label="Business Email" htmlFor="business-email" helper="Optional">
            <TextInput
              id="business-email"
              name="businessEmail"
              type="email"
              value={formValues.businessEmail}
              onChange={updateField}
              placeholder="Enter email address"
              Icon={Mail}
              autoComplete="email"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Business Location" Icon={MapPin}>
        <div className="grid gap-5 lg:grid-cols-2">
          <FormField label="Address Line 1" htmlFor="corporate-address-line-1" required>
            <TextInput
              id="corporate-address-line-1"
              name="addressLine1"
              value={formValues.addressLine1}
              onChange={updateField}
              placeholder="Street address, building, area"
              Icon={Building2}
              autoComplete="address-line1"
            />
          </FormField>

          <FormField label="Address Line 2" htmlFor="corporate-address-line-2" helper="Optional">
            <TextInput
              id="corporate-address-line-2"
              name="addressLine2"
              value={formValues.addressLine2}
              onChange={updateField}
              placeholder="Landmark, near by place, etc."
              Icon={MapPin}
              autoComplete="address-line2"
            />
          </FormField>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <FormField label="City" htmlFor="corporate-city" required>
            <SelectInput
              id="corporate-city"
              name="city"
              value={formValues.city}
              onChange={updateField}
              placeholder="Select city"
              Icon={Building2}
              options={cityOptions}
            />
          </FormField>

          <FormField label="State" htmlFor="corporate-state" required>
            <SelectInput
              id="corporate-state"
              name="state"
              value={formValues.state}
              onChange={updateField}
              placeholder="Select state"
              Icon={MapPin}
              options={stateOptions}
            />
          </FormField>

          <FormField label="Pincode" htmlFor="corporate-pincode" required>
            <TextInput
              id="corporate-pincode"
              name="pincode"
              value={formValues.pincode}
              onChange={updateField}
              placeholder="Enter pincode"
              Icon={MapPin}
              inputMode="numeric"
              autoComplete="postal-code"
            />
          </FormField>
        </div>
      </SectionCard>

      <div className="grid items-start gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <PrimaryMaterialsCard selectedMaterials={selectedMaterials} onToggle={toggleMaterial} />

        <SectionCard title="Estimated Monthly Quantity" Icon={Package}>
          <div className="grid gap-3 sm:grid-cols-2">
            {quantityOptions.map(({ value, label }) => (
              <SelectButton key={value} selected={quantity === value} onClick={() => setQuantity(value)}>
                {label}
              </SelectButton>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-2">
        <CommunicationPreferencesCard selectedPreferences={communication} onToggle={toggleCommunication} />

        <SectionCard title="Business Verification" Icon={ShieldCheck}>
          <div className="flex min-h-[96px] flex-col justify-center">
            <p className="text-[14px] font-semibold text-[#1f2937]">
              Do you have GST Certificate? <span className="text-[#dc2626]">*</span>
            </p>
            <div className="mt-6 flex gap-10">
              {['yes', 'no'].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="flex items-center gap-3 text-[15px] font-semibold text-[#1f2937]"
                  onClick={() => setHasGstCertificate(value)}
                >
                  <span
                    className={[
                      'flex size-6 items-center justify-center rounded-full border-2',
                      hasGstCertificate === value ? 'border-[#15803d]' : 'border-[#cbd5e1]',
                    ].join(' ')}
                  >
                    {hasGstCertificate === value && <span className="size-3 rounded-full bg-[#15803d]" />}
                  </span>
                  {value === 'yes' ? 'Yes' : 'No'}
                </button>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Preferred Pickup Times" Icon={Clock3}>
        <div className="grid gap-4 lg:grid-cols-3">
          {pickupTimes.map(({ value, title, description, Icon }) => {
            const selected = pickupTime === value;

            return (
              <button
                key={value}
                type="button"
                aria-pressed={selected}
                className={[
                  'relative flex min-h-[76px] items-center justify-center gap-4 rounded-[11px] border-[1.5px] bg-white px-5 text-center transition hover:-translate-y-px hover:border-[#15803d]/60',
                  selected ? 'border-[#15803d] bg-[#f0fdf4] shadow-[0_0_0_3px_rgba(21,128,61,0.07)]' : 'border-[#e2e8f0]',
                ].join(' ')}
                onClick={() => setPickupTime(value)}
              >
                {selected && (
                  <span className="absolute right-4 top-4 flex size-5 items-center justify-center rounded-full bg-[#15803d] text-white">
                    <Check className="size-3" />
                  </span>
                )}
                <Icon className="size-8 shrink-0 text-[#15803d]" />
                <span className="text-left">
                  <span className="block text-[15px] font-semibold text-[#111827]">{title}</span>
                  <span className="mt-1 block text-[13px] font-medium text-[#6b7280]">{description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <div className="grid gap-4 pt-1 md:grid-cols-[180px_1fr]">
        <Link
          href="/sign_in/account-type"
          className="flex min-h-[54px] items-center justify-center gap-3 rounded-[10px] border-[1.5px] border-[#e2e8f0] bg-white px-5 text-[16px] font-semibold text-[#111827] transition hover:-translate-y-px hover:border-[#15803d]/45 hover:bg-[#f8fafc]"
        >
          <ArrowLeft className="size-5" />
          Back
        </Link>

        <button
          type="submit"
          disabled={!canContinue}
          className="flex min-h-[54px] items-center justify-center gap-4 rounded-[10px] bg-[#15803d] px-5 text-[16px] font-semibold text-white transition hover:-translate-y-px hover:bg-[#14532d] active:scale-[0.99] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue
          <ArrowRight className="size-5" />
        </button>
      </div>
    </form>
  );
}

function isValidPincode(value) {
  return /^\d{6}$/.test(String(value || '').trim());
}
