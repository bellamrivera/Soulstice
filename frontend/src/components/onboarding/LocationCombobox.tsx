"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { searchLocations, getTimezone, LocationResult } from "@/lib/nominatim";
import { Location } from "@/stores/onboarding";

interface LocationComboboxProps {
  value: Location | null;
  onChange: (location: Location | null) => void;
}

export function LocationCombobox({ value, onChange }: LocationComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchTimer = setTimeout(async () => {
      if (query.length >= 2) {
        setIsSearching(true);
        const locations = await searchLocations(query);
        setResults(locations);
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(searchTimer);
  }, [query]);

  const handleSelect = async (result: LocationResult) => {
    const timezone = await getTimezone(result.latitude, result.longitude);
    onChange({
      city: result.city,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone,
    });
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-12 bg-background border-input"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              {value.city}
            </span>
          ) : (
            <span className="text-muted-foreground">Search for your birth city...</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a city name..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isSearching ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : results.length === 0 && query.length >= 2 ? (
              <CommandEmpty>No locations found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.displayName}
                    onSelect={() => handleSelect(result)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value?.city === result.city ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span className="font-medium">{result.city}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                        {result.displayName}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
