import { useState } from 'react';
import {
  Flag,
  CheckCircle,
  Loader2,
  Link as LinkIcon,
  Mail,
  MessageSquare,
  FileWarning,
  Send,
} from 'lucide-react';

import { submitReport } from '../lib/supabase';

type ReportType = 'url' | 'email' | 'sms' | 'other';

export default function ReportForm() {
  const [reportType, setReportType] = useState<ReportType>('url');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reportTypes: {
    type: ReportType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'url',
      label: 'Suspicious URL',
      description: 'Report a phishing or malicious website',
      icon: <LinkIcon className="w-5 h-5" />,
    },
    {
      type: 'email',
      label: 'Phishing Email',
      description: 'Report a suspicious email',
      icon: <Mail className="w-5 h-5" />,
    },
    {
      type: 'sms',
      label: 'Suspicious SMS',
      description: 'Report a malicious text message',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      type: 'other',
      label: 'Other',
      description: 'Report another suspicious threat',
      icon: <FileWarning className="w-5 h-5" />,
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);

    try {
      await submitReport(
        reportType,
        content.trim(),
        email.trim() || undefined
      );

      setSubmitted(true);
      setContent('');
      setEmail('');

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#0B1220] p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.06] via-transparent to-transparent pointer-events-none" />

          <div className="relative flex flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-5">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>

            <h2 className="text-2xl font-semibold text-white mb-2">
              Report Submitted Successfully
            </h2>

            <p className="text-sm text-slate-400 max-w-md">
              Thank you for helping improve the security of the community.
              Your report has been received and will be reviewed.
            </p>

            <div className="mt-6 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-xs text-emerald-400">
                Threat intelligence database updated
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Flag className="w-5 h-5 text-blue-400" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-white">
              Report a Threat
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Help protect others by reporting suspicious content
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-6">
            {/* Report Type */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-white">
                  What would you like to report?
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Select the type of suspicious content
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reportTypes.map((item) => {
                  const selected = reportType === item.type;

                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setReportType(item.type)}
                      className={`
                        relative text-left p-4 rounded-xl border transition-all duration-200
                        ${
                          selected
                            ? 'border-blue-500/60 bg-blue-500/[0.08]'
                            : 'border-slate-800 bg-[#080E1A] hover:border-slate-700 hover:bg-slate-800/40'
                        }
                      `}
                    >
                      {selected && (
                        <div className="absolute top-3 right-3">
                          <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.7)]" />
                        </div>
                      )}

                      <div
                        className={`
                          flex h-9 w-9 items-center justify-center rounded-lg mb-3
                          ${
                            selected
                              ? 'bg-blue-500/15 text-blue-400'
                              : 'bg-slate-800/70 text-slate-400'
                          }
                        `}
                      >
                        {item.icon}
                      </div>

                      <div
                        className={`text-sm font-medium ${
                          selected ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {item.label}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {item.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-white">
                  Suspicious Content
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Provide the URL, email, SMS, or other suspicious content
                </p>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  reportType === 'url'
                    ? 'https://example.com/suspicious-link'
                    : reportType === 'email'
                    ? 'Paste the suspicious email content here...'
                    : reportType === 'sms'
                    ? 'Paste the suspicious SMS message here...'
                    : 'Describe or paste the suspicious content here...'
                }
                rows={9}
                disabled={loading}
                required
                className="
                  w-full rounded-xl
                  border border-slate-800
                  bg-[#060B14]
                  px-4 py-4
                  text-sm text-slate-200
                  placeholder:text-slate-600
                  outline-none
                  resize-none
                  transition
                  focus:border-blue-500/50
                  focus:ring-2
                  focus:ring-blue-500/10
                  disabled:opacity-50
                "
              />

              <div className="flex justify-between items-center mt-3">
                <span className="text-xs text-slate-600">
                  Do not include passwords or other sensitive information.
                </span>

                <span className="text-xs text-slate-600">
                  {content.length} characters
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-6">
            {/* Email */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/70">
                  <Mail className="w-4 h-4 text-slate-400" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Contact Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Optional
                  </p>
                </div>
              </div>

              <label className="block text-xs font-medium text-slate-400 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                className="
                  w-full rounded-xl
                  border border-slate-800
                  bg-[#060B14]
                  px-4 py-3
                  text-sm text-white
                  placeholder:text-slate-600
                  outline-none
                  focus:border-blue-500/50
                  focus:ring-2
                  focus:ring-blue-500/10
                  transition
                  disabled:opacity-50
                "
              />

              <p className="text-[11px] leading-relaxed text-slate-600 mt-2">
                Provide your email if you'd like to receive updates about
                your report.
              </p>
            </div>

            {/* Submit */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B1220] p-6">
              <button
                type="submit"
                disabled={loading || !content.trim()}
                className="
                  w-full
                  flex items-center justify-center gap-2
                  rounded-xl
                  bg-blue-500
                  hover:bg-blue-400
                  disabled:bg-slate-800
                  disabled:text-slate-600
                  disabled:cursor-not-allowed
                  px-4 py-3
                  text-sm font-semibold text-white
                  transition-all duration-200
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>

            {/* What happens next */}
            <div className="rounded-2xl border border-blue-500/10 bg-blue-500/[0.04] p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                  <CheckCircle className="w-4 h-4 text-blue-400" />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-blue-400 mb-2">
                    What happens next?
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-500">
                    Your submission is analyzed and reviewed. Confirmed
                    threats may be added to the threat intelligence database
                    to help protect other users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}