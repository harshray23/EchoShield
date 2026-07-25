'use client';

import { motion } from 'framer-motion';
import { useCollection, useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import { format } from 'date-fns';
import { History, ShieldAlert, ShieldCheck, Shield, ChevronRight, FileText, Image as ImageIcon, Mic } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function HistoryPage() {
  const { user } = useUser();
  const db = useFirestore();

  const historyQuery = useMemo(() => {
    if (!user) return null;
    return query(
      collection(db, 'analyses'),
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
  }, [user, db]);

  const { data: analyses, loading } = useCollection(historyQuery);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-2xl text-primary">
            <History className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Scan History</h1>
        </div>
        <p className="text-xl text-muted-foreground font-medium">Forensic records of all analyzed threats.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 glass-card rounded-[2rem] border-white/5">
            <Shield className="h-12 w-12 text-primary animate-pulse mb-4" />
            <p className="text-muted-foreground font-bold">Decrypting Records...</p>
          </div>
        ) : !analyses || analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 glass-card rounded-[2rem] border-white/5 text-center p-8">
            <ShieldAlert className="h-16 w-16 text-white/10 mb-6" />
            <h3 className="text-2xl font-black">No Records Found</h3>
            <p className="text-muted-foreground mt-2">Your threat database is empty. Start your first scan today.</p>
          </div>
        ) : (
          analyses.map((analysis, i) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="glass-card border-white/5 rounded-[1.5rem] hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-1">
                    <div className={`p-4 rounded-2xl flex items-center justify-center ${
                      analysis.score > 70 ? 'bg-destructive/10 text-destructive' : 
                      analysis.score > 40 ? 'bg-orange-500/10 text-orange-500' : 'bg-accent/10 text-accent'
                    }`}>
                      {analysis.type === 'image' ? <ImageIcon className="h-6 w-6" /> : 
                       analysis.type === 'voice' ? <Mic className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-lg tracking-tight uppercase">{analysis.type} ANALYSIS</span>
                        <Badge variant={analysis.score > 40 ? 'destructive' : 'default'} className="rounded-full px-3 h-5 text-[10px] font-black uppercase">
                          {analysis.score}% RISK
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground line-clamp-1">{analysis.verdict}</p>
                      <p className="text-[10px] font-black tracking-widest text-muted-foreground/50 uppercase">
                        {analysis.timestamp ? format(analysis.timestamp.toDate(), 'PPP p') : 'Processing...'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">Status</p>
                      <span className={`text-sm font-bold uppercase tracking-tight ${analysis.score > 40 ? 'text-destructive' : 'text-accent'}`}>
                        {analysis.score > 40 ? 'THREAT BLOCKED' : 'SECURE'}
                      </span>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-primary/20 transition-colors">
                      <ChevronRight className="h-5 w-5 text-primary" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
