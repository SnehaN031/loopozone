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
  MapPin,
  Sun,
  UserRound,
} from 'lucide-react';
import { useState } from 'react';
import {
  CommunicationPreferencesCard,
  FormField,
  PrimaryMaterialsCard,
  SectionCard,
  TextInput,
} from './DetailsFormControls';

const pickupTimes = [
  { value: 'morning', title: 'Morning', description: '9 AM - 1 PM', Icon: Sun },
  { value: 'afternoon', title: 'Afternoon', description: '2 PM - 6 PM', Icon: Sun },
  { value: 'evening', title: 'Evening', description: '6 PM - 9 PM', Icon: Clock3 },
];

export function TraderDetailsForm() {
  const router = useRouter();
  const [formValues, setFormValues] = useState({
    companyName: '',
    gstin: '',
    contactName: '',
    addressLine1: '',
    city: '',
    pincode: '',
  });
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [communication, setCommunication] = useState([]);
  const [pickupTime, setPickupTime] = useState('');
  const canContinue = Boolean(
    formValues.companyName.trim() &&
      formValues.contactName.trim() &&
      formValues.addressLine1.trim() &&
      formValues.city.trim() &&
      isValidPincode(formValues.pincode) &&
      selectedMaterials.length > 0 &&
      communication.length > 0 &&
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

    router.push('/sign_in/verification-payout?from=trader');
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <SectionCard title="Company Information" Icon={Building2}>
        <div className="grid gap-5 lg:grid-cols-3">
          <FormField label="Company Name" htmlFor="trader-company-name" required>
            <TextInput
              id="trader-company-name"
              name="companyName"
              value={formValues.companyName}
              onChange={updateField}
              placeholder="Enter company name"
              Icon={Building2}
              autoComplete="organization"
            />
          </FormField>

          <FormField label="GSTIN" htmlFor="trader-gstin" helper="Optional">
            <TextInput
              id="trader-gstin"
              name="gstin"
              value={formValues.gstin}
              onChange={updateField}
              placeholder="Enter GSTIN"
              Icon={CreditCard}
            />
          </FormField>

          <FormField label="Contact Person Name" htmlFor="trader-contact-name" required>
            <TextInput
              id="trader-contact-name"
              name="contactName"
              value={formValues.contactName}
              onChange={updateField}
              placeholder="Enter contact person name"
              Icon={UserRound}
              autoComplete="name"
            />
          </FormField>
        </div>
      </SectionCard>

      <SectionCard title="Address Details" Icon={MapPin}>
        <div className="space-y-5">
          <FormField label="Address Line 1" htmlFor="trader-address-line-1" required>
            <TextInput
              id="trader-address-line-1"
              name="addressLine1"
              value={formValues.addressLine1}
              onChange={updateField}
              placeholder="Street address"
              Icon={MapPin}
              autoComplete="address-line1"
            />
          </FormField>

          <div className="grid gap-5 md:grid-cols-2">
            <FormField label="City" htmlFor="trader-city" required>
              <TextInput
                id="trader-city"
                name="city"
                value={formValues.city}
                onChange={updateField}
                placeholder="City"
                Icon={Building2}
                autoComplete="address-level2"
              />
            </FormField>

            <FormField label="Pincode" htmlFor="trader-pincode" required>
              <TextInput
                id="trader-pincode"
                name="pincode"
                value={formValues.pincode}
                onChange={updateField}
                placeholder="e.g. 400001"
                Icon={MapPin}
                inputMode="numeric"
                autoComplete="postal-code"
              />
            </FormField>
          </div>
        </div>
      </SectionCard>

      <PrimaryMaterialsCard selectedMaterials={selectedMaterials} onToggle={toggleMaterial} />

      <CommunicationPreferencesCard selectedPreferences={communication} onToggle={toggleCommunication} />

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

      <div className="grid gap-4 pt-1 md:grid-cols-[160px_1fr]">
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
