import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { type User } from 'firebase/auth';
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Inbox,
  LogOut,
  Mail,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Send,
  Video,
} from 'lucide-react';
import {
  db,
  getGmailAccessToken,
  hasCalendarAccessToken,
  isAdminUser,
  logoutGoogle,
  signInWithGoogle,
} from '../lib/firebase';
import {
  buildInPersonAcceptedTemplate,
  buildInPersonCounterTemplate,
  buildVirtualMeetAcceptedTemplate,
  createCalendarAppointmentEvent,
  sendMultipartGmail,
  type AppointmentEmailContext,
} from '../lib/appointmentTemplates';
import { PROFILE_LINKS } from '../data/portfolioData';
import { GoogleSignInButton } from './GoogleSignInButton';

interface InquiryRecord {
  id: string;
  ownerUid: string;
  senderName: string;
  senderEmail: string;
  company: string;
  topic: string;
  message: string;
  status: 'new' | 'reviewed' | 'replied' | 'archived';
  adminNotes: string;
  sentViaGmail: boolean;
  createdAt?: { toDate?: () => Date; seconds?: number };
}

interface AppointmentRecord {
  id: string;
  ownerUid: string;
  clientName: string;
  clientEmail: string;
  meetingType: string;
  meetingMode?: 'google_meet' | 'in_person';
  meetingPlace?: string;
  date: string;
  timeSlot: string;
  timezone: string;
  notes: string;
  status: 'pending' | 'counter_proposed' | 'confirmed' | 'completed' | 'cancelled';
  meetLink?: string;
  calendarEventId?: string;
  counterDate?: string;
  counterTimeSlot?: string;
  counterPlace?: string;
  counterNote?: string;
  createdAt?: { toDate?: () => Date; seconds?: number };
}

interface GmailMessageSummary {
  id: string;
  subject: string;
  from: string;
  snippet: string;
  date: string;
}

interface LeadDashboardProps {
  user: User | null;
  onUserChanged: (user: User | null) => void;
  onBackToPortfolio: () => void;
}

function encodeReplyEmail(to: string, subject: string, body: string): string {
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ].join('\r\n');

  const bytes = new TextEncoder().encode(raw);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sortByCreatedDesc<T extends { createdAt?: { seconds?: number } }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
}

export function LeadDashboard({
  user,
  onUserChanged,
  onBackToPortfolio,
}: LeadDashboardProps) {
  const isAdmin = isAdminUser(user);
  const [section, setSection] = useState<'inquiries' | 'appointments' | 'gmail' | 'social'>(
    'inquiries'
  );
  const [authLoading, setAuthLoading] = useState(false);

  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryRecord | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  const [gmailMessages, setGmailMessages] = useState<GmailMessageSummary[]>([]);
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailError, setGmailError] = useState<string | null>(null);

  const [replyTarget, setReplyTarget] = useState<InquiryRecord | null>(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [confirmSendOpen, setConfirmSendOpen] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  // Admin appointment acceptance & counter-proposal modal states
  const [acceptTarget, setAcceptTarget] = useState<AppointmentRecord | null>(null);
  const [acceptDuration, setAcceptDuration] = useState<30 | 45 | 60>(30);
  const [acceptHostNote, setAcceptHostNote] = useState('');
  const [acceptAddCalendar, setAcceptAddCalendar] = useState(true);
  const [acceptProcessing, setAcceptProcessing] = useState(false);

  const [counterTarget, setCounterTarget] = useState<AppointmentRecord | null>(null);
  const [counterDateDraft, setCounterDateDraft] = useState('');
  const [counterTimeDraft, setCounterTimeDraft] = useState('');
  const [counterPlaceDraft, setCounterPlaceDraft] = useState('');
  const [counterNoteDraft, setCounterNoteDraft] = useState('');
  const [counterProcessing, setCounterProcessing] = useState(false);

  const [socialPlatform, setSocialPlatform] = useState<'instagram' | 'linkedin'>('instagram');
  const [socialTitle, setSocialTitle] = useState('');
  const [socialCaption, setSocialCaption] = useState('');
  const [socialCategory, setSocialCategory] = useState('Sports & Adventure');
  const [socialUrl, setSocialUrl] = useState('https://www.instagram.com/fr_soumyajit/');
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !isAdmin) {
      setInquiries([]);
      setAppointments([]);
      setLoadingData(false);
      setDashboardError(null);
      return;
    }

    setLoadingData(true);
    setDashboardError(null);

    const inquiriesQuery = query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'));

    const unsubInquiries = onSnapshot(
      inquiriesQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<InquiryRecord, 'id'>),
        }));
        setInquiries(sortByCreatedDesc(list));
        setLoadingData(false);
      },
      (err) => {
        setLoadingData(false);
        setDashboardError(`Unable to load inquiries: ${err.message}`);
      }
    );

    const appointmentsQuery = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));

    const unsubAppointments = onSnapshot(
      appointmentsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<AppointmentRecord, 'id'>),
        }));
        setAppointments(sortByCreatedDesc(list));
      },
      (err) => {
        setDashboardError(`Unable to load appointments: ${err.message}`);
      }
    );

    return () => {
      unsubInquiries();
      unsubAppointments();
    };
  }, [user, isAdmin]);

  const handleLogin = async () => {
    setAuthLoading(true);
    setDashboardError(null);
    try {
      const res = await signInWithGoogle(true);
      onUserChanged(res.user);
    } catch (err: unknown) {
      setDashboardError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    onUserChanged(null);
    setGmailMessages([]);
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.senderName.toLowerCase().includes(q) ||
        item.senderEmail.toLowerCase().includes(q) ||
        item.topic.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [inquiries, statusFilter, searchQuery]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.clientName.toLowerCase().includes(q) ||
        item.clientEmail.toLowerCase().includes(q) ||
        item.meetingType.toLowerCase().includes(q) ||
        item.date.includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [appointments, statusFilter, searchQuery]);

  const updateInquiryStatus = async (
    inquiry: InquiryRecord,
    nextStatus: InquiryRecord['status']
  ) => {
    try {
      await updateDoc(doc(db, 'inquiries', inquiry.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      setSelectedInquiry((prev) =>
        prev && prev.id === inquiry.id ? { ...prev, status: nextStatus } : prev
      );
      setFeedbackMsg(`Updated inquiry from ${inquiry.senderName} to ${nextStatus}.`);
    } catch (error: unknown) {
      setDashboardError(error instanceof Error ? error.message : 'Failed to update inquiry status.');
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedInquiry) return;
    try {
      const cleanNotes = notesDraft.slice(0, 1000);
      await updateDoc(doc(db, 'inquiries', selectedInquiry.id), {
        adminNotes: cleanNotes,
        updatedAt: serverTimestamp(),
      });
      setSelectedInquiry({ ...selectedInquiry, adminNotes: cleanNotes });
      setFeedbackMsg('Internal notes saved.');
    } catch (error: unknown) {
      setDashboardError(error instanceof Error ? error.message : 'Failed to save notes.');
    }
  };

  const normalizeAppointment = (appt: AppointmentRecord): AppointmentEmailContext => ({
    id: appt.id,
    clientName: appt.clientName,
    clientEmail: appt.clientEmail,
    meetingType: appt.meetingType,
    meetingMode: appt.meetingMode === 'in_person' ? 'in_person' : 'google_meet',
    meetingPlace:
      appt.meetingPlace ||
      (appt.meetingMode === 'in_person' ? 'Trier, Germany' : 'Google Meet (Virtual)'),
    date: appt.counterDate || appt.date,
    timeSlot: appt.counterTimeSlot || appt.timeSlot,
    timezone: appt.timezone || 'Europe/Berlin (CET)',
    notes: appt.notes || '',
  });

  const buildLegacyBackfillFields = (appt: AppointmentRecord) => ({
    meetingMode: appt.meetingMode || 'google_meet',
    meetingPlace:
      appt.meetingPlace ||
      (appt.meetingMode === 'in_person' ? 'Trier, Germany' : 'Google Meet (Virtual)'),
    meetLink: appt.meetLink || '',
    calendarEventId: appt.calendarEventId || '',
    counterDate: appt.counterDate || '',
    counterTimeSlot: appt.counterTimeSlot || '',
    counterPlace: appt.counterPlace || '',
    counterNote: appt.counterNote || '',
  });

  const updateAppointmentStatus = async (
    appt: AppointmentRecord,
    nextStatus: AppointmentRecord['status']
  ) => {
    try {
      if (isAdmin) {
        await updateDoc(doc(db, 'appointments', appt.id), {
          ...buildLegacyBackfillFields(appt),
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'appointments', appt.id), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      }
      setFeedbackMsg(`Appointment on ${appt.date} marked ${nextStatus}.`);
    } catch (error: unknown) {
      setDashboardError(
        error instanceof Error ? error.message : 'Failed to update appointment status.'
      );
    }
  };

  const openAcceptModal = (appt: AppointmentRecord) => {
    setAcceptTarget(appt);
    setAcceptDuration(30);
    setAcceptHostNote('');
    setAcceptAddCalendar(true);
    setDashboardError(null);
  };

  const openCounterModal = (appt: AppointmentRecord) => {
    setCounterTarget(appt);
    setCounterDateDraft(appt.counterDate || appt.date);
    setCounterTimeDraft(appt.counterTimeSlot || appt.timeSlot);
    setCounterPlaceDraft(appt.counterPlace || appt.meetingPlace || '');
    setCounterNoteDraft(
      appt.counterNote ||
        'Based on my availability around that window, could we move our in-person meet to the date, time, and spot below?'
    );
    setDashboardError(null);
  };

  const executeAcceptAppointment = async () => {
    if (!acceptTarget || !isAdmin || !user) return;
    const token = getGmailAccessToken();
    if (!token) {
      setDashboardError('Please click Reconnect Google Workspace first so Calendar and Gmail can dispatch invites.');
      return;
    }

    const ctx = normalizeAppointment(acceptTarget);
    const isVirtual = ctx.meetingMode === 'google_meet';

    if (isVirtual && !hasCalendarAccessToken()) {
      setDashboardError('Please click Reconnect Google Workspace to grant Calendar access for creating the Google Meet link.');
      return;
    }

    setAcceptProcessing(true);
    setDashboardError(null);

    try {
      let generatedMeetLink = acceptTarget.meetLink || '';
      let generatedEventId = acceptTarget.calendarEventId || '';

      const finalDate = acceptTarget.counterDate || acceptTarget.date;
      const finalTime = acceptTarget.counterTimeSlot || acceptTarget.timeSlot;
      const finalPlace =
        acceptTarget.counterPlace || acceptTarget.meetingPlace || 'Google Meet (Virtual)';

      if (isVirtual || acceptAddCalendar) {
        const calResult = await createCalendarAppointmentEvent({
          accessToken: token,
          appt: ctx,
          ownerEmail: user.email || PROFILE_LINKS.email,
          durationMinutes: acceptDuration,
          hostNote: acceptHostNote,
          overrideDate: finalDate,
          overrideTimeSlot: finalTime,
          overridePlace: finalPlace,
        });
        generatedEventId = calResult.eventId;
        if (calResult.meetLink) {
          generatedMeetLink = calResult.meetLink;
        }
      }

      const ownerRecipients = Array.from(
        new Set(
          [user.email, PROFILE_LINKS.email]
            .filter((e): e is string => Boolean(e))
            .filter((e) => e.toLowerCase() !== ctx.clientEmail.toLowerCase())
        )
      );

      if (isVirtual) {
        const emailTpl = buildVirtualMeetAcceptedTemplate({
          appt: { ...ctx, date: finalDate, timeSlot: finalTime },
          meetLink: generatedMeetLink,
          durationMinutes: acceptDuration,
          hostNote: acceptHostNote,
        });
        await sendMultipartGmail({
          accessToken: token,
          to: [ctx.clientEmail],
          cc: ownerRecipients,
          subject: emailTpl.subject,
          textBody: emailTpl.textBody,
          htmlBody: emailTpl.htmlBody,
        });
      } else {
        const emailTpl = buildInPersonAcceptedTemplate({
          appt: ctx,
          finalDate,
          finalTimeSlot: finalTime,
          finalPlace,
          hostNote: acceptHostNote,
        });
        await sendMultipartGmail({
          accessToken: token,
          to: [ctx.clientEmail],
          cc: ownerRecipients,
          subject: emailTpl.subject,
          textBody: emailTpl.textBody,
          htmlBody: emailTpl.htmlBody,
        });
      }

      await updateDoc(doc(db, 'appointments', acceptTarget.id), {
        ...buildLegacyBackfillFields(acceptTarget),
        status: 'confirmed',
        meetLink: generatedMeetLink,
        calendarEventId: generatedEventId,
        updatedAt: serverTimestamp(),
      });

      setFeedbackMsg(
        isVirtual
          ? `Confirmed! Scheduled Google Meet link (${generatedMeetLink}) emailed to ${ctx.clientEmail} and you.`
          : `In-person meeting confirmed and emailed to ${ctx.clientEmail} (and copied to you).`
      );
      setAcceptTarget(null);
    } catch (error: unknown) {
      setDashboardError(
        error instanceof Error ? error.message : 'Failed to confirm appointment and send email.'
      );
    } finally {
      setAcceptProcessing(false);
    }
  };

  const executeCounterProposal = async () => {
    if (!counterTarget || !isAdmin || !user) return;
    const token = getGmailAccessToken();
    if (!token) {
      setDashboardError('Please click Reconnect Google Workspace before sending the counter-proposal email.');
      return;
    }

    if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(counterDateDraft.trim())) {
      setDashboardError('Please pick a valid proposed date (YYYY-MM-DD).');
      return;
    }
    if (counterTimeDraft.trim().length < 3 || counterPlaceDraft.trim().length < 2) {
      setDashboardError('Please provide both a proposed time and place.');
      return;
    }

    setCounterProcessing(true);
    setDashboardError(null);

    try {
      const ctx = normalizeAppointment(counterTarget);
      const cleanDate = counterDateDraft.trim();
      const cleanTime = counterTimeDraft.trim().slice(0, 40);
      const cleanPlace = counterPlaceDraft.trim().slice(0, 200);
      const cleanNote = counterNoteDraft.trim().slice(0, 1000);

      const tpl = buildInPersonCounterTemplate({
        appt: ctx,
        counter: {
          newDate: cleanDate,
          newTimeSlot: cleanTime,
          newPlace: cleanPlace,
          availabilityMessage: cleanNote,
        },
      });

      const ownerRecipients = Array.from(
        new Set(
          [user.email, PROFILE_LINKS.email]
            .filter((e): e is string => Boolean(e))
            .filter((e) => e.toLowerCase() !== ctx.clientEmail.toLowerCase())
        )
      );

      await sendMultipartGmail({
        accessToken: token,
        to: [ctx.clientEmail],
        cc: ownerRecipients,
        subject: tpl.subject,
        textBody: tpl.textBody,
        htmlBody: tpl.htmlBody,
      });

      await updateDoc(doc(db, 'appointments', counterTarget.id), {
        ...buildLegacyBackfillFields(counterTarget),
        status: 'counter_proposed',
        counterDate: cleanDate,
        counterTimeSlot: cleanTime,
        counterPlace: cleanPlace,
        counterNote: cleanNote,
        updatedAt: serverTimestamp(),
      });

      setFeedbackMsg(
        `Counter-proposal sent to ${ctx.clientEmail} for ${cleanDate} at ${cleanTime} (${cleanPlace}).`
      );
      setCounterTarget(null);
    } catch (error: unknown) {
      setDashboardError(
        error instanceof Error ? error.message : 'Failed to send counter-proposal email.'
      );
    } finally {
      setCounterProcessing(false);
    }
  };

  const loadGmailInbox = async () => {
    setGmailError(null);
    const token = getGmailAccessToken();
    if (!token) {
      setGmailError(
        'Sign in with Google again to authorize a fresh Gmail session token for reading messages.'
      );
      return;
    }
    setGmailLoading(true);
    try {
      const listRes = await fetch(
        'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=6',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!listRes.ok) {
        const err = await listRes.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Unable to load Gmail messages.');
      }
      const listJson = await listRes.json();
      const ids: Array<{ id: string }> = listJson.messages || [];
      const details = await Promise.all(
        ids.map(async ({ id }) => {
          const msgRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const msgJson = await msgRes.json();
          const headers: Array<{ name: string; value: string }> =
            msgJson.payload?.headers || [];
          const getHeader = (name: string) =>
            headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';
          return {
            id,
            subject: getHeader('Subject') || '(No subject)',
            from: getHeader('From') || 'Unknown sender',
            date: getHeader('Date') || '',
            snippet: msgJson.snippet || '',
          };
        })
      );
      setGmailMessages(details);
    } catch (error: unknown) {
      setGmailError(error instanceof Error ? error.message : 'Failed to fetch Gmail inbox.');
    } finally {
      setGmailLoading(false);
    }
  };

  const executeReplySend = async () => {
    if (!replyTarget) return;
    const token = getGmailAccessToken();
    if (!token) {
      setFeedbackMsg('Please sign in with Google again to refresh your Gmail send token.');
      setConfirmSendOpen(false);
      return;
    }

    setSendingReply(true);
    try {
      const raw = encodeReplyEmail(replyTarget.senderEmail, replySubject, replyBody);
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Gmail reply dispatch failed.');
      }

      await updateDoc(doc(db, 'inquiries', replyTarget.id), {
        status: 'replied',
        updatedAt: serverTimestamp(),
      });

      setFeedbackMsg(`Reply sent via Gmail to ${replyTarget.senderEmail}.`);
      setReplyTarget(null);
      setConfirmSendOpen(false);
    } catch (error: unknown) {
      setFeedbackMsg(error instanceof Error ? error.message : 'Failed to send reply.');
    } finally {
      setSendingReply(false);
    }
  };

  const publishSocialUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !isAdmin) return;

    const updateId = `soc_${Date.now()}`;
    try {
      await setDoc(doc(db, 'social_updates', updateId), {
        platform: socialPlatform,
        title: socialTitle.trim().slice(0, 140),
        caption: socialCaption.trim().slice(0, 1000),
        dateLabel: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        externalUrl: socialUrl.trim().slice(0, 300),
        category: socialCategory.trim().slice(0, 60) || 'Update',
        authorUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSocialTitle('');
      setSocialCaption('');
      setSocialNotice('Published new update to your live portfolio feed.');
    } catch (error: unknown) {
      setDashboardError(
        error instanceof Error ? error.message : 'Unable to publish social update.'
      );
    }
  };

  if (!user) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 text-center space-y-5">
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Owner Portal · Private CRM
          </p>
          <h1 className="font-display text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Sign in to manage leads, appointments & Gmail
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            This portal is restricted to Soumyajit Biswas. Visitors can submit inquiries and book
            slots directly on the portfolio without signing in.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <GoogleSignInButton onClick={handleLogin} loading={authLoading} />
            <button
              type="button"
              onClick={onBackToPortfolio}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              Return to Portfolio
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 sm:p-12 text-center space-y-5">
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
            Signed in as {user.email}
          </p>
          <h1 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Owner access required
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
            Lead management, appointment approvals, and Gmail controls are only enabled for
            Soumyajit’s verified owner accounts.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            <button
              type="button"
              onClick={onBackToPortfolio}
              className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              Return to Portfolio
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">
            Workspace / {isAdmin ? 'Admin Lead Console' : 'Client Submission Tracker'}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Inquiries & Appointment Operations
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{user.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800">
        <div className="p-5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Total Inquiries</p>
          <p className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
            {inquiries.length}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">New Unreviewed</p>
          <p className="font-mono text-2xl font-semibold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
            {inquiries.filter((i) => i.status === 'new').length}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Booked Calls</p>
          <p className="font-mono text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mt-1 tabular-nums">
            {appointments.length}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Confirmed Sessions</p>
          <p className="font-mono text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
            {appointments.filter((a) => a.status === 'confirmed').length}
          </p>
        </div>
      </div>

      {dashboardError && (
        <div className="rounded-lg border border-red-300 dark:border-red-900/70 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{dashboardError}</span>
          <button
            type="button"
            onClick={() => setDashboardError(null)}
            className="underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {feedbackMsg && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 text-xs text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
          <span>{feedbackMsg}</span>
          <button
            type="button"
            onClick={() => setFeedbackMsg(null)}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navigation Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setSection('inquiries');
              setStatusFilter('all');
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
              section === 'inquiries'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            Inquiries
          </button>
          <button
            type="button"
            onClick={() => {
              setSection('appointments');
              setStatusFilter('all');
            }}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
              section === 'appointments'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Appointments
          </button>
          <button
            type="button"
            onClick={() => setSection('gmail')}
            className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
              section === 'gmail'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            Gmail Inbox
          </button>
          {isAdmin && (
            <button
              type="button"
              onClick={() => setSection('social')}
              className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                section === 'social'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Post Update
            </button>
          )}
        </div>

        {(section === 'inquiries' || section === 'appointments') && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads..."
                className="pl-8 pr-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
            >
              <option value="all">All Statuses</option>
              {section === 'inquiries' ? (
                <>
                  <option value="new">New</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="replied">Replied</option>
                  <option value="archived">Archived</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="counter_proposed">Counter Proposed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </>
              )}
            </select>
          </div>
        )}
      </div>

      {/* Section: Inquiries Table + Inspector */}
      {section === 'inquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            {loadingData ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className="h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredInquiries.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  No matching inquiries yet
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Submitted project inquiries and contact messages will appear here in real time.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Sender</th>
                      <th className="px-4 py-3 font-medium">Topic</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {filteredInquiries.map((inq) => (
                      <tr
                        key={inq.id}
                        onClick={() => {
                          setSelectedInquiry(inq);
                          setNotesDraft(inq.adminNotes || '');
                        }}
                        className={`cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                          selectedInquiry?.id === inq.id ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {inq.senderName}
                          </p>
                          <p className="text-zinc-500 dark:text-zinc-400">{inq.senderEmail}</p>
                        </td>
                        <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{inq.topic}</td>
                        <td className="px-4 py-3 font-mono capitalize text-zinc-700 dark:text-zinc-300">
                          {inq.status}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-zinc-500 dark:text-zinc-400 tabular-nums">
                          {inq.createdAt?.toDate
                            ? inq.createdAt.toDate().toLocaleDateString('en-GB')
                            : 'Just now'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            {selectedInquiry ? (
              <div className="space-y-5">
                <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1">
                    {selectedInquiry.topic} · {selectedInquiry.company || 'Independent'}
                  </p>
                  <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedInquiry.senderName}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {selectedInquiry.senderEmail}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mb-1.5">
                    Message
                  </p>
                  <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>

                {isAdmin && (
                  <>
                    <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Update Lead Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {(['new', 'reviewed', 'replied', 'archived'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => void updateInquiryStatus(selectedInquiry, st)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border capitalize cursor-pointer ${
                              selectedInquiry.status === st
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                        Internal Notes
                      </label>
                      <textarea
                        rows={3}
                        value={notesDraft}
                        onChange={(e) => setNotesDraft(e.target.value)}
                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                      />
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => void saveAdminNotes()}
                          className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          Save Notes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setReplyTarget(selectedInquiry);
                            setReplySubject(`Re: ${selectedInquiry.topic} — Soumyajit Biswas`);
                            setReplyBody(
                              `Hi ${selectedInquiry.senderName},\n\nThanks for reaching out about ${selectedInquiry.topic}. `
                            );
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Reply via Gmail
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-zinc-500 dark:text-zinc-400">
                Select an inquiry row to inspect details, update status, or reply via Gmail.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Section: Appointments */}
      {section === 'appointments' && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          {filteredAppointments.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                No scheduled appointments found
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Booked consultation slots will appear here with confirmation controls.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Format & Venue / Meet</th>
                    <th className="px-4 py-3 font-medium">Schedule</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {filteredAppointments.map((appt) => {
                    const isInPerson = appt.meetingMode === 'in_person';
                    return (
                      <tr key={appt.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="px-4 py-3 align-top">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {appt.clientName}
                          </p>
                          <p className="text-zinc-500 dark:text-zinc-400">{appt.clientEmail}</p>
                        </td>
                        <td className="px-4 py-3 align-top text-zinc-700 dark:text-zinc-300 space-y-1">
                          <div className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-100">
                            {isInPerson ? (
                              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            ) : (
                              <Video className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                            <span>
                              {appt.meetingType} · {isInPerson ? 'In-Person' : 'Google Meet'}
                            </span>
                          </div>
                          {isInPerson && appt.meetingPlace && (
                            <p className="text-zinc-600 dark:text-zinc-400">
                              Place: {appt.counterPlace || appt.meetingPlace}
                            </p>
                          )}
                          {appt.meetLink && (
                            <a
                              href={appt.meetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              Join Google Meet
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {appt.notes && (
                            <p className="text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                              {appt.notes}
                            </p>
                          )}
                          {appt.counterNote && (
                            <p className="text-amber-700 dark:text-amber-300 max-w-xs">
                              Update note: {appt.counterNote}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top font-mono tabular-nums text-zinc-700 dark:text-zinc-300 space-y-1">
                          <p>
                            {appt.counterDate || appt.date} · {appt.counterTimeSlot || appt.timeSlot}
                          </p>
                          {appt.status === 'counter_proposed' && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400">
                              Orig: {appt.date} · {appt.timeSlot}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top font-mono capitalize text-zinc-700 dark:text-zinc-300">
                          {appt.status.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 align-top text-right">
                          <div className="inline-flex flex-wrap items-center justify-end gap-2">
                            {isAdmin &&
                              (appt.status === 'pending' || appt.status === 'counter_proposed') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => openAcceptModal(appt)}
                                    className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                                  >
                                    {isInPerson ? 'Accept' : 'Accept & Send Meet'}
                                  </button>
                                  {isInPerson && (
                                    <button
                                      type="button"
                                      onClick={() => openCounterModal(appt)}
                                      className="px-2.5 py-1 text-xs font-semibold rounded border border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer"
                                    >
                                      Counter Date / Place
                                    </button>
                                  )}
                                </>
                              )}
                            {isAdmin && appt.status === 'confirmed' && (
                              <button
                                type="button"
                                onClick={() => void updateAppointmentStatus(appt, 'completed')}
                                className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                              >
                                Complete
                              </button>
                            )}
                            {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                              <button
                                type="button"
                                onClick={() => void updateAppointmentStatus(appt, 'cancelled')}
                                className="px-2.5 py-1 text-xs font-medium rounded border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Section: Gmail Inbox Sync */}
      {section === 'gmail' && (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Connected Gmail Threads
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Read recent mailbox threads directly using your active Google OAuth session.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadGmailInbox()}
              disabled={gmailLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gmailLoading ? 'animate-spin' : ''}`} />
              Sync Gmail Messages
            </button>
          </div>

          {gmailError && (
            <div className="rounded-lg border border-amber-300 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-xs text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3">
              <span>{gmailError}</span>
              <GoogleSignInButton
                onClick={handleLogin}
                loading={authLoading}
                label="Re-connect Gmail"
              />
            </div>
          )}

          {gmailMessages.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 py-8 text-center">
              Click Sync Gmail Messages to load your latest 6 threads.
            </p>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border-t border-zinc-200 dark:border-zinc-800">
              {gmailMessages.map((msg) => (
                <div key={msg.id} className="py-4 space-y-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {msg.subject}
                    </h4>
                    <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      {msg.date}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{msg.from}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {msg.snippet}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Section: Publish Social Pulse (Admin Only) */}
      {section === 'social' && isAdmin && (
        <form
          onSubmit={publishSocialUpdate}
          className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 max-w-2xl space-y-4"
        >
          <h3 className="font-display text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Post a New Instagram / LinkedIn Update
          </h3>
          {socialNotice && (
            <p className="text-xs text-emerald-700 dark:text-emerald-400">{socialNotice}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1">Platform</label>
              <select
                value={socialPlatform}
                onChange={(e) => setSocialPlatform(e.target.value as 'instagram' | 'linkedin')}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              >
                <option value="instagram">Instagram</option>
                <option value="linkedin">LinkedIn</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Category</label>
              <input
                type="text"
                required
                maxLength={60}
                value={socialCategory}
                onChange={(e) => setSocialCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Headline</label>
            <input
              type="text"
              required
              maxLength={140}
              value={socialTitle}
              onChange={(e) => setSocialTitle(e.target.value)}
              placeholder="Dawn Mosel run + mountain hike outside Trier..."
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Caption</label>
            <textarea
              rows={3}
              required
              maxLength={1000}
              value={socialCaption}
              onChange={(e) => setSocialCaption(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Post URL</label>
            <input
              type="url"
              required
              maxLength={300}
              value={socialUrl}
              onChange={(e) => setSocialUrl(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            Publish to Live Portfolio
          </button>
        </form>
      )}

      {/* Reply via Gmail Composer Modal */}
      {replyTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">
              Reply to {replyTarget.senderName}
            </h3>
            <p className="text-xs font-mono text-zinc-500">To: {replyTarget.senderEmail}</p>
            <input
              type="text"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
            />
            <textarea
              rows={5}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm"
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReplyTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmSendOpen(true)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              >
                Review & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explicit Confirmation Modal before Gmail send */}
      {confirmSendOpen && replyTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
          <div className="max-w-md w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold">Confirm Gmail Dispatch</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Send this email directly from your connected Gmail account to{' '}
              <span className="font-mono text-zinc-900 dark:text-zinc-100">
                {replyTarget.senderEmail}
              </span>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmSendOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingReply}
                onClick={() => void executeReplySend()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {sendingReply ? 'Sending...' : 'Confirm & Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin-Only Accept Appointment Modal (Google Meet or In-Person Confirmation) */}
      {acceptTarget && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div>
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-1">
                {acceptTarget.meetingMode === 'in_person'
                  ? 'Accept In-Person Appointment'
                  : 'Accept & Schedule Google Meet'}
              </p>
              <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Confirm with {acceptTarget.clientName}
              </h3>
            </div>

            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 text-xs space-y-1.5">
              <p>
                <span className="text-zinc-500 dark:text-zinc-400">Requester:</span>{' '}
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {acceptTarget.clientEmail}
                </span>
              </p>
              <p>
                <span className="text-zinc-500 dark:text-zinc-400">Session:</span>{' '}
                {acceptTarget.meetingType}
              </p>
              <p className="font-mono tabular-nums">
                <span className="text-zinc-500 dark:text-zinc-400 font-sans">When:</span>{' '}
                {acceptTarget.counterDate || acceptTarget.date} ·{' '}
                {acceptTarget.counterTimeSlot || acceptTarget.timeSlot} ({acceptTarget.timezone})
              </p>
              {acceptTarget.meetingMode === 'in_person' ? (
                <p>
                  <span className="text-zinc-500 dark:text-zinc-400">Place:</span>{' '}
                  {acceptTarget.counterPlace || acceptTarget.meetingPlace}
                </p>
              ) : (
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Generates a live Google Meet link on Google Calendar and emails it to both{' '}
                  {acceptTarget.clientEmail} and you.
                </p>
              )}
            </div>

            {(!getGmailAccessToken() ||
              (acceptTarget.meetingMode !== 'in_person' && !hasCalendarAccessToken())) && (
              <div className="rounded-lg border border-amber-300 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-xs text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3">
                <span>
                  Reconnect your Google account to refresh Calendar & Gmail dispatch permissions.
                </span>
                <GoogleSignInButton
                  onClick={handleLogin}
                  loading={authLoading}
                  label="Reconnect Workspace"
                />
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Session Duration
                </label>
                <div className="flex gap-2">
                  {([30, 45, 60] as const).map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setAcceptDuration(mins)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-lg border cursor-pointer ${
                        acceptDuration === mins
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {acceptTarget.meetingMode === 'in_person' && (
                <label className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptAddCalendar}
                    onChange={(e) => setAcceptAddCalendar(e.target.checked)}
                    className="rounded border-zinc-300 dark:border-zinc-700 text-blue-600"
                  />
                  <span>Also create a Google Calendar invite with location</span>
                </label>
              )}

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Optional Note to Include in Email
                </label>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={acceptHostNote}
                  onChange={(e) => setAcceptHostNote(e.target.value)}
                  placeholder="Looking forward to connecting! Feel free to share any links beforehand..."
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setAcceptTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={acceptProcessing}
                onClick={() => void executeAcceptAppointment()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {acceptProcessing
                  ? 'Scheduling & Emailing...'
                  : acceptTarget.meetingMode === 'in_person'
                    ? 'Confirm & Send Email'
                    : 'Confirm & Send Meet Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin-Only In-Person Counter-Proposal Modal */}
      {counterTarget && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-4 max-h-[92vh] overflow-y-auto">
            <div>
              <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mb-1">
                In-Person Availability Counter-Proposal
              </p>
              <h3 className="font-display text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Suggest New Date, Time or Place to {counterTarget.clientName}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Original request: {counterTarget.date} · {counterTarget.timeSlot} ·{' '}
                {counterTarget.meetingPlace}
              </p>
            </div>

            {!getGmailAccessToken() && (
              <div className="rounded-lg border border-amber-300 dark:border-amber-900/70 bg-amber-50 dark:bg-amber-950/30 p-3.5 text-xs text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-between gap-3">
                <span>Reconnect Google Workspace to send this counter-proposal via Gmail.</span>
                <GoogleSignInButton
                  onClick={handleLogin}
                  loading={authLoading}
                  label="Reconnect Gmail"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Proposed Date
                </label>
                <input
                  type="date"
                  required
                  value={counterDateDraft}
                  onChange={(e) => setCounterDateDraft(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Proposed Time
                </label>
                <input
                  type="text"
                  required
                  maxLength={40}
                  value={counterTimeDraft}
                  onChange={(e) => setCounterTimeDraft(e.target.value)}
                  placeholder="e.g., 15:30 CET"
                  className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Proposed Place / Venue
              </label>
              <input
                type="text"
                required
                maxLength={200}
                value={counterPlaceDraft}
                onChange={(e) => setCounterPlaceDraft(e.target.value)}
                placeholder="e.g., Café am Dom, Trier or Universität Trier Campus"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Personal Availability Note
              </label>
              <textarea
                rows={3}
                maxLength={1000}
                value={counterNoteDraft}
                onChange={(e) => setCounterNoteDraft(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs"
              />
            </div>

            {/* Formatted Email Preview */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-4 text-xs space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Email Preview · To: {counterTarget.clientEmail}
              </p>
              <p className="text-zinc-800 dark:text-zinc-200">
                Hi {counterTarget.clientName},
                <br />
                <span className="text-zinc-600 dark:text-zinc-400">{counterNoteDraft}</span>
              </p>
              <div className="rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 font-mono text-[11px] space-y-1">
                <p>New Date: {counterDateDraft}</p>
                <p>New Time: {counterTimeDraft}</p>
                <p>New Place: {counterPlaceDraft}</p>
              </div>
              <p className="text-zinc-700 dark:text-zinc-300 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                Best regards,
                <br />
                <strong>Soumyajit Biswas</strong>
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCounterTarget(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={counterProcessing}
                onClick={() => void executeCounterProposal()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {counterProcessing ? 'Sending Email...' : 'Confirm & Send Counter-Proposal'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
