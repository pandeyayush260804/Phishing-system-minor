import { Brain } from 'lucide-react';
import { useState } from 'react';

export default function AIExplanation() {
  const [input, setInput] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const generateExplanation = () => {
    if (!input.trim()) return;

    setLoading(true);

    // 🔥 simple logic (you can later replace with OpenAI API)
    setTimeout(() => {
      let result = '';

      if (input.includes('http') || input.includes('www')) {
        result = `
This URL appears suspicious due to:

• Possible use of URL shortening or obfuscation  
• Lack of HTTPS security  
• Presence of misleading domain patterns  

Recommendation: Avoid visiting this link.
        `;
      } else {
        result = `
This content shows phishing characteristics:

• Urgency or pressure language  
• Requests for sensitive information  
• Suspicious instructions or links  

Recommendation: Do not trust or respond to this message.
        `;
      }

      setExplanation(result);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6">

      <div className="flex items-center gap-3 mb-6">
        <Brain className="text-blue-400" />
        <h2 className="text-xl font-bold text-white">AI Explanation</h2>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste URL or content..."
        className="w-full p-3 bg-[#020617] border border-slate-700 rounded-xl text-white"
        rows={5}
      />

      <button
        onClick={generateExplanation}
        className="mt-4 w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl"
      >
        {loading ? 'Analyzing...' : 'Explain Threat'}
      </button>

      {explanation && (
        <div className="mt-6 bg-[#020617] border border-slate-800 rounded-xl p-4">
          <h4 className="text-blue-400 mb-2">AI Analysis</h4>
          <pre className="text-sm text-slate-300 whitespace-pre-wrap">
            {explanation}
          </pre>
        </div>
      )}
    </div>
  );
}