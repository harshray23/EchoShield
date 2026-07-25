'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, User, Volume2, Moon, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  const [voiceAlerts, setVoiceAlerts] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-10">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-2xl">
          <Settings className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Settings</h1>
          <p className="text-muted-foreground font-medium">Configure your digital shield protocols.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8">
        <Card className="glass-card border-white/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Analysis Engine</CardTitle>
            <CardDescription>Adjust how the AI handles threat detection.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="space-y-1">
                <Label className="text-base font-bold">AI Voice Warning</Label>
                <p className="text-xs text-muted-foreground">Synthesize audio alerts for high-risk threats.</p>
              </div>
              <Switch checked={voiceAlerts} onCheckedChange={setVoiceAlerts} />
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="space-y-1">
                <Label className="text-base font-bold">Auto-Save Forensics</Label>
                <p className="text-xs text-muted-foreground">Automatically store scan results in history.</p>
              </div>
              <Switch checked={autoSave} onCheckedChange={setAutoSave} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 rounded-[2rem]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-accent" /> Notifications</CardTitle>
            <CardDescription>System alerts and security updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
              <div className="space-y-1">
                <Label className="text-base font-bold">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Alert me when new scam trends are detected.</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/5 rounded-[2rem] border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><Lock className="h-5 w-5" /> Danger Zone</CardTitle>
            <CardDescription>Irreversible security actions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button variant="outline" className="flex-1 rounded-xl h-12 border-white/10 hover:bg-destructive hover:text-white transition-all">Clear All Scan History</Button>
            <Button variant="destructive" className="flex-1 rounded-xl h-12">Terminate All Active Sessions</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
