"use client";

import { useState, useEffect } from "react";
import { Train, Check, ChevronsUpDown, ClipboardCopy } from "lucide-react";
import { toast } from "sonner";
import { stationToasts } from "@/components/ui/toast-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Resolver } from "react-hook-form"; // Add this import
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Import Badge component

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
import { cn } from "@/lib/utils";
import { csvData } from "./listrapidklrail/allstation";

// Station interface
interface Station {
  name: string;
  code: string;
}

// Parse CSV data into stations array
const parseCSVData = (csvData: string) => {
  const lines = csvData.trim().split("\n");
  // Skip header row
  const dataRows = lines.slice(1);

  const stations: Station[] = [];
  const uniqueCodes = new Set<string>();

  dataRows.forEach((row) => {
    const columns = row.split(",");
    if (columns.length >= 2) {
      const name = columns[0].trim();
      const code = columns[1].trim();

      // Avoid duplicate station codes
      if (!uniqueCodes.has(code)) {
        uniqueCodes.add(code);
        stations.push({ name, code });
      }
    }
  });

  return stations.sort((a, b) => a.name.localeCompare(b.name));
};

// Helper function to determine train type from station code
const getTrainType = (code: string) => {
  // First two characters determine the line type
  const prefix = code.substring(0, 2);

  switch (prefix) {
    case "AG":
      return { type: "LRT", color: "bg-amber-500 hover:bg-amber-600" }; // Ampang Line (3): #FF9900 (Orange)
    case "SP":
      return { type: "LRT", color: "bg-red-900 hover:bg-red-950" }; // Sri Petaling Line (4): #B3003B (Maroon/Dark Red)
    case "KJ":
      return { type: "LRT", color: "bg-fuchsia-600 hover:bg-fuchsia-700" }; // Kelana Jaya Line (5): #CC0099 (Pink/Magenta)
    case "KE":
      return { type: "ERL", color: "bg-purple-700 hover:bg-purple-800" }; // KLIA Ekspres Line (6): #663399 (Purple)
    case "KL":
      return { type: "ERL", color: "bg-teal-600 hover:bg-teal-700" }; // KLIA Transit Line (7): #009999 (Teal/Cyan)
    case "MR":
      return { type: "Monorail", color: "bg-lime-600 hover:bg-lime-700" }; // KL Monorail Line (8): #66CC33 (Green)
    case "KG":
      return { type: "MRT", color: "bg-green-800 hover:bg-green-900" }; // Kajang Line (9): #006600 (Dark Green)
    case "PY":
      return { type: "MRT", color: "bg-yellow-300 hover:bg-yellow-400" }; // Putrajaya Line (12): #FFFF00 (Yellow)
    case "SH":
      return { type: "LRT", color: "bg-cyan-500 hover:bg-cyan-600" }; // Shah Alam Line (11): #33CCCC (Light Blue)
    case "SB":
      return { type: "BRT", color: "bg-emerald-900 hover:bg-emerald-950" }; // BRT Sunway Line: #005522 (Dark Green)
    default:
      return { type: "Train", color: "bg-gray-500 hover:bg-gray-600" };
  }
};

// Function to convert SB_ code to BRT_ code for API calls
const convertToBRTCode = (code: string): string => {
  if (code.startsWith("SB")) {
    // Extract the number part and convert SB to BRT
    const numberPart = code.substring(2);
    return `BRT${numberPart}`;
  }
  return code;
};

// Parse stations from CSV data
const stations = parseCSVData(csvData);

// Form schema with validation
const formSchema = z.object({
  origin: z.string({
    required_error: "Please select an origin station.",
  }),
  destination: z.string({
    required_error: "Please select a destination station.",
  }),
  return: z.boolean().default(false),
  concession: z.boolean().default(false),
});

// Interface for fare result
interface FareResult {
  origin: string;
  destination: string;
  isReturn: boolean;
  isConcession: boolean;
  adult: string;
  cash: string;
  cashless: string;
  concession: string;
  shouldBuyDailyPass?: boolean;
}

// Define the form values type explicitly
type FormValues = {
  origin: string;
  destination: string;
  return: boolean;
  concession: boolean;
};

// Define props interface for the component
interface TrainFareCalculatorProps {
  initialOrigin?: string;
  initialDestination?: string;
  initialReturn?: boolean;
  initialConcession?: boolean;
}

export function TrainFareCalculator({
  initialOrigin = "",
  initialDestination = "",
  initialReturn = false,
  initialConcession = false,
}: TrainFareCalculatorProps) {
  const [fareResult, setFareResult] = useState<FareResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);

  // Use the explicit FormValues type instead of z.infer
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      origin: initialOrigin,
      destination: initialDestination,
      return: initialReturn,
      concession: initialConcession,
    },
  });

  // Generate shareable URL when form values change
  const generateShareURL = () => {
    const values = form.getValues();
    const params = new URLSearchParams();

    if (values.origin) params.append("origin", values.origin);
    if (values.destination) params.append("destination", values.destination);
    if (values.return) params.append("return", "true");
    if (values.concession) params.append("concession", "true");

    const url = `${window.location.origin}${
      window.location.pathname
    }?${params.toString()}`;
    return url;
  };
  // Function to handle copy button click
  const handleCopyClick = () => {
    if (isCopied) return; // Prevent multiple clicks while copying
    const url = generateShareURL();
    copyToClipboard(url);
  };
  // Function to copy URL to clipboard
  const copyToClipboard = (text: string) => {
    setIsCopied(true); // Disable the button immediately
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("URL copied to clipboard!", {
          description: "Share this link to show this journey fare calculation.",
          icon: <Check className="h-4 w-4" />,
        });

        // Reset the icon after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setIsCopied(false);
      });
  };
  // Auto-calculate fare if both origin and destination are provided via URL params
  useEffect(() => {
    if (initialOrigin && initialDestination) {
      // Validate that the station codes exist
      const originValid = stations.some((s) => s.code === initialOrigin);
      const destValid = stations.some((s) => s.code === initialDestination);

      if (originValid && destValid) {
        form.handleSubmit(onSubmit)();
      }
    }
  }, [initialOrigin, initialDestination, form, onSubmit]);

  // Function to fetch fares from RapidKL API
  const fetchFares = async (originCode: string, destinationCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      // Convert SB codes to BRT codes for API compatibility
      const apiFriendlyOriginCode = convertToBRTCode(originCode);
      const apiFriendlyDestinationCode = convertToBRTCode(destinationCode);

      const response = await fetch(
        `REDACTED?agency=rapidkl&from=${apiFriendlyOriginCode}&to=${apiFriendlyDestinationCode}`
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.fares;
    } catch (error) {
      setError("Failed to fetch fare data. Please try again.");
      console.error("Error fetching fares:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  // Ensure onSubmit uses the explicit FormValues type
  async function onSubmit(values: FormValues) {
    // Check if origin and destination are selected
    if (!values.origin && !values.destination) {
      stationToasts.selectStation();
      return;
    } else if (!values.origin) {
      stationToasts.originMissing();
      return;
    } else if (!values.destination) {
      stationToasts.destinationMissing();
      return;
    }

    const originStation = stations.find((s) => s.code === values.origin);
    const destinationStation = stations.find(
      (s) => s.code === values.destination
    );

    if (!originStation || !destinationStation) {
      setError("Station information not found.");
      return;
    }

    // Fetch fare data from API
    const fares = await fetchFares(originStation.code, destinationStation.code);

    if (fares) {
      // Determine which fare to use for daily pass calculation based on concession toggle
      const relevantFare = values.concession
        ? parseFloat(fares.consession || "0")
        : parseFloat(fares.cashless || "0");

      const shouldBuyDailyPass = relevantFare > 10;

      setFareResult({
        origin: originStation.name,
        destination: destinationStation.name,
        isReturn: values.return,
        isConcession: values.concession,
        adult: fares.adult || "N/A",
        cash: fares.cash || "N/A",
        cashless: fares.cashless || "N/A",
        concession: fares.consession || "N/A", // Note the API uses "consession" instead of "concession"
        shouldBuyDailyPass: shouldBuyDailyPass,
      });

      // If return journey, update with doubled values
      if (values.return) {
        const doubleFare = (relevantFare * 2).toFixed(2);

        setFareResult((prevResult) => {
          if (!prevResult) return null;

          return {
            ...prevResult,
            cash: (parseFloat(prevResult.cash) * 2).toFixed(2),
            cashless: (parseFloat(prevResult.cashless) * 2).toFixed(2),
            concession: (parseFloat(prevResult.concession) * 2).toFixed(2),
            adult: (parseFloat(prevResult.adult) * 2).toFixed(2),
            shouldBuyDailyPass: parseFloat(doubleFare) > 10,
          };
        });
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">RapidKL</CardTitle>
          <CardDescription>
            Enter your journey information to calculate the fare.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            {/* Pass the correctly typed onSubmit to handleSubmit */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Origin</FormLabel>
                    <Popover open={originOpen} onOpenChange={setOriginOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={originOpen}
                            className="w-full justify-between h-9 text-sm bg-background border-input"
                          >
                            {field.value
                              ? stations.find(
                                  (station) => station.code === field.value
                                )?.name || "Select station..."
                              : "Select origin station..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command className="w-full">
                          <CommandInput
                            placeholder="Search stations..."
                            className="h-9 text-sm"
                          />
                          <CommandList>
                            <CommandEmpty>No station found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                              {stations.map((station) => (
                                <CommandItem
                                  key={station.code}
                                  value={station.name}
                                  onSelect={() => {
                                    form.setValue("origin", station.code);
                                    setOriginOpen(false);
                                  }}
                                  className="flex items-center text-sm"
                                >
                                  <span>{station.name}</span>
                                  <div className="ml-auto flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground mr-1">
                                      {station.code}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs font-normal text-white",
                                        getTrainType(station.code).color
                                      )}
                                    >
                                      {getTrainType(station.code).type}
                                    </Badge>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      field.value === station.code
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Destination</FormLabel>
                    <Popover
                      open={destinationOpen}
                      onOpenChange={setDestinationOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={destinationOpen}
                            className="w-full justify-between h-9 text-sm bg-background border-input"
                          >
                            {field.value
                              ? stations.find(
                                  (station) => station.code === field.value
                                )?.name || "Select station..."
                              : "Select destination station..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command className="w-full">
                          <CommandInput
                            placeholder="Search stations..."
                            className="h-9 text-sm"
                          />
                          <CommandList>
                            <CommandEmpty>No station found.</CommandEmpty>
                            <CommandGroup className="max-h-[300px] overflow-auto">
                              {stations.map((station) => (
                                <CommandItem
                                  key={station.code}
                                  value={station.name}
                                  onSelect={() => {
                                    form.setValue("destination", station.code);
                                    setDestinationOpen(false);
                                  }}
                                  className="flex items-center text-sm"
                                >
                                  <span>{station.name}</span>
                                  <div className="ml-auto flex items-center gap-1">
                                    <span className="text-xs text-muted-foreground mr-1">
                                      {station.code}
                                    </span>
                                    <Badge
                                      variant="secondary"
                                      className={cn(
                                        "text-xs font-normal text-white",
                                        getTrainType(station.code).color
                                      )}
                                    >
                                      {getTrainType(station.code).type}
                                    </Badge>
                                  </div>
                                  <Check
                                    className={cn(
                                      "ml-2 h-4 w-4",
                                      field.value === station.code
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="return"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Return</FormLabel>
                      <FormDescription>
                        Select this option if you need a return ticket (doubles
                        the fare).
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="concession"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>I have a concession card</FormLabel>
                      <FormDescription>
                        Select if you&apos;re eligible for concession fare
                        (student and senior citizen)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? "Calculating..." : "Calculate Fare"}
                </Button>{" "}
                {fareResult && (
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-6"
                    onClick={handleCopyClick}
                    disabled={isCopied}
                    title={isCopied ? "Copied!" : "Copy URL to clipboard"}
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ClipboardCopy className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>{" "}
      {/* Toast will show when URL is copied */}
      {error && (
        <Card className="bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}
      {fareResult && (
        <Card className="bg-card border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Fare</CardTitle>
              <Train className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Journey:</span>
                <span className="font-medium">
                  {"\n"}
                  {fareResult.origin} to {fareResult.destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Journey Type:</span>
                <span className="font-medium">
                  {fareResult.isReturn ? "Return" : "One-way"}
                  {fareResult.isConcession ? ", Concession" : ""}
                </span>
              </div>
              <div className="border-t my-4 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cash Fare:</span>
                  <span className="text-lg font-bold">
                    RM {fareResult.cash}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Cashless Fare:</span>
                  <span className="text-lg font-bold">
                    RM {fareResult.cashless}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Concession Fare:
                  </span>
                  <span className="text-lg font-bold">
                    RM {fareResult.concession}
                  </span>
                </div>
              </div>

              {fareResult.shouldBuyDailyPass && (
                <Alert className="mt-4 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
                  <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertTitle className="text-green-800 dark:text-green-400 font-medium">
                    YOU SHOULD BUY A DAILY PASS!
                  </AlertTitle>
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Your {fareResult.isConcession ? "concession" : "cashless"}{" "}
                    fare exceeds RM 10.00. Consider purchasing a daily pass for
                    better value! (Malaysian only)
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Fares are based on RapidKL official rates. Return tickets are
            calculated as double the one-way fare.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
