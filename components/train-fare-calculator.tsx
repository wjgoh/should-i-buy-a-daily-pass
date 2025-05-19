"use client";

import { useState } from "react";
import { Train, Check, ChevronsUpDown } from "lucide-react";
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

// CSV data copied from allstation.csv
const csvData = `Station,Station_Code,Line,Operator,
16 Sierra,PY38,12Putrajaya Line,Rapid Rail,MRT
Abdullah Hukum,KJ17,5Kelana Jaya Line,Rapid Rail,LRT
Alam Megah,KJ35,5Kelana Jaya Line,Rapid Rail,LRT
Alam Sutera,SP21,4Sri Petaling Line,Rapid Rail,LRT
Ampang,AG18,3Ampang Line,Rapid Rail,LRT
Ampang Park (LRT),KJ9,5Kelana Jaya Line,Rapid Rail,LRT
Ampang Park (MRT),PY20,12Putrajaya Line,Rapid Rail,MRT
Ara Damansara,KJ26,5Kelana Jaya Line,Rapid Rail,LRT
Asia Jaya,KJ21,5Kelana Jaya Line,Rapid Rail,LRT
Awan Besar,SP19,4Sri Petaling Line,Rapid Rail,LRT
Bandar Puteri,SP27,4Sri Petaling Line,Rapid Rail,LRT
Bandar Tasik Selatan,SP15,4Sri Petaling Line,Rapid Rail,LRT
Bandar Tun Hussein Onn,KG29,9Kajang Line,Rapid Rail,MRT
Bandar Tun Razak,SP14,4Sri Petaling Line,Rapid Rail,LRT
Bandar Utama,KG09,9Kajang Line,Rapid Rail,MRT
Bandaraya,AG6,3Ampang Line,Rapid Rail,LRT
Bandaraya,SP6,4Sri Petaling Line,Rapid Rail,LRT
Bangsar ,KJ16,5Kelana Jaya Line,Rapid Rail,LRT
Batu 11 Cheras,KG30,9Kajang Line,Rapid Rail,MRT
Bukit Bintang (MRT),KG18A,9Kajang Line,Rapid Rail,MRT
Bukit Bintang Monorail,MR6,8KL Monorail,Rapid Rail,Monorail
Bukit Dukung,KG31,9Kajang Line,Rapid Rail,MRT
Bukit Jalil,SP17,4Sri Petaling Line,Rapid Rail,LRT
Bukit Nanas,MR8,8KL Monorail,Rapid Rail,Monorail
Cahaya,AG17,3Ampang Line,Rapid Rail,LRT
Cempaka,AG16,3Ampang Line,Rapid Rail,LRT
Chan Sow Lin,PY24,12Putrajaya Line,Rapid Rail,MRT
Chan Sow Lin,AG11,3Ampang Line,Rapid Rail,LRT
Chan Sow Lin,SP11,4Sri Petaling Line,Rapid Rail,MRT
Cheras,SP12,4Sri Petaling Line,Rapid Rail,LRT
Chow Kit,MR10,8KL Monorail,Rapid Rail,Monorail
Cochrane,KG21,9Kajang Line,Rapid Rail,MRT
Conlay,PY22,12Putrajaya Line,Rapid Rail,MRT
Cyberjaya City Centre,PY40,12Putrajaya Line,Rapid Rail,MRT
Cyberjaya Utara,PY39,12Putrajaya Line,Rapid Rail,MRT
Damai,KJ8,5Kelana Jaya Line,Rapid Rail,LRT
Damansara Damai,PY05,12Putrajaya Line,Rapid Rail,MRT
Dang Wangi,KJ12,5Kelana Jaya Line,Rapid Rail,LRT
Dato Keramat,KJ7,5Kelana Jaya Line,Rapid Rail,LRT
Glenmarie,KJ27,5Kelana Jaya Line,Rapid Rail,LRT
Gombak,KJ1,5Kelana Jaya Line,Rapid Rail,LRT
Hang Tuah,AG9,3Ampang Line,Rapid Rail,LRT
Hang Tuah,SP9,4Sri Petaling Line,Rapid Rail,Monorail
Hang Tuah,MR4,8KL Monorail,Rapid Rail,Monorail
Hospital Kuala Lumpur,PY18,12Putrajaya Line,Rapid Rail,MRT
Imbi,MR5,8KL Monorail,Rapid Rail,Monorail
IOI Puchong Jaya,SP24,4Sri Petaling Line,Rapid Rail,LRT
Jalan Ipoh,PY15,12Putrajaya Line,Rapid Rail,MRT
Jelatek,KJ6,5Kelana Jaya Line,Rapid Rail,LRT
Jinjang,PY11,12Putrajaya Line,Rapid Rail,MRT
Kajang,KG35,9Kajang Line,Rapid Rail,MRT
Kampung Baru,KJ11,5Kelana Jaya Line,Rapid Rail,LRT
Kampung Batu,PY13,12Putrajaya Line,Rapid Rail,MRT
Kampung Selamat,PY03,12Putrajaya Line,Rapid Rail,MRT
Kelana Jaya,KJ24,5Kelana Jaya Line,Rapid Rail,LRT
Kentonmen,PY14,12Putrajaya Line,Rapid Rail,MRT
Kepong Baru,PY10,12Putrajaya Line,Rapid Rail,MRT
Kerinchi,KJ18,5Kelana Jaya Line,Rapid Rail,LRT
Kinrara BK5,SP22,4Sri Petaling Line,Rapid Rail,LRT
KLCC,KJ10,5Kelana Jaya Line,Rapid Rail,LRT
Kota Damansara,KG06,9Kajang Line,Rapid Rail,MRT
KL Sentral,KJ15,2Tanjung Malim-Port Klang Line,Rapid Rail,LRT
KL Sentral Monorail,MR1,8KL Monorail,Rapid Rail,Monorail
Kuchai,PY27,12Putrajaya Line,Rapid Rail,MRT
Kwasa Damansara,PY01,12Putrajaya Line,Rapid Rail,MRT
Kwasa Damansara,KG04,9Kajang Line,Rapid Rail,MRT
Kwasa Sentral,KG05,9Kajang Line,Rapid Rail,MRT
Lembah Subang,KJ25,5Kelana Jaya Line,Rapid Rail,LRT
Maharajalela,MR3,8KL Monorail,Rapid Rail,Monorail
Maluri,AG13,3Ampang Line,Rapid Rail,LRT
Maluri,KG22,9Kajang Line,Rapid Rail,MRT
Masjid Jamek,AG7,3Ampang Line,Rapid Rail,LRT
Masjid Jamek,SP7,4Sri Petaling Line,Rapid Rail,LRT
Masjid Jamek,KJ13,5Kelana Jaya Line,Rapid Rail,LRT
Medan Tuanku,MR9,8KL Monorail,Rapid Rail,Monorail
Merdeka,KG17,9Kajang Line,Rapid Rail,MRT
Metro Prima,PY09,12Putrajaya Line,Rapid Rail,MRT
Miharja,AG12,3Ampang Line,Rapid Rail,LRT
Muhibbah,SP20,4Sri Petaling Line,Rapid Rail,LRT
Mutiara Damansara,KG08,9Kajang Line,Rapid Rail,MRT
Muzium Negara,KG15,9Kajang Line,Rapid Rail,MRT
Pandan Indah,AG15,3Ampang Line,Rapid Rail,LRT
Pandan Jaya,AG14,3Ampang Line,Rapid Rail,LRT
Pasar Seni,KJ14,5Kelana Jaya Line,Rapid Rail,LRT
Pasar Seni,KG16,9Kajang Line,Rapid Rail,MRT
Persiaran KLCC,PY21,12Putrajaya Line,Rapid Rail,MRT
Phileo Damansara,KG12,9Kajang Line,Rapid Rail,MRT
Plaza Rakyat,AG8,3Ampang Line,Rapid Rail,LRT
Plaza Rakyat,SP8,4Sri Petaling Line,Rapid Rail,LRT
Puchong Perdana,SP28,4Sri Petaling Line,Rapid Rail,LRT
Puchong Prima,SP29,4Sri Petaling Line,Rapid Rail,LRT
Pudu,AG10,3Ampang Line,Rapid Rail,LRT
Pudu,SP10,4Sri Petaling Line,Rapid Rail,LRT
Pusat Bandar Damansara,KG13,9Kajang Line,Rapid Rail,MRT
Pusat Bandar Puchong,SP25,4Sri Petaling Line,Rapid Rail,LRT
Putra Heights,SP31,4Sri Petaling Line,Rapid Rail,LRT
Putra Heights,KJ37,5Kelana Jaya Line,Rapid Rail,LRT
Putra Permai,PY37,12Putrajaya Line,Rapid Rail,MRT
Putrajaya Sentral,PY41,12Putrajaya Line,Rapid Rail,MRT
PWTC,AG4,3Ampang Line,Rapid Rail,LRT
PWTC,SP4,4Sri Petaling Line,Rapid Rail,LRT
Raja Chulan,MR7,8KL Monorail,Rapid Rail,Monorail
Raja Uda ,PY19,12Putrajaya Line,Rapid Rail,MRT
Salak Selatan (LRT),SP13,4Sri Petaling Line,Rapid Rail,LRT
Semantan,KG14,9Kajang Line,Rapid Rail,MRT
Sentul (LRT),AG2,3Ampang Line,Rapid Rail,LRT
Sentul (LRT),SP2,4Sri Petaling Line,Rapid Rail,LRT
Sentul Barat,PY16,12Putrajaya Line,Rapid Rail,MRT
Sentul Timur,AG1,3Ampang Line,Rapid Rail,LRT
Sentul Timur,SP1,4Sri Petaling Line,Rapid Rail,LRT
Serdang Jaya,PY33,12Putrajaya Line,Rapid Rail,MRT
Serdang Raya Selatan,PY32,12Putrajaya Line,Rapid Rail,MRT
Serdang Raya Utara,PY31,12Putrajaya Line,Rapid Rail,MRT
Setiawangsa,KJ5,5Kelana Jaya Line,Rapid Rail,LRT
Sri Damansara Barat,PY06,12Putrajaya Line,Rapid Rail,MRT
Sri Damansara Sentral,PY07,12Putrajaya Line,Rapid Rail,MRT
Sri Damansara Timur,PY08,12Putrajaya Line,Rapid Rail,MRT
Sri Delima,PY12,12Putrajaya Line,Rapid Rail,MRT
Sri Petaling,SP18,4Sri Petaling Line,Rapid Rail,LRT
Sri Rampai,KJ4,5Kelana Jaya Line,Rapid Rail,LRT
Sri Raya,KG28,9Kajang Line,Rapid Rail,MRT
SS15,KJ29,5Kelana Jaya Line,Rapid Rail,LRT
SS18,KJ30,5Kelana Jaya Line,Rapid Rail,LRT
Stadium Kajang,KG34,9Kajang Line,Rapid Rail,MRT
Subang Alam,KJ36,5Kelana Jaya Line,Rapid Rail,LRT
Subang Jaya,KJ28,5Kelana Jaya Line,Rapid Rail,LRT
Sultan Ismail,AG5,3Ampang Line,Rapid Rail,LRT
Sultan Ismail,SP5,4Sri Petaling Line,Rapid Rail,LRT
Sungai Besi,PY29,12Putrajaya Line,Rapid Rail,MRT
Sungai Besi,SP16,4Sri Petaling Line,Rapid Rail,LRT
Sungai Buloh,PY04,12Putrajaya Line,Rapid Rail,MRT
Sungai Jernih,KG33,9Kajang Line,Rapid Rail,MRT
Surian,KG07,9Kajang Line,Rapid Rail,MRT
Taipan,KJ32,5Kelana Jaya Line,Rapid Rail,LRT
Taman Bahagia,KJ23,5Kelana Jaya Line,Rapid Rail,LRT
Taman Connaught,KG26,9Kajang Line,Rapid Rail,MRT
Taman Equine,PY36,12Putrajaya Line,Rapid Rail,MRT
Taman Jaya,KJ20,5Kelana Jaya Line,Rapid Rail,LRT
Taman Melati,KJ2,5Kelana Jaya Line,Rapid Rail,LRT
Taman Midah,KG24,9Kajang Line,Rapid Rail,MRT
Taman Mutiara,KG25,9Kajang Line,Rapid Rail,MRT
Taman Naga Emas,PY28,12Putrajaya Line,Rapid Rail,MRT
Taman Paramount,KJ22,5Kelana Jaya Line,Rapid Rail,LRT
Taman Perindustrian Puchong,SP26,4Sri Petaling Line,Rapid Rail,LRT
Taman Pertama,KG23,9Kajang Line,Rapid Rail,MRT
Taman Suntex,KG27,9Kajang Line,Rapid Rail,MRT
Taman Tun Dr Ismail,KG10,9Kajang Line,Rapid Rail,MRT
Titiwangsa,PY17,12Putrajaya Line,Rapid Rail,MRT
Titiwangsa,AG3,3Ampang Line,Rapid Rail,LRT
Titiwangsa,SP3,4Sri Petaling Line,Rapid Rail,Monorail
Titiwangsa,MR11,8KL Monorail,Rapid Rail,Monorail
Tun Razak Exchange,PY23,12Putrajaya Line,Rapid Rail,MRT
Tun Razak Exchange,KG20,9Kajang Line,Rapid Rail,MRT
Tun Sambanthan,MR2,8KL Monorail,Rapid Rail,Monorail
Universiti,KJ19,5Kelana Jaya Line,Rapid Rail,LRT
UPM,PY34,12Putrajaya Line,Rapid Rail,MRT
USJ 21,KJ34,5Kelana Jaya Line,Rapid Rail,LRT
USJ 7,KJ31,5Kelana Jaya Line,Rapid Rail,LRT
Wangsa Maju,KJ3,5Kelana Jaya Line,Rapid Rail,LRT
Wawasan,KJ33,5Kelana Jaya Line,Rapid Rail,LRT`;

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

export function TrainFareCalculator() {
  const [fareResult, setFareResult] = useState<FareResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [originOpen, setOriginOpen] = useState(false);
  const [destinationOpen, setDestinationOpen] = useState(false);

  // Use the explicit FormValues type instead of z.infer
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      origin: "",
      destination: "",
      return: false,
      concession: false,
    },
  });

  // Function to fetch fares from RapidKL API
  const fetchFares = async (originCode: string, destinationCode: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://jp.mapit.myrapid.com.my/endpoint/geoservice/fares?agency=rapidkl&from=${originCode}&to=${destinationCode}`
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

      const shouldBuyDailyPass = relevantFare > 6;

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
            shouldBuyDailyPass: parseFloat(doubleFare) > 6,
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
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({station.code})
                                  </span>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
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
                                  <span className="text-xs text-muted-foreground ml-1">
                                    ({station.code})
                                  </span>
                                  <Check
                                    className={cn(
                                      "ml-auto h-4 w-4",
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

              <Button
                type="submit"
                className="w-full mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Calculating..." : "Calculate Fare"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {fareResult && (
        <Card className="bg-zinc-900 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Fare Result</CardTitle>
              <Train className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Journey:</span>
                <span className="font-medium">
                  {fareResult.origin} to {fareResult.destination}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Journey Type:</span>
                <span className="font-medium">
                  {fareResult.isReturn ? "Return" : "One-way"}
                  {fareResult.isConcession ? ", Concession" : ""}
                </span>
              </div>
              <div className="border-t border-zinc-700 my-4 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Cash Fare:</span>
                  <span className="text-lg font-bold">
                    RM {fareResult.cash}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Cashless Fare:</span>
                  <span className="text-lg font-bold">
                    RM {fareResult.cashless}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Concession Fare:</span>
                  <span className="text-lg font-bold">
                    RM {fareResult.concession}
                  </span>
                </div>
              </div>

              {fareResult.shouldBuyDailyPass && (
                <Alert className="mt-4 bg-green-900 border-green-700">
                  <AlertCircle className="h-4 w-4 text-green-400" />
                  <AlertTitle className="text-green-400 font-medium">
                    YOU SHOULD BUY A DAILY PASS!
                  </AlertTitle>
                  <AlertDescription className="text-green-300">
                    Your {fareResult.isConcession ? "concession" : "cashless"}{" "}
                    fare exceeds RM 6.00. Consider purchasing a daily pass for
                    better value!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
          <CardFooter className="bg-zinc-900 text-xs text-zinc-400">
            Fares are based on RapidKL official rates. Return tickets are
            calculated as double the one-way fare.
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
