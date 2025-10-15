import { useEffect, useState } from "react";
import { API_URL } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Download, Search, Filter, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Profile = {
  user_id: number;
  name: string;
  email: string;
  role: string;
  age: number | null;
  locality: string | null;
  personalNotes: string | null;
  goals: string | null;
  updated_at: string | null;
};

type ProfilesResponse = {
  profiles: Profile[];
  total: number;
  page: number;
  limit: number;
};

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required. Please log in as admin.");
      setLoading(false);
      return;
    }
    let url = `${API_URL}/admin/profiles?page=${page}&limit=${limit}`;
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
          throw new Error(json?.error || "Failed to load profiles");
        }
        return;
      }
      setProfiles(json.profiles);
      setTotal(json.total);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [page, search, role]);

  const exportCSV = () => {
    const headers = ["User", "Email", "Role", "Age", "Locality", "Goals", "Updated"];
    const csv = [
      headers.join(","),
      ...profiles.map(p => [
        p.name,
        p.email,
        p.role,
        p.age || "",
        p.locality || "",
        `"${p.goals || ""}"`,
        p.updated_at ? new Date(p.updated_at).toLocaleString() : ""
      ].join(","))
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user-profiles.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteProfile = async (user_id: number) => {
    if (!window.confirm("Are you sure you want to delete this user profile?")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/profiles/${user_id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Profile deleted successfully");
        fetchProfiles(); // Refresh list
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to delete profile");
      }
    } catch (e: any) {
      toast.error("Failed to delete profile");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Profiles</CardTitle>
              <CardDescription>User profiles with search and filters.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchProfiles} disabled={loading}>
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
                placeholder="Search by name, email, locality, or goals..."
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
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Locality</TableHead>
                  <TableHead>Goals</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                  </TableRow>
                ) : profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No profiles found</TableCell>
                  </TableRow>
                ) : (
                  profiles.map((p) => (
                    <TableRow key={p.user_id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.email}</TableCell>
                      <TableCell>
                        <Badge variant={p.role === 'admin' ? 'secondary' : 'default'}>{p.role}</Badge>
                      </TableCell>
                      <TableCell>{p.age ?? "-"}</TableCell>
                      <TableCell>{p.locality ?? "-"}</TableCell>
                      <TableCell className="max-w-[300px] truncate" title={p.goals ?? undefined}>{p.goals ?? "-"}</TableCell>
                      <TableCell>{p.updated_at ? new Date(p.updated_at).toLocaleString() : "-"}</TableCell>
                      <TableCell>
                        <Button variant="destructive" size="sm" onClick={() => deleteProfile(p.user_id)}>
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
