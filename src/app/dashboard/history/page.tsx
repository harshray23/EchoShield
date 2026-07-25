
'use client';

import { motion } from 'framer-motion';
import { useAnalysisHistory } from '@/hooks/use-analysis-history';
import { format, isToday, isYesterday } from 'date-fns';
import { History, ShieldAlert, Shield, ChevronRight, FileText, Image as ImageIcon, Mic, Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function HistoryPage() {
  const { analyses, loading } = useAnalysisHistory();

  const groupedAnalyses = analyses?.reduce((acc: any, analysis) => {
    const date = analysis.timestamp?.toDate() || new Date();
    let group = format(date, 'MMMM d, yyyy');
    if (isToday(date)) group = 'Today';
    else if (isYesterday(date)) group = 'Yesterday';
    
    if (!acc[group]) acc[group] = [];
    acc[group].push(analysis);
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-8 space-y-10">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-2xl text-primary cyber-glow">
            <History className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tight">Forensic Archive</h1>
        </div>
        <p className="text-xl text-muted-foreground font-medium">Historical database of all digital threat assessments.</p>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 glass-card rounded-[3rem] border-white/5">
          <Database className="h-12 w-12 text-primary animate-pulse mb-4" />
          <p className="text-[10px] font-black tracking-[0.4em] uppercase text-muted-foreground">Decrypting Secure Vault...</p>
        </div>
      ) : !analyses || analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 glass-card rounded-[3rem] border-white/5 text-center p-12">
          <ShieldAlert className="h-20 w-20 text-white/5 mb-6" />
          <h3 className="text-2xl font-black uppercase tracking-tight">Archive Empty</h3>
          <p className="text-muted-foreground mt-2 max-w-sm font-medium">No forensic data found. Scans generated in the console will appear here automatically.</p>
          <Button asChild className="mt-8 rounded-xl btn-gradient cyber-glow px-8">
            <Link href="/dashboard">START FIRST SCAN</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedAnalyses).map(([group, items]: [string, any]) => (
            <div key={group} className="space-y-6">
              <div className="flex items-center gap-4">
                <h3 className="text-[10px] font-black tracking-[0.3em] uppercase text-primary whitespace-nowrap">{group}</h3>
                <div className="h-px w-full bg-gradient-to-r from-primary/30 to-transparent" />
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {items.map((analysis: any, i: number) => (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link href={`/dashboard/case/${analysis.id}`}>
                      <Card className="glass-card border-white/5 rounded-[1.5rem] hover:border-primary/40 hover:bg-white/[0.02] transition-all group cursor-pointer relative overflow-hidden">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                          analysis.riskLevel === 'malicious' ? 'bg-destructive shadow-[4px_0_12px_rgba(239,68,68,0.5)]' : 
                          analysis.riskLevel === 'suspicious' ? 'bg-orange-500 shadow-[4px_0_12px_rgba(249,115,22,0.5)]' : 'bg-accent shadow-[4px_0_12px_rgba(34,197,94,0.5)]'
                        }`} />
                        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                          <div className="flex items-center gap-6 flex-1">
                            <div className={`p-4 rounded-2xl flex items-center justify-center ${
                              analysis.riskLevel === 'malicious' ? 'bg-destructive/10 text-destructive' : 
                              analysis.riskLevel === 'suspicious' ? 'bg-orange-500/10 text-orange-500' : 'bg-accent/10 text-accent'
                            }`}>
                              {analysis.type === 'image' ? <ImageIcon className="h-6 w-6" /> : 
                               analysis.type === 'voice' ? <Mic className="h-6 w-6" /> : 
                               analysis.type === 'document' ? <Shield className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="font-black text-lg tracking-tight uppercase leading-none">{analysis.scamType}</span>
                                <Badge variant={analysis.riskLevel === 'secure' ? 'default' : 'destructive'} className="rounded-full px-3 h-5 text-[9px] font-black uppercase tracking-widest">
                                  {analysis.riskScore}% RISK
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-muted-foreground/80 line-clamp-1 italic">
                                {analysis.summary}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-[9px] font-black tracking-widest text-muted-foreground/40 uppercase">
                                  {format(analysis.timestamp?.toDate() || new Date(), 'p')} // Forensic Stamp
                                </p>
                                <div className="flex gap-1">
                                  {analysis.manipulationTactics?.slice(0, 2).map((t: string) => (
                                    <span key={t} className="text-[8px] font-black bg-white/5 border border-white/10 text-muted-foreground px-2 py-0.5 rounded-md uppercase tracking-tighter">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-right hidden sm:block">
                              <p className="text-[9px] font-black tracking-[0.2em] text-muted-foreground uppercase mb-1">Status</p>
                              <span className={`text-xs font-black uppercase tracking-widest ${
                                analysis.riskLevel === 'malicious' ? 'text-destructive' : 
                                analysis.riskLevel === 'suspicious' ? 'text-orange-500' : 'text-accent'
                              }`}>
                                {analysis.riskLevel === 'secure' ? 'CLEARED' : 'THREAT BLOCKED'}
                              </span>
                            </div>
                            <div className="p-2 rounded-xl group-hover:bg-primary/20 transition-colors border border-transparent group-hover:border-primary/20">
                              <ChevronRight className="h-5 w-5 text-primary" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
