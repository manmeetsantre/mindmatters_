import { useEffect } from "react";
import { io } from "socket.io-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Analytics from "./Analytics";
import AdminEntries from "./AdminEntries";
import AdminProfiles from "./AdminProfiles";
import AdminAssessments from "./AdminAssessments";

export default function AdminDashboard() {
  useEffect(() => {
    const socket = io('http://localhost:4000');
    socket.on('entries-updated', (data) => {
      toast(`Sign-in entries updated. Total: ${data.count}`);
    });
    socket.on('profiles-updated', (data) => {
      toast(`User profiles updated. Total: ${data.count}`);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Unified view for analytics, entries, profiles, and assessments with real-time updates.</p>
        </div>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="entries">Sign-in Entries</TabsTrigger>
            <TabsTrigger value="profiles">User Profiles</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="mt-6">
            <Analytics />
          </TabsContent>
          <TabsContent value="entries" className="mt-6">
            <AdminEntries />
          </TabsContent>
          <TabsContent value="profiles" className="mt-6">
            <AdminProfiles />
          </TabsContent>
          <TabsContent value="assessments" className="mt-6">
            <AdminAssessments />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
