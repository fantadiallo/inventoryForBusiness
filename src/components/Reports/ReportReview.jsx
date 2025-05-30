import { useEffect, useState } from 'react';
import { supabase } from '../../supabase/client';

export default function ReportReview() {
  const [reports, setReports] = useState([]);
  const businessId = localStorage.getItem('business_id');

  useEffect(() => {
    async function fetchReports() {
      const { data } = await supabase
        .from('daily_reports')
        .select('*, users(name)')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      setReports(data || []);
    }

    fetchReports();
  }, [businessId]);

  const approveReport = async (id) => {
    await supabase.from('daily_reports').update({ approved: true }).eq('id', id);
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, approved: true } : r)));
  };

  return (
    <div className="container py-4">
      <h2>📋 Submitted Daily Reports</h2>
      {reports.length === 0 ? (
        <p>No reports submitted yet.</p>
      ) : (
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>User</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td>{report.users?.name || report.submitted_by}</td>
                <td>{new Date(report.date).toLocaleDateString()}</td>
                <td>{report.reason || '-'}</td>
                <td>
                  {report.approved ? (
                    <span className="badge bg-success">Approved</span>
                  ) : (
                    <span className="badge bg-warning text-dark">Pending</span>
                  )}
                </td>
                <td>
                  {!report.approved && (
                    <button className="btn btn-sm btn-outline-success" onClick={() => approveReport(report.id)}>
                      Approve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
