import React, { useState } from 'react';
import { account, ID } from '../appwrite/config';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await account.createEmailPasswordSession(email, password);
      } else {
        await account.create(ID.unique(), email, password, name);
        await account.createEmailPasswordSession(email, password);
      }
      navigate('/dashboard'); // Go straight to test generator on login!
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#0a0f1c] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-white/10">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] mx-auto mb-4">
            <span className="text-white font-black text-4xl">D</span>
          </div>
          <h2 className="text-3xl font-black text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 mt-2">
            {isLogin ? 'Enter your credentials to access the engine.' : 'Begin your adaptive learning journey.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-1">Full Name</label>
              <input 
                type="text" 
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                placeholder="Daksh Jaisingh"
                value={name} 
                onChange={(e) => setName(e.target.value)} 
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1">Email Address</label>
            <input 
              type="email" 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="student@nitrr.ac.in"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
            />
          </div>

          <Button variant="primary" className="w-full mt-6" type="submit">
            {isLogin ? 'Initialize Session' : 'Register Configuration'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setIsLogin(!isLogin)}
            type="button"
          >
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </Button>
        </div>

      </Card>
    </div>
  );
}