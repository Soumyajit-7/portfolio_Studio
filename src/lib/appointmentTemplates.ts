import { PROFILE_LINKS } from '../data/portfolioData';

export interface AppointmentEmailContext {
  id: string;
  clientName: string;
  clientEmail: string;
  meetingType: string;
  meetingMode: 'google_meet' | 'in_person';
  meetingPlace: string;
  date: string;
  timeSlot: string;
  timezone: string;
  notes: string;
}

export interface CounterProposalInput {
  newDate: string;
  newTimeSlot: string;
  newPlace: string;
  availabilityMessage: string;
}

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function base64UrlEncodeUtf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function encodeRfc2047Subject(subject: string): string {
  // Encode non-ASCII subjects cleanly for Gmail headers
  if (/^[\x20-\x7E]*$/.test(subject)) return subject;
  const bytes = new TextEncoder().encode(subject);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return `=?UTF-8?B?${btoa(binary)}?=`;
}

export function resolveIanaTimeZone(timezoneInput: string): string {
  const trimmed = timezoneInput.trim();
  const candidates: string[] = [];

  // Extract token before parentheses if formatted like "Europe/Berlin (CET)"
  const firstPart = trimmed.split('(')[0]?.trim();
  if (firstPart) candidates.push(firstPart);
  if (trimmed) candidates.push(trimmed);

  const upper = trimmed.toUpperCase();
  if (upper.includes('CET') || upper.includes('CEST') || upper.includes('BERLIN') || upper.includes('TRIER')) {
    candidates.push('Europe/Berlin');
  } else if (upper.includes('IST') || upper.includes('KOLKATA') || upper.includes('INDIA')) {
    candidates.push('Asia/Kolkata');
  } else if (upper.includes('UTC') || upper.includes('GMT')) {
    candidates.push('UTC');
  }

  for (const tz of candidates) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz });
      return tz;
    } catch {
      // Try next candidate
    }
  }
  return 'Europe/Berlin';
}

export function parseTimeSlotTo24Hour(timeSlot: string): { hour: number; minute: number } {
  const match = timeSlot.trim().match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!match) {
    return { hour: 14, minute: 0 };
  }
  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hour < 12) hour += 12;
  if (meridiem === 'AM' && hour === 12) hour = 0;

  if (Number.isNaN(hour) || hour < 0 || hour > 23) hour = 14;
  if (Number.isNaN(minute) || minute < 0 || minute > 59) return { hour, minute: 0 };
  return { hour, minute };
}

export function buildCalendarDateTimeRange(
  dateIso: string,
  timeSlot: string,
  timezoneInput: string,
  durationMinutes = 30
): {
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
} {
  const timeZone = resolveIanaTimeZone(timezoneInput);
  const { hour, minute } = parseTimeSlotTo24Hour(timeSlot);
  const [y, m, d] = dateIso.split('-').map(Number);

  const pad = (n: number) => String(n).padStart(2, '0');
  const startStr = `${y}-${pad(m)}-${pad(d)}T${pad(hour)}:${pad(minute)}:00`;

  // Use UTC Date purely for calendar arithmetic (without shifting wall-clock timezone)
  const endDate = new Date(Date.UTC(y, m - 1, d, hour, minute + durationMinutes, 0));
  const endStr = `${endDate.getUTCFullYear()}-${pad(endDate.getUTCMonth() + 1)}-${pad(
    endDate.getUTCDate()
  )}T${pad(endDate.getUTCHours())}:${pad(endDate.getUTCMinutes())}:00`;

  return {
    start: { dateTime: startStr, timeZone },
    end: { dateTime: endStr, timeZone },
  };
}

export async function createCalendarAppointmentEvent(params: {
  accessToken: string;
  appt: AppointmentEmailContext;
  ownerEmail: string;
  durationMinutes?: number;
  hostNote?: string;
  overrideDate?: string;
  overrideTimeSlot?: string;
  overridePlace?: string;
}): Promise<{ eventId: string; meetLink: string; htmlLink: string }> {
  const {
    accessToken,
    appt,
    ownerEmail,
    durationMinutes = 30,
    hostNote = '',
    overrideDate,
    overrideTimeSlot,
    overridePlace,
  } = params;

  const finalDate = overrideDate || appt.date;
  const finalTime = overrideTimeSlot || appt.timeSlot;
  const finalPlace = overridePlace || appt.meetingPlace;

  const { start, end } = buildCalendarDateTimeRange(
    finalDate,
    finalTime,
    appt.timezone,
    durationMinutes
  );

  const attendees = [{ email: appt.clientEmail, displayName: appt.clientName }];
  if (ownerEmail && ownerEmail.toLowerCase() !== appt.clientEmail.toLowerCase()) {
    attendees.push({ email: ownerEmail, displayName: 'Soumyajit Biswas' });
  }
  if (
    PROFILE_LINKS.email.toLowerCase() !== ownerEmail.toLowerCase() &&
    PROFILE_LINKS.email.toLowerCase() !== appt.clientEmail.toLowerCase()
  ) {
    attendees.push({ email: PROFILE_LINKS.email, displayName: 'Soumyajit Biswas' });
  }

  const descriptionParts = [
    `Session: ${appt.meetingType}`,
    appt.meetingMode === 'google_meet'
      ? 'Format: Google Meet (Online Video)'
      : `Format: In-Person at ${finalPlace}`,
    appt.notes ? `Requester Notes: ${appt.notes}` : '',
    hostNote.trim() ? `Note from Soumyajit: ${hostNote.trim()}` : '',
    '',
    'Scheduled via Soumyajit Biswas Portfolio',
  ].filter((line, idx, arr) => line !== '' || (idx > 0 && arr[idx - 1] !== ''));

  const payload: Record<string, unknown> = {
    summary: `${appt.meetingType} — ${appt.clientName} & Soumyajit Biswas`,
    description: descriptionParts.join('\n'),
    start,
    end,
    attendees,
  };

  if (appt.meetingMode === 'google_meet') {
    payload.conferenceData = {
      createRequest: {
        requestId: `meet-${appt.id}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  } else {
    payload.location = finalPlace;
  }

  const queryParams = new URLSearchParams({
    sendUpdates: 'all',
    ...(appt.meetingMode === 'google_meet' ? { conferenceDataVersion: '1' } : {}),
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${queryParams.toString()}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const apiMsg = errJson.error?.message || `Google Calendar API returned ${res.status}.`;
    throw new Error(
      res.status === 401 || res.status === 403
        ? `Calendar permission missing or expired (${apiMsg}). Please reconnect Google Workspace below.`
        : apiMsg
    );
  }

  const data = (await res.json()) as {
    id?: string;
    hangoutLink?: string;
    htmlLink?: string;
    conferenceData?: {
      entryPoints?: Array<{ entryPointType?: string; uri?: string }>;
    };
  };

  const videoEntry = data.conferenceData?.entryPoints?.find(
    (e) => e.entryPointType === 'video' && e.uri
  )?.uri;
  const meetLink = data.hangoutLink || videoEntry || '';

  if (appt.meetingMode === 'google_meet' && !meetLink) {
    throw new Error(
      'Google Calendar created the event, but no Google Meet link was returned. Please verify Google Meet is enabled for this Google account.'
    );
  }

  return {
    eventId: data.id || '',
    meetLink,
    htmlLink: data.htmlLink || '',
  };
}

export async function sendMultipartGmail(params: {
  accessToken: string;
  to: string[];
  cc?: string[];
  subject: string;
  textBody: string;
  htmlBody: string;
}): Promise<void> {
  const { accessToken, to, cc = [], subject, textBody, htmlBody } = params;
  const boundary = `sb_boundary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const headers = [
    `To: ${to.join(', ')}`,
    ...(cc.length > 0 ? [`Cc: ${cc.join(', ')}`] : []),
    `Subject: ${encodeRfc2047Subject(subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];

  const rawMime = [
    ...headers,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    textBody,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ].join('\r\n');

  const raw = base64UrlEncodeUtf8(rawMime);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    const apiMsg = errJson.error?.message || `Gmail API returned ${res.status}.`;
    throw new Error(
      res.status === 401 || res.status === 403
        ? `Gmail permission missing or expired (${apiMsg}). Please reconnect Google Workspace below.`
        : apiMsg
    );
  }
}

function wrapHtmlShell(badgeLabel: string, heading: string, innerHtml: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:24px;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e4e4e7;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="padding:24px 28px;border-bottom:1px solid #e4e4e7;">
          <p style="margin:0 0 6px;font-size:11px;font-family:ui-monospace,monospace;letter-spacing:0.06em;text-transform:uppercase;color:#2563eb;">${escapeHtml(
            badgeLabel
          )}</p>
          <h1 style="margin:0;font-size:20px;line-height:1.3;font-weight:700;color:#09090b;">${escapeHtml(
            heading
          )}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:24px 28px;font-size:14px;line-height:1.65;color:#27272a;">
          ${innerHtml}
          <div style="margin-top:24px;padding-top:18px;border-top:1px solid #e4e4e7;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#09090b;">Soumyajit Biswas</p>
            <p style="margin:2px 0 0;font-size:12px;color:#52525b;">M.Sc. Data Science, Universität Trier · Co-Founder, Choreos Labs</p>
            <p style="margin:2px 0 0;font-size:12px;color:#52525b;">${escapeHtml(
              PROFILE_LINKS.email
            )} · ${escapeHtml(PROFILE_LINKS.phone)}</p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function buildVirtualMeetAcceptedTemplate(params: {
  appt: AppointmentEmailContext;
  meetLink: string;
  durationMinutes: number;
  hostNote?: string;
}): { subject: string; textBody: string; htmlBody: string } {
  const { appt, meetLink, durationMinutes, hostNote = '' } = params;
  const subject = `Confirmed: ${appt.meetingType} on Google Meet — ${appt.date} (${appt.timeSlot})`;

  const textBody = [
    `Hi ${appt.clientName},`,
    '',
    `Your ${appt.meetingType} appointment with Soumyajit Biswas is confirmed.`,
    '',
    `Format: Google Meet (${durationMinutes} mins)`,
    `Date: ${appt.date}`,
    `Time: ${appt.timeSlot} (${appt.timezone})`,
    `Google Meet Link: ${meetLink}`,
    ...(appt.notes ? [`Your Notes: ${appt.notes}`] : []),
    ...(hostNote.trim() ? [`Note from Soumyajit: ${hostNote.trim()}`] : []),
    '',
    'A Google Calendar invite with this Meet link has also been dispatched to both of our calendars.',
    '',
    'Best regards,',
    'Soumyajit Biswas',
    'M.Sc. Data Science, Universität Trier · Co-Founder, Choreos Labs',
    `${PROFILE_LINKS.email} · ${PROFILE_LINKS.phone}`,
  ].join('\n');

  const htmlBody = wrapHtmlShell(
    'Appointment Confirmed · Google Meet',
    `${appt.meetingType} with Soumyajit Biswas`,
    `
      <p style="margin:0 0 14px;">Hi ${escapeHtml(appt.clientName)},</p>
      <p style="margin:0 0 16px;">Your virtual session is confirmed. Both of us have received the scheduled calendar invite and Google Meet link below:</p>
      <div style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:10px;padding:16px;margin:0 0 18px;font-size:13px;">
        <p style="margin:0 0 6px;"><strong>Date:</strong> ${escapeHtml(appt.date)}</p>
        <p style="margin:0 0 6px;"><strong>Time:</strong> ${escapeHtml(appt.timeSlot)} (${escapeHtml(
      appt.timezone
    )}) · ${durationMinutes} mins</p>
        <p style="margin:0;"><strong>Google Meet:</strong> <a href="${escapeHtml(
          meetLink
        )}" style="color:#2563eb;text-decoration:underline;">${escapeHtml(meetLink)}</a></p>
      </div>
      <p style="margin:0 0 18px;">
        <a href="${escapeHtml(
          meetLink
        )}" style="display:inline-block;background:#2563eb;color:#ffffff;font-weight:600;font-size:13px;padding:10px 18px;border-radius:8px;text-decoration:none;">Join Google Meet</a>
      </p>
      ${
        hostNote.trim()
          ? `<p style="margin:0 0 12px;"><strong>Note:</strong> ${escapeHtml(hostNote.trim())}</p>`
          : ''
      }
      <p style="margin:0;color:#52525b;font-size:13px;">Looking forward to speaking with you.</p>
    `
  );

  return { subject, textBody, htmlBody };
}

export function buildInPersonAcceptedTemplate(params: {
  appt: AppointmentEmailContext;
  finalDate: string;
  finalTimeSlot: string;
  finalPlace: string;
  hostNote?: string;
}): { subject: string; textBody: string; htmlBody: string } {
  const { appt, finalDate, finalTimeSlot, finalPlace, hostNote = '' } = params;
  const subject = `Confirmed (In-Person): ${appt.meetingType} at ${finalPlace} — ${finalDate}`;

  const textBody = [
    `Hi ${appt.clientName},`,
    '',
    `Your in-person ${appt.meetingType} meeting with Soumyajit Biswas is confirmed.`,
    '',
    `Date: ${finalDate}`,
    `Time: ${finalTimeSlot} (${appt.timezone})`,
    `Location: ${finalPlace}`,
    ...(appt.notes ? [`Agenda Notes: ${appt.notes}`] : []),
    ...(hostNote.trim() ? [`Note from Soumyajit: ${hostNote.trim()}`] : []),
    '',
    'See you there—feel free to reply to this email if anything changes on the day.',
    '',
    'Best regards,',
    'Soumyajit Biswas',
    'M.Sc. Data Science, Universität Trier · Co-Founder, Choreos Labs',
    `${PROFILE_LINKS.email} · ${PROFILE_LINKS.phone}`,
  ].join('\n');

  const htmlBody = wrapHtmlShell(
    'Appointment Confirmed · In-Person',
    `${appt.meetingType} — In-Person Meeting`,
    `
      <p style="margin:0 0 14px;">Hi ${escapeHtml(appt.clientName)},</p>
      <p style="margin:0 0 16px;">Looking forward to meeting in person. Here are our confirmed details:</p>
      <div style="background:#f4f4f5;border:1px solid #e4e4e7;border-radius:10px;padding:16px;margin:0 0 18px;font-size:13px;">
        <p style="margin:0 0 6px;"><strong>Date:</strong> ${escapeHtml(finalDate)}</p>
        <p style="margin:0 0 6px;"><strong>Time:</strong> ${escapeHtml(finalTimeSlot)} (${escapeHtml(
      appt.timezone
    )})</p>
        <p style="margin:0;"><strong>Place:</strong> ${escapeHtml(finalPlace)}</p>
      </div>
      ${
        hostNote.trim()
          ? `<p style="margin:0 0 12px;"><strong>Note:</strong> ${escapeHtml(hostNote.trim())}</p>`
          : ''
      }
      <p style="margin:0;color:#52525b;font-size:13px;">Feel free to reply directly to this thread if anything shifts on the day.</p>
    `
  );

  return { subject, textBody, htmlBody };
}

export function buildInPersonCounterTemplate(params: {
  appt: AppointmentEmailContext;
  counter: CounterProposalInput;
}): { subject: string; textBody: string; htmlBody: string } {
  const { appt, counter } = params;
  const subject = `Schedule / Place Update: ${appt.meetingType} with Soumyajit Biswas`;
  const customNote =
    counter.availabilityMessage.trim() ||
    'Based on my availability, could we adjust our in-person meeting to the date, time, and place below?';

  const textBody = [
    `Hi ${appt.clientName},`,
    '',
    `Thanks for booking an in-person ${appt.meetingType} session.`,
    '',
    customNote,
    '',
    'Proposed Updated Details:',
    `  New Date: ${counter.newDate}`,
    `  New Time: ${counter.newTimeSlot} (${appt.timezone})`,
    `  New Place: ${counter.newPlace}`,
    '',
    'Original Request:',
    `  ${appt.date} · ${appt.timeSlot} · ${appt.meetingPlace}`,
    '',
    'Please reply to this email to let me know if this updated slot and place work for you, or suggest an alternative.',
    '',
    'Best regards,',
    'Soumyajit Biswas',
    'M.Sc. Data Science, Universität Trier · Co-Founder, Choreos Labs',
    `${PROFILE_LINKS.email} · ${PROFILE_LINKS.phone}`,
  ].join('\n');

  const htmlBody = wrapHtmlShell(
    'Counter-Proposal · In-Person Appointment',
    `Proposed Update for Your ${appt.meetingType}`,
    `
      <p style="margin:0 0 14px;">Hi ${escapeHtml(appt.clientName)},</p>
      <p style="margin:0 0 16px;">Thanks for reaching out to meet in person. ${escapeHtml(
        customNote
      )}</p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:0 0 14px;font-size:13px;">
        <p style="margin:0 0 8px;font-size:11px;font-family:ui-monospace,monospace;text-transform:uppercase;color:#1d4ed8;">Proposed Availability</p>
        <p style="margin:0 0 6px;"><strong>Date:</strong> ${escapeHtml(counter.newDate)}</p>
        <p style="margin:0 0 6px;"><strong>Time:</strong> ${escapeHtml(
          counter.newTimeSlot
        )} (${escapeHtml(appt.timezone)})</p>
        <p style="margin:0;"><strong>Place:</strong> ${escapeHtml(counter.newPlace)}</p>
      </div>
      <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:12px 14px;margin:0 0 16px;font-size:12px;color:#52525b;">
        <strong>Original request:</strong> ${escapeHtml(appt.date)} · ${escapeHtml(
      appt.timeSlot
    )} · ${escapeHtml(appt.meetingPlace)}
      </div>
      <p style="margin:0;font-size:13px;color:#3f3f46;">Just reply directly to this email if this works for you (or let me know another window that fits your schedule).</p>
    `
  );

  return { subject, textBody, htmlBody };
}
