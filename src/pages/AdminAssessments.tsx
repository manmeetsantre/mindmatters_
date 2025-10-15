import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Filter, Eye, Trash2 } from "lucide-react";
import { API_URL } from "@/lib/utils";
import { toast } from "sonner";

interface Assessment {
  id: number;
  assessment_type: string;
  answers: string;
  results: string;
  created_at: string;
  user_id: number;
  name: string;
  email: string;
}

export default function AdminAssessments() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [assessmentType, setAssessmentType] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 20;

  const fetchAssessments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please log in as admin.");
        setLoading(false);
        return;
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        assessment_type: assessmentType
      });

      const response = await fetch(`${API_URL}/admin/assessments?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      } else if (response.status === 401) {
        toast.error("Admin access required. Please log in with admin credentials.");
      } else {
        console.error('Failed to fetch assessments:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssessment = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this assessment?")) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication required.");
      return;
    }
    try {
      const res = await fetch(`${API_URL}/admin/assessments/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Assessment deleted successfully");
        fetchAssessments(); // Refresh list
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to delete assessment");
      }
    } catch (e: any) {
      toast.error("Failed to delete assessment");
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [page, search, assessmentType]);

  const getRiskLevel = (resultsStr: string) => {
    try {
      const results = JSON.parse(resultsStr);
      const hasHigh = results.some((r: any) => r.riskLevel === 'high');
      const hasMedium = results.some((r: any) => r.riskLevel === 'medium');
      if (hasHigh) return 'high';
      if (hasMedium) return 'medium';
      return 'low';
    } catch {
      return 'unknown';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading assessments...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Assessment Records</h2>
          <p className="text-muted-foreground">View and manage user assessment submissions</p>
        </div>
        <Badge variant="secondary">{total} total assessments</Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={assessmentType} onValueChange={setAssessmentType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Assessment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="phq9">PHQ-9</SelectItem>
                <SelectItem value="gad7">GAD-7</SelectItem>
                <SelectItem value="ghq12">GHQ-12</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((assessment) => (
                <TableRow key={assessment.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{assessment.name}</div>
                      <div className="text-sm text-muted-foreground">{assessment.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{assessment.assessment_type.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRiskColor(getRiskLevel(assessment.results))}>
                      {getRiskLevel(assessment.results)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(assessment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => deleteAssessment(assessment.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(Math.max(1, page - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <PaginationItem key={pageNum}>
                <PaginationLink 
                  onClick={() => setPage(pageNum)}
                  isActive={page === pageNum}
                  className="cursor-pointer"
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
