"use client";

import { useAppContext } from "@/lib/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, FileText, HardDrive, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function DashboardPage() {
  const { user, documents, files, logs } = useAppContext();

  const stats = [
    { title: "Users", value: user ? 1 : 0, icon: Users, hint: "people working" },
    { title: "Documents", value: documents.length, icon: FileText, hint: "document files" },
    { title: "Files", value: files.length, icon: HardDrive, hint: "server storage" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your Firebase simulation.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {logs.length > 0 ? (
              logs.map((log) => (
                <div key={log.id} className="flex items-center gap-4">
                  <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarFallback className="bg-primary/20 text-primary-foreground">
                        <log.Icon className="h-5 w-5 text-accent" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{log.message}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(log.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No recent activity. Try adding a document or uploading a file.</p>
            )}
          </CardContent>
        </Card>
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>Welcome to FireBase Explorer</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between gap-4">
                <p className="text-muted-foreground">This interactive application is a simplified simulator for some of Firebase's core features. You can:</p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><span className="font-semibold">Manage Data:</span> Navigate to the 'Database' tab to add and view documents in a mock Firestore collection.</li>
                    <li><span className="font-semibold">Simulate Uploads:</span> Go to the 'Storage' tab to experience a file upload flow to a mock Cloud Storage bucket.</li>
                    <li><span className="font-semibold">Monitor Events:</span> Watch the 'Activity Log' on this dashboard to see a log of all your actions.</li>
                </ul>
                <p className="text-xs text-muted-foreground">This is a simulation. All data is stored in your browser session and will be lost on refresh.</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
