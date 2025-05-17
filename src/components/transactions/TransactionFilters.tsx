
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, CalendarDays } from 'lucide-react';
import { format, type  DateRange } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function TransactionFilters() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { toast } = useToast();

  const handleApplyFilters = () => {
    // In a real app, you'd use these filter values to query data
    console.log("Applying filters with date range:", dateRange);
    toast({
      title: "Filters Applied (Mock)",
      description: "Transaction list would be updated with selected filters.",
    });
  };

  return (
    <Card className="mb-6 shadow-md">
      <CardContent className="pt-6 flex flex-wrap items-end gap-4">
        <div className="flex-grow min-w-[150px] space-y-1">
          <Label htmlFor="search-details">Search Details</Label>
          <Input id="search-details" placeholder="e.g., Titan Shield, Alice" />
        </div>
        <div className="flex-grow min-w-[150px] space-y-1">
          <Label htmlFor="type-filter">Type</Label>
          <Select>
            <SelectTrigger id="type-filter"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="withdrawal">Withdrawal</SelectItem>
              <SelectItem value="conversion">Conversion</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
              <SelectItem value="referral_bonus">Referral Bonus</SelectItem>
              <SelectItem value="profit_loss">Profit/Loss</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow min-w-[150px] space-y-1">
          <Label htmlFor="status-filter">Status</Label>
          <Select>
            <SelectTrigger id="status-filter"><SelectValue placeholder="All Statuses" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow min-w-[150px] space-y-1">
          <Label>Date Range</Label>
          <Popover>
              <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
              </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleApplyFilters}><Filter className="mr-2 h-4 w-4" /> Apply Filters</Button>
      </CardContent>
    </Card>
  );
}
