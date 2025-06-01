import { useState, useRef } from 'react';
import { supabase }         from '../../supabase/client';

export default function DailyReports() {
  // ─────────── STATE ───────────
  const [text, setText]        = useState('');       // Notes / issues
  const [msg, setMsg]          = useState({ ok: false, err: '' });
  const [loading, setLoading]  = useState(false);
  const refPrint               = useRef(null);

  // Grab logged-in user and business_id from localStorage
  const user        = JSON.parse(localStorage.getItem('user'));
  const business_id = localStorage.getItem('business_id');
  const todayISO    = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

  // ─────────── HANDLE FORM SUBMIT ───────────
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg({ ok: false, err: '' });

    // 1) Duplicate Guard: has this user already submitted today?
    const { data: existing, error: fetchErr } = await supabase
      .from('daily_reports')
      .select('id')
      .eq('submitted_by', user.id)
      .eq('date', todayISO)
      .limit(1);

    if (fetchErr) {
      setMsg({ ok: false, err: fetchErr.message });
      setLoading(false);
      return;
    }
    if (existing?.length) {
      setMsg({ ok: false, err: '❌ You already submitted today.' });
      setLoading(false);
      return;
    }

    // 2) Insert new daily report
    const { error: insertErr } = await supabase
      .from('daily_reports')
      .insert({
        submitted_by: user.id,
        business_id,
        date: todayISO,
        reason: text.trim(),
      });

    if (insertErr) {
      setMsg({ ok: false, err: `❌ ${insertErr.message}` });
    } else {
      setMsg({ ok: true, err: '' });
      // We do NOT clear `text` because we want to show it in the printable section
      // setText('');
    }

    setLoading(false);
  }

  // ─────────── PRINT FUNCTION ───────────
  function handlePrint() {
    if (!refPrint.current) return;
    const printContents = refPrint.current.innerHTML;
    const newWin = window.open('', '_blank', 'width=800,height=600');
    newWin.document.write(`
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Daily Report - ${todayISO}</title>
          <link
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
            rel="stylesheet"
          />
          <style>body { margin: 1rem; font-family: Arial, sans-serif; }</style>
        </head>
        <body>
          <div class="container">
            <h1>Daily Report</h1>
            <div>${printContents}</div>
          </div>
        </body>
      </html>
    `);
    newWin.document.close();
    newWin.focus();
    newWin.print();
    newWin.close();
  }

  // ─────────── SHARE VIA WHATSAPP ───────────
  function handleWhatsAppShare() {
    const shareText = encodeURIComponent(
      `📝 Daily Report for ${todayISO}\n\n${text}`
    );
    window.open(`https://wa.me/?text=${shareText}`, '_blank');
  }

  // ─────────── RENDER ───────────
  return (
    <div className="container py-4">
      <h2 className="text-center mb-4">📝 Daily Report</h2>

      {/* Success / Error Messages */}
      {msg.err && <div className="alert alert-danger">{msg.err}</div>}
      {msg.ok && <div className="alert alert-success">✅ Submitted!</div>}

      {/* FORM: Notes / Issues */}
      <form onSubmit={handleSubmit}>
        <textarea
          className="form-control mb-3"
          rows="4"
          placeholder="Add any issues, summary, or notes..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <button
          className="btn btn-success w-100 mb-2"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Saving…' : 'Submit Report'}
        </button>
      </form>

      {/* Once submitted, show the printed report & share buttons */}
      {msg.ok && (
        <div className="mt-4">
          {/* Printable content */}
          <div ref={refPrint} className="card shadow-sm mb-3">
            <div className="card-body">
              <p>
                <strong>User:</strong>{' '}
                {user.user_metadata?.name || user.email}
              </p>
              <p>
                <strong>Date:</strong> {todayISO}
              </p>
              <p>
                <strong>Notes:</strong>
              </p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
            </div>
          </div>

          {/* Print & WhatsApp Buttons */}
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={handlePrint}
            >
              🖨 Print Report
            </button>
            <button
              className="btn btn-outline-success"
              onClick={handleWhatsAppShare}
            >
              📤 Share via WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
