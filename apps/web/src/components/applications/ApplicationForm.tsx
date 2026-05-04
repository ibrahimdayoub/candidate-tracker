import { ApplicationSchema, type Application, type Candidate } from "@candidate-tracker/shared"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useCandidates } from "@/hooks/useCandidates"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"
import type z from "zod"

interface ApplicationFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: Application) => void | Promise<void>
    initialData?: Partial<Application>
    isPending?: boolean
    defaultCandidate?: string
}

// Application Create/Edit Form
export function ApplicationForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isPending,
    defaultCandidate = ""
}: ApplicationFormProps) {
    const { candidates, isLoading: isLoadingCandidates } = useCandidates({
        limit: 100
    })

    const form = useForm({
        resolver: zodResolver(ApplicationSchema),
        defaultValues: {
            job_title: "",
            company: "",
            status: "applied",
            applied_at: new Date(),
            candidate_id: defaultCandidate ? defaultCandidate : "",
            notes: "",
            ...initialData
        }
    })

    // Reset form when switching between create/edit modes
    useEffect(() => {
        form.reset({
            job_title: "",
            company: "",
            status: "applied",
            applied_at: new Date(),
            candidate_id: defaultCandidate ? defaultCandidate : "",
            notes: "",
            ...initialData
        })
    }, [initialData])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Application" : "Create New Application"}
                    </DialogTitle>
                </DialogHeader>
                <form id="application-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Candidate */}
                        <Controller
                            name="candidate_id"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormField label="Candidate" error={fieldState.error}>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger>
                                            <SelectValue
                                                placeholder={
                                                    isLoadingCandidates
                                                        ? "Loading..."
                                                        : "Select candidate"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {candidates?.map((c: Candidate) => (
                                                <SelectItem key={c.id} value={c.id || ""}>
                                                    {c.name} ({c.email})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            )}
                        />
                        {/* Job + Company */}
                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="job_title"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <FormField label="Job Title" error={fieldState.error}>
                                        <Input {...field} placeholder="Frontend Dev" />
                                    </FormField>
                                )}
                            />
                            <Controller
                                name="company"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <FormField label="Company" error={fieldState.error}>
                                        <Input {...field} placeholder="Meta" />
                                    </FormField>
                                )}
                            />
                        </div>
                        {/* Status + Date */}
                        <div className="grid grid-cols-2 gap-4">
                            <Controller
                                name="status"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <FormField label="Status" error={fieldState.error}>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {['applied',
                                                    'screening',
                                                    'interview',
                                                    'offer',
                                                    'hired',
                                                    'rejected'].map(
                                                        s => (
                                                            <SelectItem key={s} value={s}>
                                                                {s}
                                                            </SelectItem>
                                                        )
                                                    )}
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                )}
                            />
                            <Controller
                                name="applied_at"
                                control={form.control}
                                render={({ field, fieldState }) => {
                                    const dateValue = field.value as Date;

                                    return (
                                        <FormField label="Applied Date" error={fieldState.error}>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        className={cn(
                                                            "w-full justify-start text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateValue
                                                            ? format(dateValue, "PPP")
                                                            : "Pick date"}
                                                    </Button>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-auto p-0">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateValue}
                                                        onSelect={(date) => field.onChange(date)}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </FormField>
                                    );
                                }}
                            />
                        </div>
                        {/* Notes */}
                        <Controller
                            name="notes"
                            control={form.control}
                            render={({ field }) => (
                                <FormField label="Notes">
                                    <Input {...field} value={field.value ?? ""} placeholder="Optional notes..." />
                                </FormField>
                            )}
                        />
                    </div>
                </form>
                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" form="application-form" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {initialData ? "Update" : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}