'use client';

import { motion } from 'framer-motion';
import { AlertCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function SetupPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-card/40 border border-border/20 backdrop-blur-sm rounded-2xl p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="text-primary" size={28} />
          <h1 className="text-3xl font-bold text-primary">Setup Required</h1>
        </div>

        <p className="text-foreground mb-8">
          HeroLift requires Supabase to be configured. Follow these steps to get started:
        </p>

        <div className="space-y-6">
          {/* Step 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-secondary/30 p-4 rounded-lg"
          >
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                1
              </span>
              Create Supabase Project
            </h2>
            <p className="text-muted-foreground text-sm mb-3">
              Go to{' '}
              <a
                href="https://supabase.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                supabase.com
              </a>{' '}
              and create a new project
            </p>
          </motion.div>

          {/* Step 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-secondary/30 p-4 rounded-lg"
          >
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                2
              </span>
              Run SQL Migration
            </h2>
            <p className="text-muted-foreground text-sm mb-3">
              Copy the SQL migration file and paste it in Supabase SQL Editor:
            </p>
            <button
              onClick={() => copyToClipboard('migrations/001_create_workouts_tables.sql', 'migration')}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              {copied === 'migration' ? (
                <>
                  <Check size={14} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={14} /> migrations/001_create_workouts_tables.sql
                </>
              )}
            </button>
          </motion.div>

          {/* Step 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-secondary/30 p-4 rounded-lg"
          >
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                3
              </span>
              Set Environment Variables
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              In your Vercel project settings, add these environment variables:
            </p>
            <div className="space-y-2">
              <div className="bg-background/50 p-3 rounded font-mono text-xs text-foreground">
                <div className="text-muted-foreground">Key:</div>
                <div className="text-primary">NEXT_PUBLIC_SUPABASE_URL</div>
                <div className="text-muted-foreground mt-2">Value: (from Supabase Project Settings)</div>
              </div>
              <div className="bg-background/50 p-3 rounded font-mono text-xs text-foreground">
                <div className="text-muted-foreground">Key:</div>
                <div className="text-primary">NEXT_PUBLIC_SUPABASE_ANON_KEY</div>
                <div className="text-muted-foreground mt-2">Value: (from Supabase Project Settings)</div>
              </div>
            </div>
          </motion.div>

          {/* Step 4 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-secondary/30 p-4 rounded-lg"
          >
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm">
                4
              </span>
              Deploy
            </h2>
            <p className="text-muted-foreground text-sm">
              After setting environment variables, redeploy your application to activate Supabase authentication
            </p>
          </motion.div>
        </div>

        <div className="mt-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">
            Once configured, refresh this page to start using HeroLift with your workouts automatically synced across devices.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
