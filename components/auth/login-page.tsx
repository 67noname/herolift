'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { t } from '@/lib/i18n';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMagicLink, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsLoading(true);
      const result = await sendMagicLink(email);
      if (result.success) {
        setSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">💪 HeroLift</h1>
          <p className="text-muted-foreground">Трекер силовых тренировок</p>
        </div>

        {/* Login Form */}
        {!submitted ? (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-card/40 border border-border/20 backdrop-blur-sm rounded-2xl p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                📧 Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-secondary/50 border border-border/50 rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                disabled={isLoading}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-destructive/20 border border-destructive/50 text-destructive text-sm p-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={!email || isLoading}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-lg shadow-lg shadow-primary/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Отправить ссылку
                </>
              )}
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Мы отправим вам магическую ссылку на электронную почту
            </p>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 border border-border/20 backdrop-blur-sm rounded-2xl p-6 text-center space-y-4"
          >
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-lg font-bold text-primary">Проверьте электронную почту</h2>
            <p className="text-sm text-muted-foreground">
              Мы отправили магическую ссылку на <strong>{email}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Откройте письмо и нажмите на ссылку, чтобы войти
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              className="w-full py-2 bg-secondary text-foreground font-medium rounded-lg hover:bg-secondary/80 transition-colors text-sm"
            >
              ← Вернуться
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
