import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail, CheckCircle, Navigation as NavigationIcon, School } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_URL } from "@/lib/utils";

export default function BookingSession() {
  const [selectedCounselor, setSelectedCounselor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [suggestMode, setSuggestMode] = useState<"location" | "college">("location");
  const [collegeName, setCollegeName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    issue: "",
    urgency: "",
    notes: ""
  });
  const { toast } = useToast();
  const [counselors, setCounselors] = useState<any[]>([]);
  const [availability, setAvailability] = useState<{ [key: string]: { [date: string]: string[] } }>({});
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const resp = await fetch("http://localhost:4000/bookings/counselors");
        const cs = await resp.json();
        setCounselors(cs);
      } catch {
        toast({ title: "Failed to load counselors", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [toast]);

  // Prefill name and email from profile if user is signed in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        setFormData((prev) => ({
          ...prev,
          name: json.user?.name || prev.name,
          email: json.user?.email || prev.email,
        }));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const fetchAvail = async () => {
      if (!selectedCounselor || !selectedDate) return;
      try {
        let resp = await fetch(`http://localhost:4000/bookings/availability?counselor_id=${encodeURIComponent(selectedCounselor)}&date=${encodeURIComponent(selectedDate)}`);
        let rows = await resp.json();
        let free = rows.filter((r: any) => !r.is_booked).map((r: any) => r.time_slot);
        if (free.length === 0) {
          // Seed default slots for this counselor/date, then refetch
          const defaults = generateDefaultSlots(selectedCounselor);
          if (defaults.length > 0) {
            await fetch("http://localhost:4000/bookings/availability", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ counselor_id: selectedCounselor, date: selectedDate, time_slots: defaults })
            });
            resp = await fetch(`http://localhost:4000/bookings/availability?counselor_id=${encodeURIComponent(selectedCounselor)}&date=${encodeURIComponent(selectedDate)}`);
            rows = await resp.json();
            free = rows.filter((r: any) => !r.is_booked).map((r: any) => r.time_slot);
          }
        }
        setAvailability((prev) => ({
          ...prev,
          [selectedCounselor]: { ...(prev[selectedCounselor] || {}), [selectedDate]: free }
        }));
      } catch {}
    };
    fetchAvail();
  }, [selectedCounselor, selectedDate]);

  const timeSlots = useMemo(() => {
    return availability[selectedCounselor]?.[selectedDate] || [];
  }, [availability, selectedCounselor, selectedDate]);

  const formatTime = (h: number) => {
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h < 12 ? "AM" : "PM";
    const hh = hour12.toString().padStart(2, "0");
    return `${hh}:00 ${ampm}`;
  };

  const generateDefaultSlots = (counselorId: string): string[] => {
    let start = 0;
    let end = 0;
    if (counselorId === "dr-sharma") {
      start = 9; end = 15; // 9:00 to 15:00
    } else if (counselorId === "dr-singh") {
      start = 15; end = 21; // 15:00 to 21:00
    } else if (counselorId === "dr-kumar") {
      start = 0; end = 8; // 00:00 to 08:00
    }
    const slots: string[] = [];
    for (let h = start; h < end; h++) {
      slots.push(formatTime(h));
    }
    return slots;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounselor || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select counselor, date and time slot.",
        variant: "destructive"
      });
      return;
    }
    try {
      const resp = await fetch("http://localhost:4000/bookings/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          counselor_id: selectedCounselor,
          date: selectedDate,
          time_slot: selectedTime,
          ...formData,
        }),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || "Booking failed");
      }
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
      // Reset form
      setFormData({ name: "", email: "", phone: "", issue: "", urgency: "", notes: "" });
      setSelectedCounselor("");
      setSelectedDate("");
      setSelectedTime("");
      // refresh user's lists if email was provided
      if (formData.email) {
        await loadUserBookings(formData.email);
      }
    } catch (e) {
      toast({ title: "Could not book session", description: (e as Error).message, variant: "destructive" });
    }
  };

  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const loadUserBookings = async (email: string) => {
    try {
      const resp = await fetch(`http://localhost:4000/bookings/list?email=${encodeURIComponent(email)}`);
      const data = await resp.json();
      const now = new Date();
      const split = data.reduce(
        (acc: any, b: any) => {
          const dt = new Date(`${b.date} ${b.time_slot}`);
          if (dt >= now && b.status === "scheduled") acc.upcoming.push(b);
          else acc.history.push(b);
          return acc;
        },
        { upcoming: [], history: [] }
      );
      setUpcoming(split.upcoming);
      setHistory(split.history);
    } catch {}
  };

  useEffect(() => {
    if (formData.email) {
      loadUserBookings(formData.email);
    }
  }, [formData.email]);

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40"></div>
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto bg-success text-success-foreground rounded-xl shadow-2xl px-6 py-4 text-center animate-in fade-in zoom-in-95 duration-300">
            <p className="font-semibold text-lg">Session Booked Successfully!</p>
            <p className="opacity-90 mt-1">Your step toward wellness is a step toward hope.</p>
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 z-10 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Book Counseling Session
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect with our qualified mental health professionals for confidential, supportive guidance
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Counselor Selection */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Select Counselor
                    </CardTitle>
                    <CardDescription>
                      Choose a counselor based on their specialization and availability
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <Button size="sm" variant={suggestMode === "location" ? "default" : "outline"} onClick={() => setSuggestMode("location")}>
                      <NavigationIcon className="h-4 w-4 mr-1" /> Location
                    </Button>
                    <Button size="sm" variant={suggestMode === "college" ? "default" : "outline"} onClick={() => setSuggestMode("college")}>
                      <School className="h-4 w-4 mr-1" /> College
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {/* Suggestions Panel */}
              <CardContent className="space-y-4">
                {suggestMode === "location" && (
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" /> Suggestions near you (top 3)
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {[{ id: "dr-sharma", name: "Dr. Priya Sharma", distance: "1.2 km", window: "9:00 AM - 3:00 PM" }, { id: "dr-kumar", name: "Dr. Raj Kumar", distance: "2.8 km", window: "12:00 AM - 8:00 AM" }, { id: "dr-singh", name: "Dr. Aman Singh", distance: "3.5 km", window: "3:00 PM - 9:00 PM" }].map((s) => (
                        <div key={s.id} className={`p-3 rounded-lg border ${selectedCounselor === s.id ? "border-primary bg-primary/5" : "border-border"}`}>
                          <div className="font-medium">{s.name}</div>
                          <div className="text-xs text-muted-foreground">Approx. {s.distance}</div>
                          <div className="text-xs mt-1">Availability: {s.window}</div>
                          <Button className="mt-2 w-full" size="sm" onClick={() => setSelectedCounselor(s.id)}>Use this counselor</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {suggestMode === "college" && (
                  <div className="p-3 border rounded-md">
                    <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                      <School className="h-4 w-4" /> Find by College
                    </div>
                    <div className="flex items-center gap-2">
                      <Input placeholder="Enter college name (e.g., PICT)" value={collegeName} onChange={(e) => setCollegeName(e.target.value)} />
                    </div>
                    {collegeName.trim().length > 0 && (
                      <div className="mt-3 grid md:grid-cols-3 gap-3">
                        {(collegeName.trim().toLowerCase() === "pict"
                          ? [...counselors].sort(() => 0.5 - Math.random()).slice(0, 3)
                          : []
                        ).map((c) => (
                          <div key={c.id} className={`p-3 rounded-lg border ${selectedCounselor === c.id ? "border-primary bg-primary/5" : "border-border"}`}>
                            <div className="font-medium">{c.name}</div>
                            <div className="text-xs text-muted-foreground">{c.specialization}</div>
                            <div className="text-xs">Languages: {c.languages}</div>
                            <Button className="mt-2 w-full" size="sm" onClick={() => setSelectedCounselor(c.id)}>Use this counselor</Button>
                          </div>
                        ))}
                        {collegeName.trim().toLowerCase() !== "pict" && (
                          <div className="text-sm text-muted-foreground col-span-3">No mapped counselors for this college yet.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardContent className="space-y-4">
                {counselors.map((counselor) => (
                  <div
                    key={counselor.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCounselor === counselor.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedCounselor(counselor.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{counselor.name}</h3>
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-yellow-500">★</span>
                        <span className="text-sm font-medium">{counselor.rating}</span>
                      </div>
                    </div>
                    <p className="text-primary font-medium mb-2">{counselor.specialization}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Experience: {counselor.experience}</p>
                      <p>Languages: {counselor.languages}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Preferred Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label>Available Time Slots</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {timeSlots.map((time) => (
                        <Button
                          key={time}
                          variant={selectedTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTime(time)}
                          className="justify-start"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {time}
                        </Button>
                      ))}
                      {timeSlots.length === 0 && selectedCounselor && selectedDate && (
                        <div className="text-sm text-muted-foreground col-span-2">No available slots yet for this date.</div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your information is kept strictly confidential
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="urgency">Session Urgency</Label>
                      <Select value={formData.urgency} onValueChange={(value) => setFormData({...formData, urgency: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low - General Support</SelectItem>
                          <SelectItem value="medium">Medium - Need Guidance</SelectItem>
                          <SelectItem value="high">High - Urgent Support</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="issue">Main Concern *</Label>
                    <Select value={formData.issue} onValueChange={(value) => setFormData({...formData, issue: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your main concern" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anxiety">Anxiety & Stress</SelectItem>
                        <SelectItem value="depression">Depression & Mood</SelectItem>
                        <SelectItem value="academic">Academic Pressure</SelectItem>
                        <SelectItem value="relationships">Relationships & Social Issues</SelectItem>
                        <SelectItem value="career">Career & Future Planning</SelectItem>
                        <SelectItem value="family">Family Issues</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any specific details you'd like to share..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Book Session
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Session Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">50 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">Astronaut Counseling Center, Room 201</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Emergency</p>
                    <p className="text-sm text-muted-foreground">Call: 1800-599-0019</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What to Expect</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium mb-1">✓ Confidential Environment</p>
                  <p className="text-muted-foreground">Your privacy is our priority</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">✓ Professional Support</p>
                  <p className="text-muted-foreground">Qualified mental health professionals</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium mb-1">✓ Personalized Care</p>
                  <p className="text-muted-foreground">Tailored to your specific needs</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-wellness">
              <CardContent className="p-4">
                <div className="text-white text-center">
                  <Mail className="h-8 w-8 mx-auto mb-2" />
                  <p className="font-medium mb-1">Need Immediate Help?</p>
                  <p className="text-sm opacity-90">Contact our 24/7 crisis helpline</p>
                  <Button variant="glass" size="sm" className="mt-3">
                    Get Help Now
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scheduled Bookings</CardTitle>
                <CardDescription>Upcoming sessions associated with the entered email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(!formData.email || upcoming.length === 0) && (
                  <p className="text-sm text-muted-foreground">{!formData.email ? "Enter your email to view." : "No upcoming sessions."}</p>
                )}
                {upcoming.map((b) => (
                  <div key={b.id} className="p-3 border rounded-md">
                    <div className="font-medium">{b.counselor_name}</div>
                    <div className="text-sm text-muted-foreground">{b.specialization}</div>
                    <div className="text-sm mt-1">{b.date} • {b.time_slot}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Booking History</CardTitle>
                <CardDescription>Past sessions for the entered email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(!formData.email || history.length === 0) && (
                  <p className="text-sm text-muted-foreground">{!formData.email ? "Enter your email to view." : "No past sessions."}</p>
                )}
                {history.map((b) => (
                  <div key={b.id} className="p-3 border rounded-md">
                    <div className="font-medium">{b.counselor_name}</div>
                    <div className="text-sm text-muted-foreground">{b.specialization}</div>
                    <div className="text-sm mt-1">{b.date} • {b.time_slot}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
