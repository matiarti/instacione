"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { useTranslations } from "next-intl"

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
  className?: string
  disabled?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)
  const [timeValue, setTimeValue] = React.useState<string>(
    value ? format(value, "HH:mm") : ""
  )

  React.useEffect(() => {
    if (value) {
      setSelectedDate(value)
      setTimeValue(format(value, "HH:mm"))
    }
  }, [value])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number)
      const newDateTime = new Date(date)
      newDateTime.setHours(hours, minutes, 0, 0)
      onChange?.(newDateTime)
    } else if (date) {
      // If no time is selected, use current time
      const now = new Date()
      const newDateTime = new Date(date)
      newDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0)
      setTimeValue(format(now, "HH:mm"))
      onChange?.(newDateTime)
    } else {
      onChange?.(undefined)
    }
  }

  const handleTimeChange = (time: string) => {
    setTimeValue(time)
    if (selectedDate && time) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours, minutes, 0, 0)
      onChange?.(newDateTime)
    }
  }

  const formatDisplayValue = () => {
    if (!selectedDate) return placeholder
    const timeStr = timeValue || format(selectedDate, "HH:mm")
    return `${format(selectedDate, "dd/MM/yyyy")}, ${timeStr}`
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{t('lot.arrivalTime')} ({t('lot.optional')})</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
              disabled={disabled}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDisplayValue()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="flex">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
              <div className="border-l p-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Time</Label>
                  <Input
                    type="time"
                    value={timeValue}
                    onChange={(e) => handleTimeChange(e.target.value)}
                    className="w-24"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
