import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Crosshair,
  ImagePlus,
  Loader2,
  Sparkles,
  X,
  AlertTriangle,
  ShieldCheck,
  BrainCircuit,
} from "lucide-react";

import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { CATEGORIES, DISTRICTS } from "@/lib/mock-data";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/citizen/submit")({
  head: () => ({
    meta: [
      {
        title: "Report a Problem — InnovaSetu",
      },
      {
        name: "description",
        content:
          "Report a local problem with photos, location and priority.",
      },
      {
        property: "og:title",
        content: "Report a Problem — InnovaSetu",
      },
      {
        property: "og:description",
        content:
          "Report a local problem with photos, location and priority.",
      },
    ],
  }),
  component: SubmitChallenge,
});

const emergencyTypes = [
  "Health / Medical",
  "Public Safety",
  "Major Infrastructure Failure",
  "Natural Disaster",
  "Water / Food Contamination",
  "Other",
];

const categoryRules: Array<[string, string[]]> = [
  [
    "Roads",
    [
      "road",
      "bridge",
      "pothole",
      "pit",
      "highway",
      "pavement",
      "street",
      "landslide",
      "land slide",
    ],
  ],
  [
    "Water",
    [
      "water",
      "drinking",
      "contaminat",
      "pipeline",
      "tap",
    ],
  ],
  [
    "Electricity",
    [
      "electricity",
      "power outage",
      "blackout",
      "streetlight",
      "street light",
    ],
  ],
  [
    "Education",
    [
      "school",
      "college",
      "education",
      "classroom",
      "toilet",
    ],
  ],
  [
    "Health",
    [
      "hospital",
      "medical",
      "health",
      "clinic",
      "ambulance",
    ],
  ],
  [
    "Sanitation",
    [
      "garbage",
      "waste",
      "sanitation",
      "sewage",
      "drain",
      "rubbish",
    ],
  ],
];

function analyzeReport(
  title: string,
  description: string,
  problemType: string,
) {
  const text = `${title} ${description}`.toLowerCase();

  const category = categoryRules.find(([, keywords]) =>
    keywords.some((keyword) => text.includes(keyword)),
  )?.[0];

  const keywordEmergency = [
    "collapse",
    "fire",
    "accident",
    "injur",
    "bleeding",
    "contaminat",
    "flood",
    "urgent",
    "trapped",
    "danger",
    "explosion",
    "landslide",
    "land slide",
  ].some((keyword) => text.includes(keyword));

  const potentialEmergency =
    problemType === "emergency" || keywordEmergency;

  let priority = "Low";

  if (potentialEmergency) {
    priority = "Critical";
  } else if (
    [
      "blocked",
      "major",
      "severe",
      "flood",
      "bridge",
      "road got collapsed",
    ].some((keyword) => text.includes(keyword))
  ) {
    priority = "High";
  } else if (
    [
      "pothole",
      "streetlight",
      "garbage",
      "routine",
    ].some((keyword) => text.includes(keyword))
  ) {
    priority = "Medium";
  }

  return {
    category,
    priority,
    potentialEmergency,
  };
}

function Section({
  n,
  title,
  desc,
  children,
}: {
  n: number;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {n}
        </span>

        <div>
          <h2 className="font-semibold">{title}</h2>

          {desc && (
            <p className="text-sm text-muted-foreground">
              {desc}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

type SubErrors = Partial<{
  title: string;
  description: string;
  category: string;
  district: string;
  block: string;
  form: string;
}>;

function SubmitChallenge() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");

  const [latitude, setLatitude] = useState<number | null>(
    null,
  );
  const [longitude, setLongitude] = useState<number | null>(
    null,
  );

  const [problemType, setProblemType] = useState("civic");
  const [emergencyType, setEmergencyType] = useState("");

  const [photos, setPhotos] = useState<
    { file: File; name: string; url: string }[]
  >([]);

  const [errors, setErrors] = useState<SubErrors>({});
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);
  const [locationMessage, setLocationMessage] = useState<
    string | null
  >(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;

    const next = Array.from(files)
      .slice(0, 3 - photos.length)
      .map((file) => ({
        file,
        name: file.name,
        url: URL.createObjectURL(file),
      }));

    setPhotos((p) => [...p, ...next].slice(0, 3));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage(
        "Browser location is not available. Enter the location manually.",
      );
      return;
    }

    setLocationMessage("Requesting your location...");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude);
        setLongitude(coords.longitude);

        setLocationMessage(
          `Location detected (${coords.latitude.toFixed(
            4,
          )}, ${coords.longitude.toFixed(
            4,
          )}). District and block still need to be entered manually.`,
        );
      },
      () =>
        setLocationMessage(
          "Location permission was unavailable. Enter the location manually.",
        ),
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    const next: SubErrors = {};

    if (title.trim().length < 8) {
      next.title =
        "Give a clear title of at least 8 characters";
    }

    if (description.trim().length < 25) {
      next.description =
        "Please describe the issue in at least 25 characters";
    }

    if (!category) {
      next.category = "Select a fallback category";
    }

    if (!district) {
      next.district = "Select your district";
    }

    if (!block.trim()) {
      next.block = "Block or ward is required";
    }

    if (problemType === "emergency" && !emergencyType) {
      next.form = "Select an emergency type";
    }

    setErrors(next);

    if (Object.keys(next).length) return;

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setErrors({
          form:
            userError?.message ||
            "Please log in to report a challenge.",
        });

        setLoading(false);
        return;
      }

      const analysis = analyzeReport(
        title,
        description,
        problemType,
      );

      const uploadedUrls: string[] = [];

      for (const photo of photos) {
        const extension =
          photo.file.name.split(".").pop() ?? "jpg";

        const uniqueName =
          `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`;

        const path = `${user.id}/${uniqueName}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("challenge-media")
          .upload(path, photo.file);

        if (uploadError) {
          setErrors({
            form: `Photo upload failed: ${uploadError.message}`,
          });

          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("challenge-media")
          .getPublicUrl(path);

        uploadedUrls.push(data.publicUrl);
      }

      const initialStatus = analysis.potentialEmergency
        ? "submitted"
        : "open_for_university_solutions";

      const {
        data: insertedChallenge,
        error: insertError,
      } = await supabase
        .from("challenges")
        .insert({
          citizen_id: user.id,
          title: title.trim(),
          description: description.trim(),
          district,
          block_ward: block.trim(),
          latitude,
          longitude,
          category: analysis.category ?? category,
          priority: analysis.priority,
          is_emergency: analysis.potentialEmergency,
          emergency_type:
            analysis.potentialEmergency
              ? problemType === "emergency"
                ? emergencyType
                : "AI Detected Emergency"
              : null,
          triage_status: "pending_review",
          status: initialStatus,
          media_urls: uploadedUrls,
        })
        .select("id")
        .single();

      if (insertError) {
        setErrors({
          form:
            insertError.message ||
            "We could not submit your challenge.",
        });

        setLoading(false);
        return;
      }

      setSubmittedId(insertedChallenge?.id ?? null);
      setErrors({});
    } catch (error: any) {
      console.error(
        "Challenge submission error:",
        error,
      );

      setErrors({
        form:
          error?.message ||
          "Something went wrong while submitting the challenge.",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
   * SUCCESS SCREEN
   */
  if (submittedId) {
    // Generate a friendly short ID from the UUID
    const shortId = `SICP-${submittedId.slice(0, 6).toUpperCase()}`;

    return (
      <AppLayout
        role="citizen"
        title="Report Submitted"
      >
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-success/20 bg-card p-8 md:p-12 text-center shadow-sm">
            <span className="mx-auto grid size-20 place-items-center rounded-full bg-success/10 text-success mb-6">
              <CheckCircle2 className="size-10" />
            </span>

            <h2 className="text-3xl font-bold text-foreground">
              Thank you for reporting!
            </h2>

            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Your report has been received and queued for AI categorization. 
              A nodal officer will review it shortly.
            </p>

            <div className="mt-8 inline-flex items-center gap-3 rounded-xl bg-secondary/50 border border-border px-6 py-3">
              <span className="text-sm font-medium text-muted-foreground">Reference ID:</span>
              <span className="text-lg font-bold font-mono text-primary tracking-wider">
                {shortId}
              </span>
            </div>

            {/* What happens next timeline */}
            <div className="mt-10 text-left border-t border-border pt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6 text-center">
                What happens next?
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <BrainCircuit className="size-5" />
                    </div>
                    <div className="w-0.5 h-full bg-border mt-2"></div>
                  </div>
                  <div className="pb-6">
                    <p className="font-semibold text-foreground">1. AI Triage</p>
                    <p className="text-sm text-muted-foreground mt-1">Our AI analyzes your report to determine category and priority.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div className="w-0.5 h-full bg-border mt-2"></div>
                  </div>
                  <div className="pb-6">
                    <p className="font-semibold text-foreground">2. Officer Review</p>
                    <p className="text-sm text-muted-foreground mt-1">A government nodal officer verifies and approves the issue.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <Clock className="size-5" />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">3. Solution & Execution</p>
                    <p className="text-sm text-muted-foreground mt-1">Universities propose solutions and industry executes the work.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/citizen/challenges">
                  View my reports
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSubmittedId(null);
                  setTitle("");
                  setDescription("");
                  setCategory("");
                  setEmergencyType("");
                  setProblemType("civic");
                  setDistrict("");
                  setBlock("");
                  setPhotos([]);
                  setLatitude(null);
                  setLongitude(null);
                  setErrors({});
                }}
              >
                Report another problem
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  /*
   * REPORT FORM
   */
  return (
    <AppLayout
      role="citizen"
      title="Report a Problem"
      subtitle="Describe the problem as precisely as you can. Better detail means faster action."
    >
      <form
        onSubmit={submit}
        className="mx-auto max-w-3xl space-y-5"
        noValidate
      >
        {errors.form && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4" />
            {errors.form}
          </div>
        )}

        {/* STEP 1 */}
        <Section
          n={1}
          title="What is the problem?"
          desc="A short title and a clear description."
        >
          <div className="space-y-2">
            <Label>Problem Type</Label>

            <RadioGroup
              value={problemType}
              onValueChange={(value) => {
                setProblemType(value);

                if (value === "civic") {
                  setEmergencyType("");
                }
              }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <label className="flex cursor-pointer gap-3 rounded-xl border border-border p-4 hover:bg-secondary transition-colors">
                <RadioGroupItem
                  value="civic"
                  className="mt-0.5"
                />

                <span className="text-sm font-semibold">
                  Civic Issue
                </span>
              </label>

              <label className="flex cursor-pointer gap-3 rounded-xl border border-border p-4 hover:bg-secondary transition-colors">
                <RadioGroupItem
                  value="emergency"
                  className="mt-0.5"
                />

                <span className="text-sm font-semibold text-destructive">
                  Emergency
                </span>
              </label>
            </RadioGroup>
          </div>

          {problemType === "emergency" && (
            <div className="space-y-2">
              <Label>Emergency Type</Label>

              <Select
                value={emergencyType}
                onValueChange={setEmergencyType}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>

                <SelectContent>
                  {emergencyTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                    >
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">
              Title
            </Label>

            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Contaminated drinking water in Namkum block"
            />

            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">
              Description
            </Label>

            <Textarea
              id="desc"
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="How many people are affected? Since when? What has already been tried?"
            />

            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description}
              </p>
            )}
          </div>
        </Section>

        {/* STEP 2 */}
        <Section
          n={2}
          title="Category"
          desc="Pick the closest sector."
        >
          <div className="mb-1 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
            <Sparkles className="size-3.5" />

            AI will auto-suggest and refine this category
            after submission.
          </div>

          <Select
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>

            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem
                  key={c}
                  value={c}
                >
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {errors.category && (
            <p className="text-xs text-destructive">
              {errors.category}
            </p>
          )}
        </Section>

        {/* STEP 3 */}
        <Section
          n={3}
          title="Location"
          desc="Where exactly is this happening?"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>District</Label>

              <Select
                value={district}
                onValueChange={setDistrict}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select district" />
                </SelectTrigger>

                <SelectContent>
                  {DISTRICTS.map((d) => (
                    <SelectItem
                      key={d}
                      value={d}
                    >
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {errors.district && (
                <p className="text-xs text-destructive">
                  {errors.district}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="block">
                Block / Ward
              </Label>

              <Input
                id="block"
                value={block}
                onChange={(e) => setBlock(e.target.value)}
                placeholder="e.g. Namkum"
              />

              {errors.block && (
                <p className="text-xs text-destructive">
                  {errors.block}
                </p>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={useMyLocation}
          >
            <Crosshair className="mr-2 size-4" />
            Use My Location
          </Button>

          {locationMessage && (
            <p className="text-xs text-muted-foreground">
              {locationMessage}
            </p>
          )}
        </Section>

        {/* STEP 4 */}
        <Section
          n={4}
          title="Photos"
          desc="Up to 3 images help officers verify faster."
        >
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
              dragging
                ? "border-primary bg-primary/5"
                : "border-border bg-secondary/40"
            }`}
          >
            <ImagePlus className="size-7 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              Drag & drop photos here
            </p>

            <p className="text-xs text-muted-foreground">
              PNG or JPG, maximum 3 files
            </p>

            <label className="mt-4">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) =>
                  addFiles(e.target.files)
                }
              />

              <span className="inline-flex cursor-pointer items-center rounded-md border border-input bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary">
                Browse files
              </span>
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-lg border border-border"
                >
                  <img
                    src={p.url}
                    alt={p.name}
                    className="h-28 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setPhotos((ps) =>
                        ps.filter(
                          (_, j) => j !== i,
                        ),
                      )
                    }
                    className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-destructive"
                    aria-label="Remove photo"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* AI INFORMATION */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm text-primary flex items-start gap-2">
          <Sparkles className="size-4 mt-0.5 shrink-0" />
          <span>
            AI automatically categorises the report, determines
            priority, and checks whether it may require emergency
            government review.
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 pb-4">
          <Button
            asChild
            variant="outline"
            type="button"
          >
            <Link to="/citizen/dashboard">
              Cancel
            </Link>
          </Button>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {loading && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}

            {loading
              ? "Submitting…"
              : problemType === "emergency"
                ? "🚨 Report Emergency"
                : "Submit Report"}
          </Button>
        </div>
      </form>
    </AppLayout>
  );
}