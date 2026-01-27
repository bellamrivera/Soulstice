"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LocationCombobox } from "./LocationCombobox";
import { useOnboardingStore } from "@/stores/onboarding";

export function Step1BirthDetails() {
  const {
    birthDate,
    birthTime,
    birthTimeUnknown,
    location,
    setBirthDate,
    setBirthTime,
    setBirthTimeUnknown,
    setLocation,
  } = useOnboardingStore();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">When were you born?</h2>
        <p className="text-muted-foreground">
          Your birth details help us calculate your unique cosmic blueprint.
        </p>
      </div>

      <div className="space-y-6 max-w-md mx-auto">
        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birth-date">Birth Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="birth-date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12",
                  !birthDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? format(birthDate, "MMMM d, yyyy") : "Select your birth date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={birthDate || undefined}
                onSelect={(date) => setBirthDate(date || null)}
                disabled={(date) => date > new Date()}
                initialFocus
                captionLayout="dropdown"
                fromYear={1920}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Birth Time */}
        <div className="space-y-2">
          <Label htmlFor="birth-time">Birth Time</Label>
          <Input
            id="birth-time"
            type="time"
            value={birthTime}
            onChange={(e) => setBirthTime(e.target.value)}
            disabled={birthTimeUnknown}
            className="h-12"
            placeholder="HH:MM"
          />
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="time-unknown"
              checked={birthTimeUnknown}
              onCheckedChange={(checked) => setBirthTimeUnknown(checked as boolean)}
            />
            <label
              htmlFor="time-unknown"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              I don&apos;t know my exact birth time (defaults to 12:00 noon)
            </label>
          </div>
        </div>

        {/* Birth Location */}
        <div className="space-y-2">
          <Label>Birth Location</Label>
          <LocationCombobox value={location} onChange={setLocation} />
          {location && (
            <p className="text-xs text-muted-foreground mt-1">
              Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)} ({location.timezone})
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
