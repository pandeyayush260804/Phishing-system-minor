import { useState } from 'react';
import { Flag, CheckCircle, Loader2 } from 'lucide-react';
import { submitReport } from '../lib/supabase';

export default function ReportForm() {
  const [reportType, setReportType] = useState<'url' | 'email' | 'sms' | 'other'>('url');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setLoading(true);
    try {
      await submitReport(reportType, content, email || undefined);
      setSubmitted(true);
      setContent('');
      setEmail('');

      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <Flag className="w-7 h-7 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Report Threat</h2>
      </div>

      {submitted ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <CheckCircle className="w-14 h-14 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-400 mb-2">
            Report Submitted
          </h3>
          <p className="text-slate-300">
            Thanks for helping improve security. Your report will be reviewed.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TYPE */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Report Type
            </label>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['url', 'email', 'sms', 'other'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReportType(type)}
                  className={`px-4 py-2 rounded-lg border transition-all capitalize ${
                    reportType === type
                      ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                      : 'border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Suspicious Content
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste suspicious URL, email, or message..."
              rows={6}
              className="w-full px-4 py-3 bg-[#020617] border border-slate-700 rounded-xl text-white 
              focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              required
              disabled={loading}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Your Email (Optional)
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 bg-[#020617] border border-slate-700 rounded-xl text-white 
              focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={loading}
            />

            <p className="text-xs text-slate-500 mt-1">
              Optional: receive updates about this report
            </p>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 
            hover:scale-[1.02] transition-all duration-200 font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Flag className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>

          {/* INFO */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <p className="text-sm text-slate-300">
              <strong className="text-blue-400">What happens next?</strong><br />
              Your report is analyzed and added to the threat database if confirmed.
            </p>
          </div>

        </form>
      )}
    </div>
  );
}