import { useState } from 'react';
import { supabase } from '../../supabase/client';

export default function CreateBusinessForm({ onCreated }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!/^\d{6}$/.test(passcode)) {
      setError('Passcode must be exactly 6 digits.');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('You must be logged in to create a business.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('businesses')
      .insert({
        name,
        address,
        owner_id: user.id,
        manager_passcode: passcode,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
    } else {
      setSuccess(`✅ Business "${data.name}" created! Share the passcode with workers.`);
      if (onCreated) onCreated(data); // optional callback
      setName('');
      setAddress('');
      setPasscode('');
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleCreate} className="p-4 border rounded shadow mb-4 bg-light">
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
      />

      <button className="btn btn-success w-100" disabled={loading}>
        {loading ? 'Creating business...' : 'Create Business'}
      </button>
    </form>
  );
}
