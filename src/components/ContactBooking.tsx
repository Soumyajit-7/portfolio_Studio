import { useEffect, useState, type FormEvent } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { type User } from 'firebase/auth';
import { Calendar, CheckCircle2, Mail, MapPin, Send, Video } from 'lucide-react';
import { db } from '../lib/firebase';
import { PROFILE_LINKS } from '../data/portfolioData';

interface ContactBookingProps {
  user?: User | null;
}

const TOPICS = [
  'Freelance Project',
  'Working Student Role',
  'AI & Data Consulting',
  'General Inquiry',
] as const;

const MEETING_TYPES = [
  'Freelance Discovery',
  'Applied AI Consulting',
  'Working Student Interview',
  'Technical Mentorship',
] as const;

const TIME_SLOTS = ['09:30 CET', '11:30 CET', '14:00 CET', '16:30 CET', '18:30 CET'];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactBooking({ user = null }: ContactBookingProps) {
  const [activeTab, setActiveTab] = useState<'inquiry' | 'appointment'>('inquiry');

  const [senderName, setSenderName] = useState(user?.displayName || '');
  const [senderEmail, setSenderEmail] = useState(user?.email || '');
  const [company, setCompany] = useState('');
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('Freelance Project');
  const [message, setMessage] = useState('');

  const [clientName, setClientName] = useState(user?.displayName || '');
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [meetingType, setMeetingType] =
    useState<(typeof MEETING_TYPES)[number]>('Freelance Discovery');
  const [meetingMode, setMeetingMode] = useState<'google_meet' | 'in_person'>('google_meet');
  const [meetingPlace, setMeetingPlace] = useState('');
  const [date, setDate] = useState(() => {
    const d = new Date(Date.now() + 2 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[2]);
  const [timezone, setTimezone] = useState('Europe/Berlin (CET)');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSenderName((prev) => prev || user.displayName || '');
      setSenderEmail((prev) => prev || user.email || '');
      setClientName((prev) => prev || user.displayName || '');
      setClientEmail((prev) => prev || user.email || '');
    }
  }, [user]);

  const generateDocId = (prefix: string) =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const handleInquirySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = senderName.trim().slice(0, 100);
    const cleanEmail = senderEmail.trim().slice(0, 150);

    if (cleanName.length < 1) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please provide a valid email address so I can reply.');
      return;
    }

    if (message.trim().length < 5) {
      setErrorMsg('Give me at least 5 characters so I know what we are talking about.');
      return;
    }

    setSubmitting(true);
    const docId = generateDocId('inq');
    const ownerUid = user?.emailVerified ? user.uid : 'public_guest';

    try {
      await setDoc(doc(db, 'inquiries', docId), {
        ownerUid,
        senderName: cleanName,
        senderEmail: cleanEmail,
        company: company.trim().slice(0, 120),
        topic,
        message: message.trim().slice(0, 2000),
        status: 'new',
        adminNotes: '',
        sentViaGmail: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMessage('');
      setCompany('');
      setSuccessMsg(
        `Got it! Your inquiry landed straight in my inbox tracker—I will reply to ${cleanEmail} shortly.`
      );
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error ? error.message : 'Something went wrong saving your inquiry.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAppointmentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanName = clientName.trim().slice(0, 100);
    const cleanEmail = clientEmail.trim().slice(0, 150);

    if (cleanName.length < 1) {
      setErrorMsg('Please enter your name.');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setErrorMsg('Please provide a valid email address to receive your invite or counter-proposal.');
      return;
    }

    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)) {
      setErrorMsg('Please pick a valid date.');
      return;
    }

    const cleanPlace =
      meetingMode === 'in_person' ? meetingPlace.trim().slice(0, 200) : 'Google Meet (Virtual)';

    if (meetingMode === 'in_person' && cleanPlace.length < 2) {
      setErrorMsg('Please enter a preferred place or city for an in-person meeting.');
      return;
    }

    setSubmitting(true);
    const docId = generateDocId('appt');
    const ownerUid = user?.emailVerified ? user.uid : 'public_guest';

    try {
      await setDoc(doc(db, 'appointments', docId), {
        ownerUid,
        clientName: cleanName,
        clientEmail: cleanEmail,
        meetingType,
        meetingMode,
        meetingPlace: cleanPlace,
        date,
        timeSlot,
        timezone: timezone.trim().slice(0, 60) || 'Europe/Berlin (CET)',
        notes: notes.trim().slice(0, 1000),
        status: 'pending',
        meetLink: '',
        calendarEventId: '',
        counterDate: '',
        counterTimeSlot: '',
        counterPlace: '',
        counterNote: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setNotes('');
      if (meetingMode === 'in_person') {
        setMeetingPlace('');
      }
      setSuccessMsg(
        meetingMode === 'google_meet'
          ? `Google Meet request saved for ${date} at ${timeSlot}. Once I accept, both of us will receive the scheduled Meet link at ${cleanEmail}.`
          : `In-person request saved for ${date} at ${timeSlot} (${cleanPlace}). I will confirm or send a date, time, or place update to ${cleanEmail}.`
      );
    } catch (error: unknown) {
      setErrorMsg(
        error instanceof Error ? error.message : 'Could not reserve that appointment slot.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <section
      id="contact"
      className="py-20 border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left info column */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-2">
              05. Say Hello or Book a Call
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Got an ambitious build, freelance gig, or working-student role?
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Drop a quick note or book a Google Meet / in-person slot right here—no account
              required. Everything lands directly in my lead dashboard so nothing gets buried.
            </p>
          </div>

          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-y border-zinc-200 dark:border-zinc-800 text-sm">
            <div className="py-4">
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">Direct Email</p>
              <a
                href={`mailto:${PROFILE_LINKS.email}`}
                className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {PROFILE_LINKS.email}
              </a>
            </div>
            <div className="py-4">
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                Base & Phone
              </p>
              <p className="text-zinc-800 dark:text-zinc-200 tabular-nums">
                54295 Trier, Germany · {PROFILE_LINKS.phone}
              </p>
            </div>
            <div className="py-4">
              <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                Availability Window
              </p>
              <p className="text-zinc-800 dark:text-zinc-200">
                Starting Nov 2026 · 16–20 hours/week · Trier region or remote
              </p>
            </div>
          </div>
        </div>

        {/* Right form column */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800 mb-6">
            <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('inquiry');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'inquiry'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                Send Message
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('appointment');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  activeTab === 'appointment'
                    ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                Book a Slot
              </button>
            </div>

            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
              No sign-in required · Replies go to your email
            </p>
          </div>

          {errorMsg && (
            <div className="mb-5 rounded-lg border border-red-300 dark:border-red-900/70 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs text-red-700 dark:text-red-300">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-5 rounded-lg border border-emerald-300 dark:border-emerald-900/70 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'inquiry' ? (
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    placeholder="Alex Weber"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={150}
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="alex@company.de"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Company / Team (Optional)
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Startup, Lab, or Solo"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    What’s This About?
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  minLength={5}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell me what you're building, hiring for, or curious about..."
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                {submitting ? 'Sending...' : 'Send Inquiry'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleAppointmentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Alex Weber"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={150}
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="alex@company.de"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Meeting Format
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMeetingMode('google_meet')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      meetingMode === 'google_meet'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-zinc-900 dark:text-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <Video
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        meetingMode === 'google_meet'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-zinc-400'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold">Google Meet (Virtual)</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Scheduled Meet link emailed to both of us upon approval.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingMode('in_person')}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      meetingMode === 'in_person'
                        ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-zinc-900 dark:text-zinc-100'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <MapPin
                      className={`w-4 h-4 mt-0.5 shrink-0 ${
                        meetingMode === 'in_person'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-zinc-400'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold">In-Person Meet</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Suggest a venue; confirmed or countered via email.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              {meetingMode === 'in_person' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Proposed Place / Venue
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={200}
                    value={meetingPlace}
                    onChange={(e) => setMeetingPlace(e.target.value)}
                    placeholder="e.g., Universität Trier Campus, Hauptmarkt Café, or your office address"
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Session Type
                  </label>
                  <select
                    value={meetingType}
                    onChange={(e) =>
                      setMeetingType(e.target.value as (typeof MEETING_TYPES)[number])
                    }
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {MEETING_TYPES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    min={todayIso}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600 tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Timezone
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Pick a Time (Trier CET)
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setTimeSlot(slot)}
                      className={`px-3 py-2 text-xs font-mono rounded-lg border transition-colors cursor-pointer tabular-nums ${
                        timeSlot === slot
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Agenda Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any links, context, or questions ahead of our chat..."
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                {submitting ? 'Booking...' : 'Lock In Booking Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
