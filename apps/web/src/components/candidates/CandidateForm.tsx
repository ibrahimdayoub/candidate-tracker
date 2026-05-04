import { CandidateSchema, type Candidate, type CandidateWithCount } from "@candidate-tracker/shared"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/ui/form-field"

interface CandidateFormProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSubmit: (data: Candidate) => void | Promise<void>
    initialData?: Partial<CandidateWithCount>
    isPending?: boolean
}

// Candidate Create/Edit Form
export function CandidateForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    isPending
}: CandidateFormProps) {
    const form = useForm<Candidate>({
        resolver: zodResolver(CandidateSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            location: "",
            ...initialData
        },
    })

    // Reset form when editing different candidate
    useEffect(() => {
        form.reset({
            name: "",
            email: "",
            phone: "",
            location: "",
            ...initialData
        })
    }, [initialData])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {initialData ? "Edit Candidate" : "Add New Candidate"}
                    </DialogTitle>
                </DialogHeader>
                <form id="candidate-form" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        {/* Name */}
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormField label="Full Name" error={fieldState.error}>
                                    <Input {...field} placeholder="John Doe" />
                                </FormField>
                            )}
                        />
                        {/* Email */}
                        <Controller
                            name="email"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormField label="Email" error={fieldState.error}>
                                    <Input {...field} type="email" placeholder="john@example.com" />
                                </FormField>
                            )}
                        />
                        {/* Phone */}
                        <Controller
                            name="phone"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormField label="Phone Number" error={fieldState.error}>
                                    <Input {...field} value={field.value ?? ""} placeholder="+966..." />
                                </FormField>
                            )}
                        />
                        {/* Location */}
                        <Controller
                            name="location"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <FormField label="Location" error={fieldState.error}>
                                    <Input {...field} value={field.value ?? ""} placeholder="Riyadh, KSA" />
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
                    <Button type="submit" form="candidate-form" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Candidate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}