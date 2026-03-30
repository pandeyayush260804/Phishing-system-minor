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

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Flag className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Report Suspicious Content</h2>
      </div>

      {submitted ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-green-800 mb-2">Report Submitted Successfully</h3>
          <p className="text-green-700">
            Thank you for helping keep everyone safe. Your report will be reviewed by our security team.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['url', 'email', 'sms', 'other'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setReportType(type)}
                  className={`px-4 py-2 rounded-lg border-2 transition-colors capitalize ${
                    reportType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suspicious Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the suspicious URL, email content, or message here..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Optional: Provide your email if you'd like updates on this report
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                <Flag className="w-5 h-5" />
                Submit Report
              </>
            )}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>What happens next?</strong> Your report will be analyzed by our ML system and reviewed by security experts. If confirmed as a threat, it will be added to our threat database to protect others.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
