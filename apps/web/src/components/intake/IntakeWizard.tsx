"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IntakeFormDefinition, IntakeQuestion } from "@/config/intake/types";
import { evalRule } from "@/config/intake/types";

interface IntakeWizardProps {
  definition: IntakeFormDefinition;
  onSubmit: (data: Record<string, unknown>) => Promise<{ id: string } | { error: string }>;
}

type MediaUpload = {
  url: string;
  pathname?: string;
  contentType?: string | null;
  size?: number | null;
  name?: string | null;
};

const MAX_MEDIA_FILES = 10;
const MAX_MEDIA_BYTES = 50 * 1024 * 1024;

export function IntakeWizard({ definition, onSubmit }: IntakeWizardProps) {
  const router = useRouter();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedUrgency, setSelectedUrgency] = useState<string>(definition.defaultUrgency);

  // Sort sections by order
  const sections = [...definition.sections].sort((a, b) => a.order - b.order);
  const currentSection = sections[currentSectionIndex];
  const isLastSection = currentSectionIndex === sections.length - 1;

  // Get questions for current section that are visible
  const sectionQuestions = definition.questions
    .filter((q) => q.ui?.section === currentSection.key)
    .filter((q) => evalRule(q.visibleWhen, answers))
    .sort((a, b) => (a.ui?.order ?? 0) - (b.ui?.order ?? 0));

  // Update answer
  const updateAnswer = (key: string, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    // Clear error when user types
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  // Validate current section
  const validateSection = (): boolean => {
    const newErrors: Record<string, string> = {};

    for (const question of sectionQuestions) {
      const value = answers[question.key];
      
      for (const rule of question.validation ?? []) {
        if (rule.type === "required") {
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          ) {
            newErrors[question.key] = "This field is required";
            break;
          }
        }
        if (rule.type === "minLength" && typeof value === "string") {
          if (value.length < rule.value) {
            newErrors[question.key] = `Must be at least ${rule.value} characters`;
            break;
          }
        }
        if (rule.type === "maxLength" && typeof value === "string") {
          if (value.length > rule.value) {
            newErrors[question.key] = `Must be at most ${rule.value} characters`;
            break;
          }
        }
        if (rule.type === "regex" && typeof value === "string") {
          const regex = new RegExp(rule.value, "i");
          if (!regex.test(value)) {
            newErrors[question.key] = rule.message;
            break;
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next section
  const handleNext = () => {
    if (!validateSection()) return;

    if (isLastSection) {
      handleSubmit();
    } else {
      setCurrentSectionIndex((prev) => prev + 1);
    }
  };

  // Handle previous section
  const handleBack = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex((prev) => prev - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateSection()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await onSubmit({ ...answers, urgency: selectedUrgency });
      
      if ("error" in result) {
        setSubmitError(result.error);
      } else {
        router.push(`/app/requests/${result.id}`);
      }
    } catch (err) {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {sections.map((section, index) => (
          <div key={section.key} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                index < currentSectionIndex
                  ? "bg-green-600 text-white"
                  : index === currentSectionIndex
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {index < currentSectionIndex ? "✓" : index + 1}
            </div>
            {index < sections.length - 1 && (
              <div
                className={`w-8 h-0.5 ${
                  index < currentSectionIndex ? "bg-green-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Section card */}
      <Card>
        <CardHeader>
          <CardTitle>{currentSection.title}</CardTitle>
          {currentSection.description && (
            <CardDescription>{currentSection.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Show urgency picker on first section */}
          {currentSectionIndex === 0 && definition.urgencies.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                How urgent is this? <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {definition.urgencies.map((urgency) => (
                  <button
                    key={urgency.value}
                    type="button"
                    onClick={() => setSelectedUrgency(urgency.value)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      selectedUrgency === urgency.value
                        ? urgency.value === "emergency"
                          ? "border-red-400 bg-red-50 ring-1 ring-red-400"
                          : "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className={`text-sm font-medium ${
                      urgency.value === "emergency" && selectedUrgency === urgency.value
                        ? "text-red-800"
                        : "text-gray-900"
                    }`}>
                      {urgency.label}
                    </p>
                    {urgency.hint && (
                      <p className="text-xs text-gray-500 mt-0.5">{urgency.hint}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {sectionQuestions.map((question) => (
            <IntakeField
              key={question.key}
              question={question}
              value={answers[question.key]}
              onChange={(value) => updateAnswer(question.key, value)}
              error={errors[question.key]}
            />
          ))}

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {submitError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentSectionIndex === 0}
        >
          Back
        </Button>
        <Button onClick={handleNext} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : isLastSection ? "Submit request" : "Continue"}
        </Button>
      </div>
    </div>
  );
}

// Individual field component
function IntakeField({
  question,
  value,
  onChange,
  error,
}: {
  question: IntakeQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const inputId = `field-${question.key}`;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId} className="text-sm font-medium">
        {question.label}
        {question.validation?.some((v) => v.type === "required") && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </Label>

      {question.helpText && (
        <p className="text-xs text-gray-500">{question.helpText}</p>
      )}

      {/* Short text input */}
      {question.input === "short_text" && (
        <Input
          id={inputId}
          type="text"
          placeholder={question.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "border-red-500" : ""}
        />
      )}

      {/* Phone input */}
      {question.input === "phone" && (
        <Input
          id={inputId}
          type="tel"
          placeholder={question.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "border-red-500" : ""}
        />
      )}

      {/* Long text (textarea) */}
      {question.input === "long_text" && (
        <Textarea
          id={inputId}
          placeholder={question.placeholder}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className={error ? "border-red-500" : ""}
        />
      )}

      {/* Single select (dropdown) */}
      {question.input === "single_select" && question.options && (
        <Select
          value={(value as string) ?? ""}
          onValueChange={(v) => onChange(v)}
        >
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {question.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Multi select (checkbox list) */}
      {question.input === "multi_select" && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => {
            const selectedValues = Array.isArray(value) ? (value as string[]) : [];
            const checked = selectedValues.includes(option.value);
            return (
              <label key={option.value} className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    const next = checked
                      ? selectedValues.filter((v) => v !== option.value)
                      : [...selectedValues, option.value];
                    onChange(next);
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-gray-900"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {/* Yes/No (radio-style buttons) */}
      {question.input === "yes_no" && (
        <div className="flex gap-3">
          <Button
            type="button"
            variant={value === true ? "default" : "outline"}
            onClick={() => onChange(true)}
            className="flex-1"
          >
            Yes
          </Button>
          <Button
            type="button"
            variant={value === false ? "default" : "outline"}
            onClick={() => onChange(false)}
            className="flex-1"
          >
            No
          </Button>
        </div>
      )}

      {/* Time windows - simplified for MVP */}
      {question.input === "time_windows" && (
        <Textarea
          id={inputId}
          placeholder="e.g. Monday mornings, Wednesday afternoons, any time Friday"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={2}
          className={error ? "border-red-500" : ""}
        />
      )}

      {/* Media upload */}
      {question.input === "media" && (
        <div className="space-y-3">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id={inputId}
            type="file"
            multiple
            accept="image/*,video/*,application/pdf"
            disabled={isUploading}
            className="sr-only"
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? []);
              if (files.length === 0) return;

              const existing = Array.isArray(value) ? (value as MediaUpload[]) : [];
              const remainingSlots = Math.max(0, MAX_MEDIA_FILES - existing.length);
              if (remainingSlots === 0) {
                setUploadError(`Upload up to ${MAX_MEDIA_FILES} files total.`);
                event.target.value = "";
                return;
              }

              const limited = files.slice(0, remainingSlots);
              const tooLarge = limited.filter((file) => file.size > MAX_MEDIA_BYTES);
              if (tooLarge.length > 0) {
                setUploadError(`Each file must be under ${Math.round(MAX_MEDIA_BYTES / (1024 * 1024))}MB.`);
              }
              const allowed = limited.filter((file) => file.size <= MAX_MEDIA_BYTES);
              if (allowed.length === 0) {
                event.target.value = "";
                return;
              }

              setIsUploading(true);
              setUploadError(null);
              setUploadProgress("");

              try {
                const uploaded: MediaUpload[] = [];
                for (let i = 0; i < allowed.length; i++) {
                  const file = allowed[i];
                  setUploadProgress(`Uploading ${i + 1} of ${allowed.length}: ${file.name}`);
                  const timestamp = Date.now();
                  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
                  const pathname = `requests/${timestamp}-${safeName}`;
                  const blob = await upload(pathname, file, {
                    access: "public",
                    handleUploadUrl: "/api/uploads",
                  });
                  uploaded.push({
                    url: blob.url,
                    pathname: blob.pathname,
                    contentType: blob.contentType ?? null,
                    size: file.size,
                    name: file.name,
                  });
                }

                onChange([...existing, ...uploaded]);
              } catch (err) {
                const message = err instanceof Error ? err.message : "Upload failed";
                setUploadError(message);
              } finally {
                setIsUploading(false);
                setUploadProgress("");
                event.target.value = "";
              }
            }}
          />

          {/* Styled drop-zone / button */}
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors ${
              isUploading
                ? "border-gray-200 bg-gray-50 cursor-wait"
                : error
                  ? "border-red-300 hover:border-red-400 bg-red-50/30"
                  : "border-gray-300 hover:border-stone-400 hover:bg-stone-50 cursor-pointer"
            }`}
          >
            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
              <span className="text-lg">📎</span>
            </div>
            <p className="text-sm font-medium text-gray-700">
              {isUploading ? "Uploading…" : "Add files"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Photos, documents or PDFs — up to 50 MB each
            </p>
          </button>

          {isUploading && uploadProgress && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4 text-stone-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {uploadProgress}
            </div>
          )}

          {uploadError && (
            <p className="text-sm text-red-600">{uploadError}</p>
          )}

          {Array.isArray(value) && value.length > 0 && (
            <div className="space-y-2">
              {(value as MediaUpload[]).map((item) => (
                <div
                  key={item.url}
                  className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base flex-shrink-0">
                      {item.contentType?.startsWith("image/") ? "🖼️" : item.contentType === "application/pdf" ? "📄" : "📎"}
                    </span>
                    <span className="truncate">{item.name || item.pathname || item.url}</span>
                    {item.size && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {item.size < 1024 * 1024
                          ? `${Math.round(item.size / 1024)} KB`
                          : `${(item.size / (1024 * 1024)).toFixed(1)} MB`}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = (value as MediaUpload[]).filter(
                        (entry) => entry.url !== item.url
                      );
                      onChange(next);
                    }}
                    className="ml-2 flex-shrink-0 text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error message */}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
