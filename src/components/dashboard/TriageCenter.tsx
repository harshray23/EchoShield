
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Upload, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TriageCenterProps {
  onAnalyze: (type: 'text' | 'image' | 'voice' | 'document', content: string) => Promise<void>;
  isAnalyzing: boolean;
}

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Blocked executable and potentially dangerous extensions
const BLOCKED_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.php', '.js', '.vbs', '.msi', '.com', '.scr', '.pif', '.apk'
];

export function TriageCenter({ onAnalyze, isAnalyzing }: TriageCenterProps) {
  const [chatText, setChatText] = useState('');
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const isExecutable = BLOCKED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (isExecutable) {
      setSecurityWarning(`Security Alert: The file "${file.name}" was rejected because executable formats are blocked for safety.`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        variant: 'destructive',
        title: 'Payload Too Large',
        description: `Maximum upload size is ${MAX_FILE_SIZE_MB}MB. File rejected.`,
      });
      return false;
    }

    return true;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSecurityWarning(null);

    if (!validateFile(file)) {
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Read Error',
        description: 'Failed to read the forensic payload.',
      });
    };
    reader.readAsDataURL(file);
  };

  const onDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDropZoneClick();
    }
  };

  const sanitizeInput = (text: string) => {
    // Basic sanitization to prevent common injection patterns
    return text.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "").trim();
  };

  const handleChatAnalysis = () => {
    const sanitized = sanitizeInput(chatText);
    if (!sanitized) return;
    onAnalyze('text', sanitized);
  };

  return (
    <Card className="glass-card border-primary/20 rounded-[2rem]">
      <CardHeader>
        <CardTitle className="text-2xl font-black">Triage Center</CardTitle>
        <CardDescription>Upload forensic evidence or paste suspicious chats.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {securityWarning && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 rounded-2xl">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-black uppercase text-[10px] tracking-widest">Protocol Violation</AlertTitle>
            <AlertDescription className="text-xs font-medium">{securityWarning}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 rounded-xl">
            <TabsTrigger value="upload" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Evidence Files</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg font-bold uppercase text-[10px] tracking-widest">Chat Terminal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-4">
            <div 
              role="button"
              tabIndex={0}
              onClick={onDropZoneClick}
              onKeyDown={onKeyDown}
              aria-label="Upload evidence files. Maximum 20MB. Supported types: Image, Audio, PDF, Text, Docx. Executables are blocked."
              className="group border-2 border-dashed border-primary/20 rounded-3xl p-8 text-center space-y-4 hover:border-primary transition-all cursor-pointer relative bg-primary/5 hover:bg-primary/10 focus-visible:ring-2 focus-visible:ring-primary outline-none"
            >
              <input 
                ref={fileInputRef}
                type="file" 
                className="hidden" 
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
              aria-label="Chat input terminal"
            />
            <Button 
              className="w-full h-12 rounded-xl btn-gradient cyber-glow" 
              onClick={handleChatAnalysis}
              disabled={isAnalyzing || !chatText.trim()}
              aria-label="Analyze behavioral patterns in chat text"
            >
              {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />}
              Analyze Behavioral Patterns
            </Button>
          </TabsContent>
        </Tabs>

        {isAnalyzing && (
          <div className="space-y-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 animate-pulse" role="status" aria-live="polite">
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
