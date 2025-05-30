import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import './AuthPanel.module.scss';
import CreateBusinessForm from '../CreateBusinessForm/CreateBusinessForm';

export default function AuthPanel() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateBusiness, setShowCreateBusiness] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('business_id')
          .eq('id', session.user.id)
          .single();

        if (!profile?.business_id) {
          setError('You are not connected to any business.');
          return;
        }

        localStorage.setItem('user', JSON.stringify(session.user));
        navigate('/dashboard');
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!strongPassword.test(password)) {
        setError('Password must include uppercase, lowercase, number, and symbol (min 8 characters).');
        setLoading(false);
        return;
      }

      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('id')
        .eq('manager_passcode', passcode)
        .single();

      if (businessError || !business) {
        setError('Invalid business passcode.');
        setLoading(false);
        return;
      }

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const userId = signUpData.user.id;

      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        name,
        role: 'worker',
        business_id: business.id,
      });

      if (profileError) {
        setError('User created, but failed to link to business.');
      } else {
        setSuccess('✅ Account created! Please confirm your email before logging in.');
      }

      setLoading(false);
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

      if (loginError) {
        setError(loginError.message.includes('invalid')
          ? 'No account found. Please register.'
          : loginError.message);
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      const { data: userRow } = await supabase
        .from('users')
        .select('business_id, role')
        .eq('id', userId)
        .single();

      if (!userRow?.business_id) {
        setError('You are not connected to any business.');
        setLoading(false);
        return;
      }

      const { data: business } = await supabase
        .from('businesses')
        .select('name')
        .eq('id', userRow.business_id)
        .single();

      localStorage.setItem('user', JSON.stringify(session.user));
      localStorage.setItem('role', userRow.role);
      alert(`Connected to ${business.name}`);
      setLoading(false);
      navigate('/dashboard');
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center py-5">
      <div className="w-100 p-4 bg-white shadow rounded" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        {loading && <div className="alert alert-info text-center">⏳ Processing...</div>}

        <div className="text-center mb-4">
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setShowCreateBusiness(!showCreateBusiness)}
          >
            {showCreateBusiness ? '← Back to Auth' : 'Are you an admin? Create a business'}
          </button>
        </div>

        {showCreateBusiness ? (
          <CreateBusinessForm
            onCreated={(b) => {
              setShowCreateBusiness(false);
              setPasscode(b.manager_passcode);
              setSuccess(`Business "${b.name}" created! Now register using the passcode.`);
            }}
          />
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-control mb-2"
                    placeholder="6-digit Business Passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    required
                  />
                </>
              )}
              <input
                type="email"
                className="form-control mb-2"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!isLogin && (
                <>
                  <input
                    type="password"
                    className="form-control mb-2"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <small className="text-muted d-block mb-2">
                    Must include uppercase, lowercase, number, and symbol.
                  </small>
                </>
              )}
              <div className="d-grid">
                <button className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Please wait...' : isLogin ? 'Login' : 'Register'}
                </button>
              </div>
            </form>

            <hr />

            <button className="btn btn-outline-danger w-100 mb-3" onClick={handleGoogle}>
              {isLogin ? 'Login with Google' : 'Sign up with Google'}
            </button>

            <p className="text-center">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button className="btn btn-link p-0" onClick={() => setIsLogin(!isLogin)} disabled={loading}>
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
