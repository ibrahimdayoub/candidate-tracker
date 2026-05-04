import type { Application } from '@candidate-tracker/shared'

import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, Building2, Briefcase, User, Mail, ExternalLink, Pencil, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { useApplicationDetail, useApplications } from '@/hooks/useApplications'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { ApplicationForm } from '@/components/applications/ApplicationForm'

export default function ApplicationDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()

    const [isEditOpen, setIsEditOpen] = useState(false)

    const {
        data: application,
        isLoading,
        isError
    } = useApplicationDetail(id)

    const {
        updateApplication,
        deleteApplication,
        isUpdating,
        isDeleting
    } = useApplications()

    if (isLoading) {
        return <div className="p-10 text-center text-muted-foreground">Loading...</div>
    }

    if (isError || !application) {
        return <div className="p-10 text-center text-red-500">Application not found!</div>
    }

    const handleUpdate = async (values: Application) => {
        await updateApplication({ id: id!, data: values })
        toast.success("Application updated")
        setIsEditOpen(false)
    }

    const handleDelete = async () => {
            await deleteApplication(id!)
            toast.success("Application deleted")
            navigate('/applications')
    }

    const getStatusVariant = (status: string) => {
        const s = status?.toLowerCase()
        if (s === 'hired') return 'default'
        if (s === 'rejected') return 'destructive'
        if (s === 'interviewing') return 'outline'
        return 'secondary'
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center">
                <Button variant="ghost" asChild>
                    <Link to="/applications">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Link>
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Application?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>
                                    Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog> 
                </div>
            </div>
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Application */}
                <Card className="md:col-span-2">
                    <CardHeader className="space-y-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="h-5 w-5 text-blue-600" />
                                    {application.job_title}
                                </CardTitle>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                    <Building2 className="h-4 w-4" />
                                    {application.company}
                                </p>
                            </div>
                            <Badge variant={getStatusVariant(application.status)}>
                                {application.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(application.applied_at), 'PPP')}
                        </div>
                        <Separator />
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                            {application.notes || "No notes provided"}
                        </p>
                    </CardContent>
                </Card>
                {/* Candidate */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Candidate
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link
                            to={`/candidates/${application.candidate_id}`}
                            className="block p-3 rounded-md hover:bg-muted transition"
                        >
                            <div className="flex items-center justify-between font-medium">
                                {application.candidate?.name}
                                <ExternalLink className="h-4 w-4" />
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Mail className="h-4 w-4" />
                                {application.candidate?.email}
                            </div>
                        </Link>
                        <Button variant="outline" className="w-full" asChild>
                            <Link to={`/candidates/${application.candidate_id}`}>
                                View Profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            {/* Edit Application */}
            <ApplicationForm
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                initialData={application}
                onSubmit={handleUpdate}
                isPending={isUpdating}
            />
        </div>
    )
}