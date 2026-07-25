'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, MessageSquare, Loader2 } from 'lucide-react';

interface TriageCenterProps {
  onAnalyze: (type: 'text' | 'image' | 'voice', content: string) => Promise<void>;
  isAnalyzing: boolean;
}

export function TriageCenter({ onAnalyze, isAnalyzing }: TriageCenterProps) {
  const [chatText, setChatText] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const type = file.type.startsWith('image') ? 'image' : 
                   file.type.startsWith('audio') ? 'voice' : 'text';
      onAnalyze(type as any, base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="glass-card border-primary/20 rounded-[2rem]">
      <CardHeader>
        <CardTitle className="text-2xl">Triage Center</CardTitle>
        <CardDescription>Upload or paste suspicious content for analysis.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl">
            <TabsTrigger value="upload" className="rounded-lg font-bold">Files</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg font-bold">Chat Paste</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-4">
            <div className="group border-2 border-dashed border-primary/20 rounded-3xl p-8 text-center space-y-4 hover:border-primary transition-all cursor-pointer relative bg-primary/5 hover:bg-primary/10">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
                accept="image/*,audio/*"
                disabled={isAnalyzing}
              />
              <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                {isAnalyzing ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Upload className="h-8 w-8 text-primary" />}
              </div>
              <div className="space-y-1">
                <p className="font-bold">Screenshots / Audio</p>
                <p className="text-xs text-muted-foreground">Drop banking chats or voice clips</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="pt-4 space-y-4">
            <Textarea 
              placeholder="Paste WhatsApp, Telegram, or SMS messages here..." 
              className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl p-4"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              disabled={isAnalyzing}
            />
            <Button 
              className="w-full h-12 rounded-xl btn-gradient cyber-glow" 
              onClick={() => onAnalyze('text', chatText)}
              disabled={isAnalyzing || !chatText.trim()}
            >
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" />}
              Analyze Chat History
            </Button>
          </TabsContent>
        </Tabs>

        {isAnalyzing && (
          <div className="space-y-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-pulse">
            <div className="flex justify-between text-[10px] font-black tracking-widest text-primary uppercase">
              <span>Deconstructing Metadata</span>
              <span>Active</span>
            </div>
            <Progress value={90} className="h-1 bg-white/5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
