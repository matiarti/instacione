"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateTimePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  className?: string
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  label,
  className
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [timeValue, setTimeValue] = React.useState(
    value ? format(value, "HH:mm") : ""
  )

  React.useEffect(() => {
    if (value) {
      setDate(value)
      setTimeValue(format(value, "HH:mm"))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Combine selected date with current time
      const [hours, minutes] = timeValue.split(":").map(Number)
      const combinedDate = new Date(selectedDate)
      combinedDate.setHours(hours || 0, minutes || 0, 0, 0)
      
      setDate(combinedDate)
      onChange?.(combinedDate)
    } else {
      setDate(undefined)
      onChange?.(undefined)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    
    if (date && time) {
      const [hours, minutes] = time.split(":").map(Number)
      const combinedDate = new Date(date)
      combinedDate.setHours(hours || 0, minutes || 0, 0, 0)
      
      setDate(combinedDate)
      onChange?.(combinedDate)
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : "Pick a date"}
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
        
        <Input
          type="time"
          value={timeValue}
          onChange={(e) => handleTimeChange(e.target.value)}
          className="w-[120px]"
          placeholder="--:--"
        />
      </div>
    </div>
  )
}
