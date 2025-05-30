import { useState, useRef } from 'react';
import { supabase } from '../../supabase/client';

export default function DailyReports() {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const reportRef = useRef(null);
  const user = JSON.parse(localStorage.getItem('user'));
  const businessId = localStorage.getItem('business_id');
  const today = new Date().toLocaleDateString();

  const handleSubmit = async () => {
    const { error } = await supabase.from('daily_reports').insert({
      submitted_by: user.id,
      business_id: businessId,
      reason,
    });

    if (!error) setSubmitted(true);
  };

  const handlePrint = () => {
    const printContent = reportRef.current.innerHTML;
    const win = window.open('', '', 'width=900,height=650');
    win.document.write(`
      <html>
        <head>
          <title>Daily Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 2rem; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleWhatsApp = () => {
    const msg = `📝 Daily Report\n👤 ${user.user_metadata.name || user.email}\n📅 ${today}\n🗒️ ${reason}`;
    const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">📝 Submit Daily Report</h2>

      {submitted ? (
        <>
          <div ref={reportRef} className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title">Submitted Report</h5>
              <p><strong>User:</strong> {user.user_metadata.name || user.email}</p>
              <p><strong>Date:</strong> {today}</p>
              <p><strong>Notes:</strong> {reason}</p>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-12 col-md-6">
              <button className="btn btn-outline-primary w-100" onClick={handlePrint}>
                🖨 Print Report
              </button>
            </div>
            <div className="col-12 col-md-6">
              <button className="btn btn-success w-100" onClick={handleWhatsApp}>
                📤 Share via WhatsApp
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="row">
          <div className="col-12 col-lg-8 mx-auto">
            <textarea
              className="form-control mb-3"
              placeholder="Add any issues or notes from today..."
              rows="5"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <button className="btn btn-success w-100" onClick={handleSubmit}>
              ✅ Submit Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
