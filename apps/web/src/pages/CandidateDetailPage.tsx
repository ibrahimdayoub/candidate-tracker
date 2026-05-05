import type { Application, Candidate } from '@candidate-tracker/shared'

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin, Phone, Briefcase, Pencil, Trash2, Plus, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { useCandidateDetail, useCandidates } from '@/hooks/useCandidates'
import { useApplications } from '@/hooks/useApplications'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

import { CandidateForm } from '@/components/candidates/CandidateForm'
import { ApplicationForm } from '@/components/applications/ApplicationForm'

export default function CandidateDetailPage() {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    const {
        data: candidate,
        isLoading,
        isError
    } = useCandidateDetail(id)

    const {
        updateCandidate,
        deleteCandidate,
        isUpdating,
        isDeleting
    } = useCandidates()

    const {
        createApplication,
        isCreating
    } = useApplications()

    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isAppOpen, setIsAppOpen] = useState(false)
    const [selectedApp, setSelectedApp] = useState<any>(null) // TODO

    if (isLoading) {
        return <div className="p-10 text-center text-muted-foreground">Loading...</div>
    }

    if (isError || !candidate) {
        return <div className="p-10 text-center text-red-500">Candidate not found!</div>
    }

    const handleUpdate = async (data: Candidate) => {
        await updateCandidate({ id: candidate.id, data: { ...data } })
        toast.success("Candidate updated")
        setIsEditOpen(false)
    }

    const handleDelete = async () => {
        await deleteCandidate(candidate.id)
        toast.success("Candidate deleted")
        navigate('/candidates')
    }

    const handleCreateApplication = async (data: Application) => {
        await createApplication({
            ...data,
            candidate_id: candidate.id
        })
        setIsAppOpen(false)
    }

    const getStatusVariant = (status: string) => {
        const s = status.toLowerCase()
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
                    <Link to="/candidates">
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
                                <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Profile */}
                <Card className='bg-accent/50'>
                    <CardHeader className="text-center space-y-2">
                        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mx-auto">
                            {candidate.name?.charAt(0)}
                        </div>
                        <CardTitle>{candidate.name}</CardTitle>
                        <Badge variant="secondary">
                            ID: {candidate.id.slice(0, 16).replaceAll("-", "")}
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4" />
                            {candidate.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4" />
                            {candidate.phone || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            {candidate.location || 'Unknown'}
                        </div>
                    </CardContent>
                </Card>
                {/* Applications */}
                <Card className="md:col-span-3 bg-accent/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Applications
                        </CardTitle>
                        <Button
                            size="sm"
                            onClick={() => {
                                setSelectedApp(null)
                                setIsAppOpen(true)
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Application
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Source</TableHead>
                                    <TableHead>Salary</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {candidate.applications?.length ? (
                                    candidate.applications.map((app: Application) => (
                                        <TableRow
                                            key={app.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => navigate(`/applications/${app.id}`)}
                                        >
                                            <TableCell className="flex items-center gap-2 font-medium">
                                                {app.job_title}
                                                <ExternalLink className="h-3 w-3" />
                                            </TableCell>
                                            <TableCell>{app.company}</TableCell>
                                            <TableCell>{app.source || "-"}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {app.salary_expectation || "-"} $
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {format(new Date(app.applied_at), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant={getStatusVariant(app.status)}>
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                            No applications yet!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>

                    </CardContent>
                </Card>
            </div>
            {/* Edit Candidate */}
            <CandidateForm
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                initialData={candidate}
                onSubmit={handleUpdate}
                isPending={isUpdating}
            />
            {/* Create Application */}
            <ApplicationForm
                open={isAppOpen}
                onOpenChange={setIsAppOpen}
                initialData={selectedApp}
                onSubmit={handleCreateApplication}
                isPending={isCreating}
                defaultCandidate={candidate.id}
            />
        </div>
    )
}