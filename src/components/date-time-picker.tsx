'use client';

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useTranslations } from 'next-intl';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
}: DateTimePickerProps) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(value);
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(value, "HH:mm") : ""
  );

  React.useEffect(() => {
    setDate(value);
    if (value) {
      setTimeValue(format(value, "HH:mm"));
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const currentTime = timeValue ? timeValue.split(':') : ['00', '00'];
      const [hours, minutes] = currentTime;
      
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      
      setDate(newDateTime);
      onChange(newDateTime);
    } else {
      setDate(undefined);
      onChange(undefined);
    }
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    
    if (date && time) {
      const [hours, minutes] = time.split(':');
      const newDateTime = new Date(date);
      newDateTime.setHours(parseInt(hours) || 0, parseInt(minutes) || 0, 0, 0);
      
      setDate(newDateTime);
      onChange(newDateTime);
    }
  };

  const formatDateTime = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "dd/MM/yyyy, HH:mm");
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{t('lot.arrivalTime')} ({t('lot.optional')})</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "flex-1 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "dd/MM/yyyy") : placeholder || t('lot.arrivalTime')}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <div className="relative">
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="w-24 pr-8"
            disabled={disabled}
          />
          <Clock className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>
      
      {date && (
        <div className="text-sm text-muted-foreground">
          {formatDateTime(date)}
        </div>
      )}
    </div>
  );
}
