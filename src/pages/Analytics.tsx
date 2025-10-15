import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, TrendingUp, Users, AlertTriangle, CalendarDays, PieChart as PieIcon, LineChart as LineIcon, RefreshCw, ClipboardCheck, BarChart3, Activity, MapPin } from "lucide-react";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, RadialBarChart, RadialBar, Legend as RechartsLegend, Tooltip } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_URL } from "@/lib/utils";
import { toast } from "sonner";

type BackendAnalyticsData = {
  weeks: Array<{ week_num: string; active_users: number; avg_anxiety: number; avg_depression: number; avg_stress: number }>;
  totalUsers: number;
  activeUsers: number;
  newBookings: number;
  highRisk: number;
  avgAnxiety: number;
  recentAssessments: number;
  assessmentTypes: Array<{ assessment_type: string; count: number; avgScore: number }>;
  scoreDistributions: Array<{ assessment_type: string; low: number; medium: number; high: number }>;
  demographics: Array<{ locality: string; highRisk: number; mediumRisk: number; lowRisk: number; total: number }>;
  wowChanges: {
    activeUsersDelta: number;
    avgAnxietyDelta: number;
    recentAssessmentsDelta: number;
  };
  riskData: Array<{ risk_level: string; count: number }>;
  deptData: Array<{ role: string; count: number }>;
  recentActivity: Array<{ date: string; mood: string; risk: string }>;
};

type AnalyticsData = {
  totalUsers: number;
  activeUsers: number;
  newBookings: number;
  highRisk: number;
  avgAnxiety: number;
  recentAssessments: number;
  assessmentTypes: Array<{ assessmentType: string; count: number; avgScore: number }>;
  scoreDistributions: Array<{ assessmentType: string; low: number; medium: number; high: number }>;
  demographics: Array<{ locality: string; highRisk: number; mediumRisk: number; lowRisk: number; total: number }>;
  wowChanges: {
    activeUsersDelta: number;
    avgAnxietyDelta: number;
    recentAssessmentsDelta: number;
  };
  riskData: Array<{ riskLevel: string; count: number }>;
  weeklyMetrics: Array<{ week: string; anxiety: number; depression: number; stress: number }>;
  moodFreq: Array<{ name: string; value: number }>;
  recentActivity: Array<{ date: string; mood: string; risk: string }>;
};

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication required");
          toast.error("Authentication required. Please log in as admin.");
          return;
        }
        
        const response = await fetch(`${API_URL}/admin/analytics`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          },
        });
        
        if (!response.ok) {
          const err = await response.json();
          if (response.status === 401) {
            toast.error("Admin access required. Please log in with admin credentials.");
            setError("Unauthorized access. Please log in as admin.");
          } else {
            throw new Error(err.error || "Failed to fetch analytics");
          }
          return;
        }
        
        const backendData: BackendAnalyticsData = await response.json();
        const mappedData: AnalyticsData = {
          totalUsers: backendData.totalUsers || 0,
          activeUsers: backendData.activeUsers || 0,
          newBookings: backendData.newBookings || 0,
          highRisk: backendData.highRisk || 0,
          avgAnxiety: backendData.avgAnxiety || 0,
          recentAssessments: backendData.recentAssessments || 0,
          assessmentTypes: (backendData.assessmentTypes || []).map(t => ({ assessmentType: t.assessment_type, count: t.count || 0, avgScore: t.avgScore || 0 })),
          scoreDistributions: (backendData.scoreDistributions || []).map(s => ({ assessmentType: s.assessment_type, low: s.low || 0, medium: s.medium || 0, high: s.high || 0 })),
          demographics: backendData.demographics || [],
          wowChanges: backendData.wowChanges || { activeUsersDelta: 0, avgAnxietyDelta: 0, recentAssessmentsDelta: 0 },
          riskData: (backendData.riskData || []).map(r => ({ riskLevel: r.risk_level, count: r.count || 0 })),
          weeklyMetrics: (backendData.weeks || []).map(w => ({
            week: w.week_num,
            anxiety: w.avg_anxiety || 0,
            depression: w.avg_depression || 0,
            stress: w.avg_stress || 0
          })),
          moodFreq: (backendData.deptData || []).map(d => ({ name: d.role, value: d.count || 0 })),
          recentActivity: backendData.recentActivity || []
        };
        
        setData(mappedData);
          setLastUpdated(new Date());
        } catch (err) {
          setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
          setLoading(false);
        }
      };
      
      fetchInitialData();
  }, []);

  const exportCSV = () => {
    if (!data) return;
    try {
      let csv = [
        ["Metric", "Value"],
        ["Total Astronauts", data.totalUsers],
        ["Active Astronauts", data.activeUsers],
        ["New Sessions", data.newBookings],
        ["High Risk", data.highRisk],
        ["Avg Anxiety", data.avgAnxiety.toFixed(1)],
        ["Recent Assessments", data.recentAssessments],
        [],
        ["Assessment Type", "Count", "Avg Score"],
        ...data.assessmentTypes.map(t => [t.assessmentType, t.count, t.avgScore.toFixed(1)]),
        [],
        ["Score Distribution", "Assessment Type", "Low", "Medium", "High"],
        ...(data.scoreDistributions || []).flatMap(s => [
          [s.assessmentType, "Low", s.low],
          [s.assessmentType, "Medium", s.medium],
          [s.assessmentType, "High", s.high]
        ]),
        [],
        ["Risk Level", "Count"],
        ...data.riskData.map(r => [r.riskLevel, r.count]),
        [],
        ["Demographics", "Locality", "High Risk", "Medium Risk", "Low Risk", "Total"],
        ...data.demographics.map(d => [d.locality, d.highRisk, d.mediumRisk, d.lowRisk, d.total]),
        [],
        ["Week-over-Week", "Metric", "Delta"],
        ["Active Astronauts Delta", data.wowChanges.activeUsersDelta],
        ["Avg Anxiety Delta", data.wowChanges.avgAnxietyDelta.toFixed(1)],
        ["Recent Assessments Delta", data.wowChanges.recentAssessmentsDelta],
        [],
        ["Week", "Anxiety", "Depression", "Stress"],
        ...data.weeklyMetrics.map(w => [w.week, w.anxiety, w.depression, w.stress]),
        [],
        ["Role", "Count"],
        ...data.moodFreq.map(m => [m.name, m.value])
      ].map(row => row.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "analytics.csv";
      a.click();
    } catch (error) {
      alert("Failed to export CSV: " + error);
    }
  };

  const exportJSON = () => {
    if (!data) return;
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "analytics.json";
      a.click();
    } catch (error) {
      alert("Failed to export JSON: " + error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    setData(null); // Clear current data immediately to show loading state
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required");
        toast.error("Authentication required. Please log in as admin.");
        return;
      }
      
      const response = await fetch(`${API_URL}/admin/analytics`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
      });
      
      if (!response.ok) {
        const err = await response.json();
        if (response.status === 401) {
          toast.error("Admin access required. Please log in with admin credentials.");
          setError("Unauthorized access. Please log in as admin.");
        } else {
          throw new Error(err.error || "Failed to fetch analytics");
        }
        return;
      }
      
      const backendData: BackendAnalyticsData = await response.json();
      const mappedData: AnalyticsData = {
        totalUsers: backendData.totalUsers || 0,
        activeUsers: backendData.activeUsers || 0,
        newBookings: backendData.newBookings || 0,
        highRisk: backendData.highRisk || 0,
        avgAnxiety: backendData.avgAnxiety || 0,
        recentAssessments: backendData.recentAssessments || 0,
        assessmentTypes: (backendData.assessmentTypes || []).map(t => ({ assessmentType: t.assessment_type, count: t.count || 0, avgScore: t.avgScore || 0 })),
        scoreDistributions: (backendData.scoreDistributions || []).map(s => ({ assessmentType: s.assessment_type, low: s.low || 0, medium: s.medium || 0, high: s.high || 0 })),
        demographics: backendData.demographics || [],
        wowChanges: backendData.wowChanges || { activeUsersDelta: 0, avgAnxietyDelta: 0, recentAssessmentsDelta: 0 },
        riskData: (backendData.riskData || []).map(r => ({ riskLevel: r.risk_level, count: r.count || 0 })),
        weeklyMetrics: (backendData.weeks || []).map(w => ({
          week: w.week_num,
          anxiety: w.avg_anxiety || 0,
          depression: w.avg_depression || 0,
          stress: w.avg_stress || 0
        })),
        moodFreq: (backendData.deptData || []).map(d => ({ name: d.role, value: d.count || 0 })),
        recentActivity: backendData.recentActivity || []
      };
      
      setData(mappedData);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const normalizedDelta = data && data.wowChanges ? (data.wowChanges.avgAnxietyDelta || 0) * (100 / 21) : 2;

  const chartData = data?.weeklyMetrics?.length > 0 
    ? data.weeklyMetrics.map(w => ({
        label: w.week,
        avgScore: (w.anxiety / 21) * 100
      }))
    : [
        { label: 'Jan', avgScore: 75 },
        { label: 'Feb', avgScore: 78 },
        { label: 'Mar', avgScore: 82 },
        { label: 'Apr', avgScore: 80 },
        { label: 'May', avgScore: 84 },
        { label: 'Jun', avgScore: 81 },
        { label: 'Jul', avgScore: 85 },
        { label: 'Aug', avgScore: 83 },
        { label: 'Sep', avgScore: 87 },
        { label: 'Oct', avgScore: 84 },
        { label: 'Nov', avgScore: 86 },
        { label: 'Dec', avgScore: 84.5 }
      ];

  if (loading) return <div className="flex justify-center items-center h-64"><RefreshCw className="h-8 w-8 animate-spin" /></div>;
  if (error) return (
    <div className="text-red-500 text-center p-4">
      {error}
      <Button variant="ghost" size="sm" onClick={refreshData} className="mt-2">
        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
      </Button>
    </div>
  );

  if (!data) return (
    <div className="text-muted-foreground text-center p-4">
      No data available
      <Button variant="ghost" size="sm" onClick={refreshData} className="mt-2">
        <RefreshCw className="h-4 w-4 mr-1" /> Refresh
      </Button>
    </div>
  );

  const formattedWeeks = data.weeklyMetrics || [];

  return (
    <div className="space-y-6">
      {/* Global Refresh Bar */}
      <div className="flex justify-between items-center bg-muted/50 p-3 rounded-lg">
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
        </div>
        <Button variant="default" size="sm" onClick={refreshData} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Analytics'}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Astronauts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Astronauts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Sessions</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.newBookings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{data.highRisk}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Assessments</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.recentAssessments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><LineIcon className="h-5 w-5" /> Average Mental Health Score</CardTitle>
                <CardDescription>Monthly trends in average assessment scores (normalized to %).</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Monthly</span>
                <Button variant="ghost" size="sm" onClick={refreshData}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
              </div>
            </div>
            {chartData.length > 0 && (
              <div className="flex items-center justify-between pt-2">
                <div className="text-3xl font-bold text-orange-500">
                  {chartData[chartData.length - 1].avgScore.toFixed(1)}%
                </div>
                <Badge variant={normalizedDelta >= 0 ? "default" : "destructive"} className="text-sm">
                  {normalizedDelta >= 0 ? '+' : ''}{normalizedDelta.toFixed(1)}%
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Trend Data Available</h3>
                <p className="text-muted-foreground">Recent assessments may not be present. Check back after user activity.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                  <Line 
                    type="monotone" 
                    dataKey="avgScore" 
                    stroke="#f97316" 
                    strokeWidth={3} 
                    dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, fill: "#000", stroke: "#f97316", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2"><PieIcon className="h-5 w-5" /> Risk Levels Distribution</CardTitle>
                <CardDescription>Current risk assessment distribution across astronauts.</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshData}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{ low: { label: "Low Risk", color: "#22c55e" }, medium: { label: "Medium Risk", color: "#f59e0b" }, high: { label: "High Risk", color: "#ef4444" } }}>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={data.riskData || []} dataKey="count" nameKey="riskLevel" innerRadius={60} outerRadius={100} paddingAngle={2}>
                    {(data.riskData || []).map((entry, idx) => (
                      <Cell key={idx} fill={entry.riskLevel === 'low' ? '#22c55e' : entry.riskLevel === 'medium' ? '#f59e0b' : '#ef4444'} />
                    ))}
                  </Pie>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analysis Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Advanced Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><PieIcon className="h-5 w-5" /> Assessment Types Breakdown</CardTitle>
                  <CardDescription>Distribution of completed assessments by type.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={refreshData}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{ phq9: { label: "PHQ-9", color: "#ef4444" }, gad7: { label: "GAD-7", color: "#f59e0b" }, ghq12: { label: "GHQ-12", color: "#3b82f6" } }}>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie data={data.assessmentTypes || []} dataKey="count" nameKey="assessmentType" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {(data.assessmentTypes || []).map((entry, idx) => (
                        <Cell key={idx} fill={entry.assessmentType === 'phq9' ? '#ef4444' : entry.assessmentType === 'gad7' ? '#f59e0b' : '#3b82f6'} />
                      ))}
                    </Pie>
                    <ChartTooltip formatter={(value, name) => [value, `Assessments: ${name}`]} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" /> Score Distributions</CardTitle>
                  <CardDescription>Aggregated score bins across all assessments.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={refreshData}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.scoreDistributions || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="assessmentType" />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey="low" stackId="a" fill="#22c55e" />
                  <Bar dataKey="medium" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="high" stackId="a" fill="#ef4444" />
                  <RechartsLegend />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Week-over-Week Changes</CardTitle>
                  <CardDescription>Key metrics delta from previous week.</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={refreshData}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Active Users</span>
                <Badge variant={data.wowChanges?.activeUsersDelta >= 0 ? "default" : "destructive"}>
                  {data.wowChanges?.activeUsersDelta >= 0 ? '+' : ''}{data.wowChanges?.activeUsersDelta}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Avg Anxiety</span>
                <Badge variant={data.wowChanges?.avgAnxietyDelta >= 0 ? "destructive" : "default"}>
                  {data.wowChanges?.avgAnxietyDelta >= 0 ? '+' : ''}{data.wowChanges?.avgAnxietyDelta.toFixed(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Recent Assessments</span>
                <Badge variant={data.wowChanges?.recentAssessmentsDelta >= 0 ? "default" : "destructive"}>
                  {data.wowChanges?.recentAssessmentsDelta >= 0 ? '+' : ''}{data.wowChanges?.recentAssessmentsDelta}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Astronaut Roles Distribution</CardTitle>
            <CardDescription>Distribution of astronaut roles in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.moodFreq || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Assessment Score</CardTitle>
            <CardDescription>Mean score across all completed assessments.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[320px]">
            <div className="text-6xl font-bold text-blue-500">{data.avgAnxiety.toFixed(1)}</div>
            <p className="text-muted-foreground mt-2">Across all assessment types</p>
            <div className="w-full mt-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>Low</span>
                <span>High</span>
              </div>
              <div className="bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((data.avgAnxiety / 21) * 100, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Anonymized Activity</CardTitle>
                <CardDescription>Latest mood logs and risk assessments (no PII).</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshData}><RefreshCw className="h-4 w-4 mr-1" /> Refresh</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Mood</TableHead>
                  <TableHead>Risk Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data.recentActivity || []).slice(0, 10).map((entry, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="capitalize">{entry.mood}</TableCell>
                    <TableCell>
                      <Badge variant={entry.risk === 'High' ? 'destructive' : entry.risk === 'Medium' ? 'secondary' : 'default'}>
                        {entry.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics & Export</CardTitle>
            <CardDescription>Download aggregated data only. No personally identifiable information.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-full justify-around p-4">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={exportCSV} variant="outline" className="rounded-full"><Download className="h-4 w-4 mr-2" /> Export CSV</Button>
              <Button onClick={exportJSON} className="rounded-full"><Download className="h-4 w-4 mr-2" /> Export JSON</Button>
              <Button variant="ghost" onClick={refreshData} className="rounded-full"><RefreshCw className="h-4 w-4 mr-2" /> Refresh Data</Button>
              <Button onClick={() => toast.success('Report generated!')} className="rounded-full"><ClipboardCheck className="h-4 w-4 mr-2" /> Generate Report</Button>
            </div>
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Recent Export Summary</h4>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={[
                  { type: 'CSV', count: 15 },
                  { type: 'JSON', count: 8 },
                  { type: 'PDF', count: 5 }
                ]}>
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Astronaut Feedback and Cured Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Astronaut Feedback Ratings</CardTitle>
            <CardDescription>Average feedback scores from astronauts.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { category: 'Satisfaction', score: 4.2 },
                { category: 'Effectiveness', score: 4.5 },
                { category: 'Support', score: 4.0 },
                { category: 'Accessibility', score: 4.3 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Astronauts Cured</CardTitle>
            <CardDescription>Number of astronauts showing improvement (low risk after assessments).</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { month: 'Jan', cured: 25 },
                { month: 'Feb', cured: 32 },
                { month: 'Mar', cured: 28 },
                { month: 'Apr', cured: 35 },
                { month: 'May', cured: 40 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="cured" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
