import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabase/client';
import './AuthPanel.module.scss';

export default function AuthPanel() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if returning from Google login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.setItem('user', JSON.stringify(session.user));
        navigate('/dashboard');
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
      if (!strongPassword.test(password)) {
        setError('Password must include uppercase, lowercase, number, and symbol (min 8 characters).');
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) setError(error.message);
      else {
        setSuccess(true);
        setError('');
      }
    } else {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

      if (loginError) {
        if (loginError.message.toLowerCase().includes('invalid login credentials')) {
          setError('No account found. Please register.');
        } else {
          setError(loginError.message);
        }
      } else {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          localStorage.setItem('user', JSON.stringify(session.user));
          navigate('/dashboard');
        } else {
          setError('Login successful, but no session found. Please confirm your email.');
        }
      }
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setError(error.message);
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center vh-100">
      <div className="w-100 p-4 bg-white shadow rounded" style={{ maxWidth: '500px' }}>
        <h2 className="text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && (
          <div className="alert alert-success">
            ✅ Account created! Please check your email to confirm before logging in.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <button className="btn btn-primary w-100">{isLogin ? 'Login' : 'Register'}</button>
          </div>
        </form>

        <hr />

        <button className="btn btn-outline-danger w-100 mb-3" onClick={handleGoogle}>
          {isLogin ? 'Login with Google' : 'Sign up with Google'}
        </button>

        <p className="text-center">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button className="btn btn-link p-0" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
