import { useState } from 'react';
import { supabase } from '../../supabase/client';

export default function CreateBusinessForm({ onCreated }) {
  const [name, setName]         = useState('');
  const [address, setAddress]   = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // 1) Client-side check: must be exactly 6 digits
    if (!/^\d{6}$/.test(passcode)) {
      setError('Passcode must be exactly 6 digits.');
      setLoading(false);
      return;
    }

    // 2) Get the currently logged-in admin
    const { data: { user }, error: getUserErr } = await supabase.auth.getUser();
    if (getUserErr || !user) {
      setError('You must be logged in to create a business.');
      setLoading(false);
      return;
    }

    // 3) Insert into `businesses` (RLS allows this because admin is logged in)
    const { data, error: bizErr } = await supabase
      .from('businesses')
      .insert({
        name: name.trim(),
        address: address.trim(),
        owner_id: user.id,
        manager_passcode: passcode.trim(),
      })
      .select()
      .single();

    if (bizErr) {
      setError(bizErr.message);
      setLoading(false);
      return;
    }

    // 4) Insert into `public.users` to link this admin to the new business
    const { error: userErr } = await supabase.from('users').update({
      business_id: data.id
    }).eq('id', user.id);

    if (userErr) {
      setError('Business created, but failed to link user: ' + userErr.message);
      setLoading(false);
      return;
    }

    // 5) Success! Notify parent and reset fields
    setSuccess(`✅ Business "${data.name}" created! Redirecting…`);
    setName('');
    setAddress('');
    setPasscode('');

    // Let the parent (AuthPanel) know we’re done
    if (onCreated) onCreated(data);

    // Auto‐clear the success message after 3s
    setTimeout(() => setSuccess(''), 3000);

    // Scroll to top so the user sees the message
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleCreate}
      className="p-4 border rounded shadow mb-4 bg-light"
    >
      <h4 className="mb-3">Create a Business Workspace</h4>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <input
        type="text"
        className="form-control mb-2"
        placeholder="Business Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      <input
        type="text"
        className="form-control mb-2"
        placeholder="Business Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <input
        type="text"
        className="form-control mb-2"
        placeholder="6-digit Manager Passcode"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        required
        pattern="\d{6}"
        title="Enter exactly 6 digits (e.g. 123456)"
      />

      <button className="btn btn-success w-100" disabled={loading}>
        {loading ? 'Creating business...' : 'Create Business'}
      </button>
    </form>
  );
}
