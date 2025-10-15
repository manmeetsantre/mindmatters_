import { useEffect, useState } from "react";
import { API_URL } from "@/lib/utils";
import io from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Filter, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Entry = {
  id: number;
  signed_in_at: string;
  ip: string | null;
  user_agent: string | null;
  user_id: number;
  name: string;
  email: string;
  role: string;
};

type EntriesResponse = {
  entries: Entry[];
  total: number;
  page: number;
  limit: number;
};

export default function AdminEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);

  const fetchEntries = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please log in as admin.");
      setLoading(false);
      return;
    }
    let url = `${API_URL}/admin/entries?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (role !== "all") url += `&role=${role}`;
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Admin access required. Please log in with admin credentials.");
          setError("Unauthorized access. Please log in as admin.");
        } else {
          throw new Error(json?.error || "Failed to load entries");
        }
        return;
      }
      setEntries(json.entries);
      setTotal(json.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const newSocket = io(API_URL, { withCredentials: true });
    newSocket.on('connect', () => {
      console.log('Connected to real-time updates');
    });
    newSocket.on('entries-updated', (data: any) => {
      if (data.type === 'new') {
        setEntries(prev => [data.entry, ...prev.slice(0, limit - 1)]);
        setTotal(prev => prev + 1);
      } else if (data.type === 'delete') {
        setEntries(prev => prev.filter(e => e.id !== data.id));
        setTotal(prev => prev - 1);
      }
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [page, search, role]);

  const exportCSV = () => {
    const headers = ["Time", "User", "Email", "Role", "IP", "User Agent"];
    const csv = [
      headers.join(","),
      ...entries.map(e => [
        new Date(e.signed_in_at).toLocaleString(),
        e.name,
        e.email,
        e.role,
        e.ip || "",
        `"${e.user_agent || ""}"` // Quote to handle commas
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sign-in-entries.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteEntry = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this sign-in entry?")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/entries/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Entry deleted successfully");
        fetchEntries(); // Refresh list
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to delete entry");
      }
    } catch (e: any) {
      toast.error("Failed to delete entry");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sign-in Entries</CardTitle>
              <CardDescription>Recent user sign-in activity with search and filters.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchEntries} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button onClick={exportCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="text-red-500 text-sm p-3 bg-red-50 rounded-md">{error}</div>}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                disabled={loading}
              />
            </div>
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>User Agent</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No entries found</TableCell>
                  </TableRow>
                ) : (
                  entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{new Date(e.signed_in_at).toLocaleString()}</TableCell>
                      <TableCell>{e.name}</TableCell>
                      <TableCell>{e.email}</TableCell>
                      <TableCell>
                        <Badge variant={e.role === 'admin' ? 'secondary' : 'default'}>{e.role}</Badge>
                      </TableCell>
                      <TableCell>{e.ip || "-"}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={e.user_agent || undefined}>{e.user_agent || "-"}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => deleteEntry(e.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        onClick={() => setPage(pageNum)} 
                        className={page === pageNum ? 'bg-primary text-primary-foreground' : 'cursor-pointer'}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
