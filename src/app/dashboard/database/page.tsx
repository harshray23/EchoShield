"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppContext } from '@/lib/AppContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const docSchema = z.object({
  name: z.string().min(1, { message: "Document name/path is required." }),
  data: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }, { message: "Must be valid JSON." }),
});

export default function DatabasePage() {
  const { documents, addDocument, deleteDocument } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof docSchema>>({
    resolver: zodResolver(docSchema),
    defaultValues: { name: "", data: "" },
  });

  function onSubmit(values: z.infer<typeof docSchema>) {
    addDocument(values.name, JSON.parse(values.data));
    form.reset();
    setIsDialogOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Database</h1>
            <p className="text-muted-foreground">Simulated Firestore document management.</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Document</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Document</DialogTitle>
                    <DialogDescription>Enter a name (e.g., users/jdoe) and JSON data for your new document.</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Document Name / Path</FormLabel>
                                <FormControl><Input placeholder="collection/docId" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="data" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Data (JSON)</FormLabel>
                                <FormControl><Textarea placeholder='{ "field": "value" }' className="font-code" rows={5} {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <DialogFooter>
                            <Button type="submit">Create Document</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
          </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>A list of documents in your simulated database.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name / Path</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length > 0 ? documents.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium font-code">{doc.name}</TableCell>
                  <TableCell><pre className="text-xs bg-muted/50 p-2 rounded-md font-code">{JSON.stringify(doc.data, null, 2)}</pre></TableCell>
                  <TableCell>{format(doc.createdAt, 'PPp')}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the document
                             <span className="font-semibold font-code mx-1">{doc.name}</span>.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteDocument(doc.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No documents yet. Add one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
