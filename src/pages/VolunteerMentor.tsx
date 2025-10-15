import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function VolunteerMentor() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    qualification: "",
    year: "",
    languages: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast({ title: "Missing required fields", description: "Name and Email are required.", variant: "destructive" });
      return;
    }
    try {
      setSubmitting(true);
      const resp = await fetch("http://localhost:4000/mentors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!resp.ok) throw new Error("Failed to submit");
      toast({ title: "Thank you!", description: "Your mentor profile was submitted successfully." });
      navigate("/community", { replace: true });
    } catch (err) {
      toast({ title: "Submission failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Volunteer as a Peer Mentor</CardTitle>
            <CardDescription>Share your experience to guide and support fellow astronauts.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name *</label>
                  <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g., Aditi Sharma" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Email *</label>
                  <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Optional" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Year</label>
                  <Input name="year" value={form.year} onChange={handleChange} placeholder="e.g., Final Year" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Specialization</label>
                  <Input name="specialization" value={form.specialization} onChange={handleChange} placeholder="Academic, Career, Emotional..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Languages</label>
                  <Input name="languages" value={form.languages} onChange={handleChange} placeholder="English, Hindi" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Qualifications / Experience</label>
                <Textarea name="qualification" value={form.qualification} onChange={handleChange} rows={4} placeholder="Describe relevant experience, training, or certifications" />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


