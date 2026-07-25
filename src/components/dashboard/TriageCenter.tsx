'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, MessageSquare, Loader2, FileWarning } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TriageCenterProps {
  onAnalyze: (type: 'text' | 'image' | 'voice' | 'document', content: string) => Promise<void>;
  isAnalyzing: boolean;
}

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const SUPPORTED_TYPES = [
  'image/png', 'image/jpeg', 'image/jpg',
  'application/pdf',
  'text/plain',
  'audio/mpeg', 'audio/wav', 'audio/mp3',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export function TriageCenter({ onAnalyze, isAnalyzing }: TriageCenterProps) {
  const [chatText, setChatText] = useState('');
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        variant: 'destructive',
        title: 'Payload Too Large',
        description: `Maximum upload size is ${MAX_FILE_SIZE_MB}MB. File rejected.`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      let type: 'text' | 'image' | 'voice' | 'document' = 'document';

      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('audio/')) type = 'voice';
      else if (file.type === 'text/plain') type = 'text';
      else type = 'document';

      onAnalyze(type, base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="glass-card border-primary/20 rounded-[2rem]">
      <CardHeader>
        <CardTitle className="text-2xl font-black">Triage Center</CardTitle>
        <CardDescription>Upload forensic evidence or paste suspicious chats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl">
            <TabsTrigger value="upload" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Evidence Files</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Chat Terminal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-4">
            <div className="group border-2 border-dashed border-primary/20 rounded-3xl p-8 text-center space-y-4 hover:border-primary transition-all cursor-pointer relative bg-primary/5 hover:bg-primary/10">
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileUpload}
                accept=".png,.jpg,.jpeg,.pdf,.txt,.mp3,.wav,.docx"
                disabled={isAnalyzing}
              />
              <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                {isAnalyzing ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <Upload className="h-8 w-8 text-primary" />}
              </div>
              <div className="space-y-1">
                <p className="font-bold">Drop Evidence</p>
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter leading-tight">
                  PNG, JPG, PDF, TXT, MP3, WAV, DOCX<br/>(Max {MAX_FILE_SIZE_MB}MB)
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="chat" className="pt-4 space-y-4">
            <Textarea 
              placeholder="Paste WhatsApp, Telegram, or SMS history here for behavioral analysis..." 
              className="min-h-[150px] bg-white/5 border-white/10 rounded-2xl p-4 font-medium"
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
              Analyze Behavioral Patterns
            </Button>
          </TabsContent>
        </Tabs>

        {isAnalyzing && (
          <div className="space-y-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-pulse">
            <div className="flex justify-between text-[10px] font-black tracking-widest text-primary uppercase">
              <span>Scanning Protocol Active</span>
              <span>Metadata Triage</span>
            </div>
            <Progress value={85} className="h-1 bg-white/5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
