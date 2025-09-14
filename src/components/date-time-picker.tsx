"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { useTranslations } from "next-intl"

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
  placeholder = "dd/mm/yyyy, --:--",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const t = useTranslations();
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState<string>(
    value ? value.toTimeString().slice(0, 5) : ""
  )

  React.useEffect(() => {
    if (value) {
      setDate(value)
      setTime(value.toTimeString().slice(0, 5))
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate && time) {
      const [hours, minutes] = time.split(":").map(Number)
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(hours, minutes, 0, 0)
      onChange?.(newDateTime)
    } else if (selectedDate) {
      // If no time is selected, use current time
      const now = new Date()
      const newDateTime = new Date(selectedDate)
      newDateTime.setHours(now.getHours(), now.getMinutes(), 0, 0)
      setTime(now.toTimeString().slice(0, 5))
      onChange?.(newDateTime)
    } else {
      onChange?.(undefined)
    }
    setOpen(false)
  }

  const handleTimeChange = (timeValue: string) => {
    setTime(timeValue)
    if (date && timeValue) {
      const [hours, minutes] = timeValue.split(":").map(Number)
      const newDateTime = new Date(date)
      newDateTime.setHours(hours, minutes, 0, 0)
      onChange?.(newDateTime)
    }
  }

  return (
    <div className={className}>
      <div className="flex gap-4">
        <div className="flex flex-col gap-3">
          <Label htmlFor="date-picker" className="px-1">
            {t('lot.arrivalTime')} ({t('lot.optional')})
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date-picker"
                className="w-32 justify-between font-normal"
                disabled={disabled}
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={handleDateSelect}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex flex-col gap-3">
          <Label htmlFor="time-picker" className="px-1">
            Time
          </Label>
          <Input
            type="time"
            id="time-picker"
            step="1"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}
