import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { appointmentAPI } from '@/services/api';
import { motion } from 'framer-motion';
import { format, addDays, startOfToday } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/context/store';

const TYPES = [
  { value: 'fitting',      label: 'Fitting Session', desc: 'Try on your garment & get it adjusted' },
  { value: 'consultation', label: 'Style Consultation', desc: 'Discuss your vision with our master tailor' },
  { value: 'measurement',  label: 'Measurement Session', desc: 'Get your 17+ measurements taken' },
  { value: 'alteration',   label: 'Alteration Appointment', desc: 'Bring in existing garments for alterations' },
];

export default function Appointments() {
  const { user } = useAuthStore();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [step, setStep] = useState(1);
  const [confirmed, setConfirmed] = useState(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
  });

  const dates = Array.from({ length: 14 }, (_, i) => addDays(startOfToday(), i + 1))
    .filter(d => d.getDay() !== 0); // No Sundays

  const { data: slotsData, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', selectedDate],
    queryFn: () => appointmentAPI.getSlots(selectedDate).then(r => r.data),
    enabled: !!selectedDate,
  });

  const bookMutation = useMutation({
    mutationFn: (data) => appointmentAPI.book(data).then(r => r.data),
    onSuccess: (data) => { setConfirmed(data.appointment); setStep(4); },
    onError: (err) => toast.error(err.message || 'Booking failed'),
  });

  const onSubmit = (formData) => {
    if (!selectedType || !selectedDate || !selectedSlot) {
      toast.error('Please complete all steps before confirming.');
      return;
    }
    bookMutation.mutate({
      ...formData,
      type: selectedType,
      date: selectedDate,
      timeSlot: selectedSlot,
    });
  };

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <div className="bg-ink text-ivory py-14 px-6 text-center">
        <p className="text-xs tracking-[0.35em] uppercase text-gold mb-3">Sambhav Atelier</p>
        <h1 className="font-serif text-4xl font-light mb-3">Book an Appointment</h1>
        <p className="text-ivory/50 text-sm font-light max-w-md mx-auto">
          Visit our Mumbai atelier for a personalized fitting, consultation, or measurement session.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-16">
        {step < 4 ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* Step 1: Type */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="font-serif text-3xl text-gold/30 font-light">01</span>
                <h2 className="font-serif text-xl text-ink">Choose appointment type</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {TYPES.map(t => (
                  <button key={t.value} type="button" onClick={() => { setSelectedType(t.value); setStep(s => Math.max(s, 2)); }}
                    className={`text-left p-5 border transition-all ${selectedType === t.value ? 'border-gold bg-gold/5' : 'border-gold/20 hover:border-gold/50'}`}>
                    <p className={`text-sm font-medium mb-1 ${selectedType === t.value ? 'text-gold' : 'text-ink'}`}>{t.label}</p>
                    <p className="text-xs text-muted font-light">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Date */}
            {step >= 2 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-serif text-3xl text-gold/30 font-light">02</span>
                  <h2 className="font-serif text-xl text-ink">Select a date</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {dates.map(d => {
                    const val = format(d, 'yyyy-MM-dd');
                    return (
                      <button key={val} type="button" onClick={() => { setSelectedDate(val); setSelectedSlot(''); setStep(s => Math.max(s, 3)); }}
                        className={`px-4 py-3 text-center border transition-all min-w-[80px] ${selectedDate === val ? 'bg-ink text-ivory border-ink' : 'border-gold/20 hover:border-gold text-ink'}`}>
                        <div className="text-xs tracking-wide">{format(d, 'EEE')}</div>
                        <div className="font-serif text-lg font-light">{format(d, 'd')}</div>
                        <div className="text-xs text-muted">{format(d, 'MMM')}</div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Step 3: Time slot */}
            {step >= 3 && selectedDate && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-6">
                  <span className="font-serif text-3xl text-gold/30 font-light">03</span>
                  <h2 className="font-serif text-xl text-ink">Choose a time slot</h2>
                </div>
                {slotsLoading ? (
                  <div className="flex gap-2 flex-wrap">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-12 w-36 bg-ivory-warm animate-pulse" />)}
                  </div>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {slotsData?.allSlots?.map(slot => {
                      const isAvail = slotsData.available.includes(slot);
                      return (
                        <button key={slot} type="button" disabled={!isAvail}
                          onClick={() => isAvail && setSelectedSlot(slot)}
                          className={`px-4 py-3 text-sm border transition-all ${
                            selectedSlot === slot ? 'bg-ink text-ivory border-ink'
                            : isAvail ? 'border-gold/20 hover:border-gold text-ink'
                            : 'border-gray-100 text-muted/30 cursor-not-allowed line-through'
                          }`}>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Contact Details */}
                {selectedSlot && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 space-y-4 pt-8 border-t border-gold/15">
                    <h3 className="font-serif text-lg text-ink">Your details</h3>
                    {[
                      { name: 'name', label: 'Full Name', type: 'text', rules: { required: 'Required' } },
                      { name: 'email', label: 'Email', type: 'email', rules: { required: 'Required' } },
                      { name: 'phone', label: 'Mobile', type: 'tel', rules: { required: 'Required' } },
                    ].map(f => (
                      <div key={f.name}>
                        <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">{f.label}</label>
                        <input type={f.type} {...register(f.name, f.rules)}
                          className="w-full border border-gold/30 bg-ivory px-4 py-3 text-sm outline-none focus:border-gold" />
                        {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name].message}</p>}
                      </div>
                    ))}
                    <div>
                      <label className="text-xs tracking-widest uppercase text-muted block mb-1.5">Notes (optional)</label>
                      <textarea {...register('notes')} rows={3}
                        placeholder="Any special requirements, garment details, or questions..."
                        className="w-full border border-gold/30 bg-ivory px-4 py-3 text-sm outline-none focus:border-gold resize-none" />
                    </div>
                    <button type="submit" disabled={bookMutation.isPending}
                      className="w-full bg-gold text-ivory py-4 text-xs tracking-widest uppercase hover:bg-gold-dark transition-colors disabled:opacity-60">
                      {bookMutation.isPending ? 'Booking...' : 'Confirm Appointment'}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </form>
        ) : (
          /* Confirmation */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gold text-2xl">✓</span>
            </div>
            <h2 className="font-serif text-3xl font-light text-ink mb-3">Appointment Confirmed!</h2>
            <p className="text-muted mb-8 max-w-sm mx-auto font-light">
              We'll see you at our Mumbai atelier. A confirmation email has been sent to your inbox.
            </p>
            <div className="bg-ivory-warm p-6 max-w-sm mx-auto text-left space-y-3 border-l-2 border-gold mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Type</span>
                <span className="text-ink capitalize">{confirmed?.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Date</span>
                <span className="text-ink">{confirmed?.date && format(new Date(confirmed.date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Time</span>
                <span className="text-ink">{confirmed?.timeSlot}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Location</span>
                <span className="text-ink">Sambhav Atelier, Mumbai</span>
              </div>
            </div>
            <a href="/" className="inline-block bg-ink text-ivory px-8 py-3 text-xs tracking-widest uppercase hover:bg-gold transition-colors">
              Back to Home
            </a>
          </motion.div>
        )}
      </div>
    </div>
  );
}
