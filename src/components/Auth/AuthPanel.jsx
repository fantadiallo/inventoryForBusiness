// src/components/Auth/AuthPanel.jsx
import { useEffect, useState } from 'react';
import { useNavigate }          from 'react-router-dom';
import { supabase }             from '../../supabase/client';
import CreateBusinessForm       from '../CreateBusinessForm/CreateBusinessForm';
import './AuthPanel.module.scss';

export default function AuthPanel() {
  /* ─── State ─── */
  const [isLogin, setLogin] = useState(true); 
  const [showForgot, setShowForgot] = useState(false);
  const [form, setForm]     = useState({
    email: '',
    pwd: '',
    confirm: '',
  });
  const [bizCreated, setBizCreated] = useState(false); 
  const [msg, setMsg]        = useState('');
  const [loading, setLoading]= useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const nav = useNavigate();

  /* ─── On mount: check session / OAuth callback ─── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        handleProfileCheck(data.session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) handleProfileCheck(session.user);
      }
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  /* ─── Check public.users row & business_id (after login/OAuth) ─── */
  async function handleProfileCheck(user) {
    // 1) Check if a public.users row exists
    const { data: existing, error: fetchErr } = await supabase
      .from('users')
      .select('business_id, role')
      .eq('id', user.id)
      .single();

    if (fetchErr && fetchErr.code === 'PGRST116') {
      // No row → first-time OAuth or unregistered email login
      const nameFromMetadata =
        user.user_metadata?.name || user.email.split('@')[0] || '';
      await supabase.from('users').insert({
        id: user.id,
        name: nameFromMetadata,
        role: 'admin',
        business_id: null,
      });
      setBizCreated(true);
      return;
    } else if (fetchErr) {
      console.error('Error fetching public.users row:', fetchErr);
      return;
    }

    // 2) Row exists
    if (!existing?.business_id) {
      // admin hasn’t created a business yet
      setBizCreated(true);
      return;
    }

    // 3) business_id is set → store & redirect
    localStorage.setItem('user', JSON.stringify({ id: user.id }));
    localStorage.setItem('role', existing.role);
    localStorage.setItem('business_id', existing.business_id);
    nav('/dashboard');
  }

  /* ─── Helper to show errors / messages ─── */
  const fail = (text) => {
    setMsg(`❌ ${text}`);
    setLoading(false);
  };

  /* ─── 1A: Handle Registration (Email/Password) ─── */
  async function handleRegister(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    if (form.pwd !== form.confirm) {
      fail('Passwords do not match.');
      return;
    }

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.pwd,
    });
    if (authErr) {
      fail(authErr.message);
      return;
    }

    // We do NOT insert into public.users here → wait until user logs in
    setMsg(
      '✅ Registration successful! Check your email to verify, then log in. ' +
      'If you didn’t receive it, you can resend below.'
    );
    setLogin(true);
    setLoading(false);
  }

  /* ─── 1B: Handle Login (Email/Password) ─── */
  async function handleLogin(e) {
    e.preventDefault();
    setMsg('');
    setLoading(true);

    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.pwd,
    });
    if (loginErr) {
      fail(loginErr.message);
      return;
    }

    // onAuthStateChange will fire handleProfileCheck()
    setLoading(false);
  }

  /* ─── 2: Handle Google OAuth ─── */
  async function handleGoogle() {
    setMsg('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      fail(error.message);
      return;
    }
    // Redirects to Google, then back → onAuthStateChange triggers handleProfileCheck()
  }

  /* ─── 3: Resend Verification Email (as Magic Link / OTP) ─── */
  async function resendVerificationEmail() {
    if (!form.email) {
      setMsg('❌ Please enter your email above to resend.');
      return;
    }
    setLoadingResend(true);
    setMsg('');

    const { error } = await supabase.auth.signInWithOtp({
      email: form.email,
      options: { shouldCreateUser: false },
    });
    if (error) {
      setMsg(`❌ ${error.message}`);
    } else {
      setMsg('✅ A new verification link has been sent to your inbox.');
    }
    setLoadingResend(false);
  }

  /* ─── 4: Handle “Forgot Password?” → Send Reset Link ─── */
  async function sendPasswordReset() {
    if (!form.email) {
      setMsg('❌ Please enter your email above to reset password.');
      return;
    }
    setLoadingReset(true);
    setMsg('');

    const { error } = await supabase.auth.resetPasswordForEmail(form.email);
    if (error) {
      setMsg(`❌ ${error.message}`);
    } else {
      setMsg('✅ A password reset link has been sent to your email.');
    }
    setLoadingReset(false);
  }

  /* ─── 5: Combined Submit Handler ─── */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (showForgot) {
      return sendPasswordReset();
    }
    return isLogin ? handleLogin(e) : handleRegister(e);
  };

  /* ─── 6: If bizCreated, show CreateBusinessForm (Step 2) ─── */
  if (bizCreated) {
    return (
      <div className="container d-flex justify-content-center py-5">
        <div
          className="bg-white shadow p-4 rounded"
          style={{ maxWidth: 500, width: '100%' }}
        >
          <h3 className="text-center mb-3">Create Your Business</h3>
          <CreateBusinessForm
            onCreated={(b) => {
              setMsg(`✅ Business "${b.name}" created! Redirecting…`);
              supabase.auth.getSession().then(({ data: { session } }) => {
                localStorage.setItem('user', JSON.stringify({ id: session.user.id }));
                localStorage.setItem('role', 'admin');
                localStorage.setItem('business_id', b.id);
                setTimeout(() => nav('/dashboard'), 1500);
              });
            }}
          />
          {msg && <div className="alert alert-info mt-3">{msg}</div>}
        </div>
      </div>
    );
  }

  /* ─── 7: Otherwise, show Login/Register or Forgot Password form ─── */
  return (
    <div className="container d-flex justify-content-center py-5">
      <div
        className="bg-white shadow p-4 rounded"
        style={{ maxWidth: 500, width: '100%' }}
      >
        {/* Title changes based on mode */}
        <h3 className="text-center mb-3">
          {showForgot
            ? 'Reset Your Password'
            : isLogin
            ? 'Admin Login'
            : 'Register as Admin'}
        </h3>

        {/* Toggle between Login/Register */}
        {!showForgot && (
          <div className="text-center mb-3">
            <button
              className="btn btn-link p-0"
              onClick={() => {
                setLogin(!isLogin);
                setMsg('');
              }}
              disabled={loading}
            >
              {isLogin
                ? 'Need to create an account? Register'
                : 'Already have an account? Login'}
            </button>
          </div>
        )}

        {msg && <div className="alert alert-info">{msg}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email (always shown) */}
          <input
            type="email"
            className="form-control mb-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
            pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,4}$"
            title="Enter a valid email address"
          />

          {/* Password / Confirm (only if not “Forgot” mode) */}
          {!showForgot && (
            <>
              <input
                type="password"
                className="form-control mb-2"
                placeholder="Password"
                value={form.pwd}
                onChange={(e) =>
                  setForm({ ...form, pwd: e.target.value })
                }
                required
                minLength={8}
                title="At least 8 characters"
              />

              {/* Confirm password (only on Register) */}
              {!isLogin && (
                <input
                  type="password"
                  className="form-control mb-2"
                  placeholder="Confirm Password"
                  value={form.confirm}
                  onChange={(e) =>
                    setForm({ ...form, confirm: e.target.value })
                  }
                  required
                />
              )}
            </>
          )}

          {/* Submit button text changes by mode */}
          <button
            className="btn btn-primary w-100 mb-2"
            type="submit"
            disabled={
              loading ||
              (showForgot ? loadingReset : false)
            }
          >
            {loading
              ? 'Please wait…'
              : showForgot
              ? 'Send Reset Link'
              : isLogin
              ? 'Login'
              : 'Register'}
          </button>
        </form>

        {/* “Forgot Password?” link (only in Login mode & not “Forgot” already) */}
        {isLogin && !showForgot && (
          <div className="text-center mb-3">
            <button
              className="btn btn-link p-0"
              onClick={() => {
                setShowForgot(true);
                setMsg('');
              }}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* “Resend verification email” (only shown after someone registers) */}
        {!isLogin && !showForgot && (
          <div className="text-center mb-3">
            <button
              className="btn btn-link"
              onClick={resendVerificationEmail}
              disabled={loadingResend}
            >
              {loadingResend
                ? 'Sending…'
                : 'Resend verification email'}
            </button>
          </div>
        )}

        <hr />

        {/* Google OAuth button (always shown unless in “Forgot” mode) */}
        {!showForgot && (
          <button
            className="btn btn-outline-danger w-100"
            onClick={handleGoogle}
            disabled={loading}
          >
            {loading ? 'Redirecting to Google…' : 'Login with Google'}
          </button>
        )}
      </div>
    </div>
  );
}
