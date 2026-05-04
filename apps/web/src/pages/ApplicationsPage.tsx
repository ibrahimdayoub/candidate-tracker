import { ApplicationStatusEnum, type Application, type ApplicationWithCandidate } from '@candidate-tracker/shared'

import { useMemo, useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ExternalLink, Search, Filter, Plus, Pencil, Trash2, Eye, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

import { useDebounce } from '@/hooks/useDebounce'
import { useApplications } from '@/hooks/useApplications'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

import { ApplicationForm } from '@/components/applications/ApplicationForm'

export default function ApplicationsPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const status = searchParams.get('status') || 'all'
    const page = Number(searchParams.get('page')) || 1

    const [searchTerm, setSearchTerm] = useState('')
    const debouncedSearch = useDebounce(searchTerm, 500)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedApp, setSelectedApp] = useState<any>(null) // TODO

    const params = useMemo(() => {
        const parsed = ApplicationStatusEnum.safeParse(status)

        return {
            search: debouncedSearch,
            page,
            limit: 10,
            ...(parsed.success && { status: parsed.data })
        }
    }, [debouncedSearch, page, status])

    const {
        applications,
        isLoading,
        totalCount,
        createApplication,
        updateApplication,
        deleteApplication,
        isCreating,
        isUpdating,
        isDeleting
    } = useApplications(params)

    // Update status via URL
    const handleStatusChange = (value: string) => {
        const params: any = Object.fromEntries(searchParams)

        if (value === 'all') {
            delete params.status
            delete params.page
        } else {
            params.status = value
            params.page = '1'
        }

        setSearchParams(params)
    }

    const handleAdd = () => {
        setSelectedApp(null)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string | undefined) => {
        await deleteApplication(id)
        toast.success("Application deleted")
    }

    const handleFormSubmit = async (data: Application) => {
        if (selectedApp) {
            await updateApplication({ id: selectedApp.id, data: { ...data } })
            toast.success("Application updated")
        } else {
            await createApplication(data)
            toast.success("Application created")
        }
        setIsFormOpen(false)
    }

    const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'hired': return 'default'
            case 'rejected': return 'destructive'
            case 'interviewing': return 'outline'
            default: return 'secondary'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold">Applications</h2>
                    <Badge variant="secondary">
                        Total: {totalCount}
                    </Badge>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Application
                </Button>
            </div>
            {/* Table */}
            <Card>
                {/* Header + Search */}
                <CardHeader>
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        {/* Search */}
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search applications..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9"
                            />
                            <p className="text-[10px] text-muted-foreground/60 mt-1 ml-2">
                                Search in: job · company · source · notes · candidate name · email · location
                            </p>
                        </div>
                        {/* Status Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <Select
                                value={status}
                                onValueChange={handleStatusChange}
                            >
                                <SelectTrigger className="w-45">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="applied">Applied</SelectItem>
                                    <SelectItem value="screening">Screening</SelectItem>
                                    <SelectItem value="interview">Interviewing</SelectItem>
                                    <SelectItem value="offer">Offer</SelectItem>
                                    <SelectItem value="hired">Hired</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                {/* Table */}
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            Loading applications...
                                        </TableCell>
                                    </TableRow>
                                ) : applications?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No applications found!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    applications.map((app: ApplicationWithCandidate) => (
                                        <TableRow key={app.id}>
                                            {/* Candidate */}
                                            <TableCell>
                                                <Link
                                                    to={`/candidates/${app.candidate_id}`}
                                                    className="font-semibold text-primary hover:underline flex items-center gap-1"
                                                >
                                                    {app.candidate?.name}
                                                    <ExternalLink className="h-3 w-3" />
                                                </Link>
                                                <div className="text-xs text-muted-foreground">
                                                    {app.candidate?.email}
                                                </div>
                                            </TableCell>
                                            {/* Job */}
                                            <TableCell>
                                                <div className="font-medium">{app.job_title}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {app.company}
                                                </div>
                                            </TableCell>
                                            {/* Date */}
                                            <TableCell>
                                                {app.applied_at
                                                    ? format(new Date(app.applied_at), 'MMM dd, yyyy')
                                                    : '-'}
                                            </TableCell>
                                            {/* Status */}
                                            <TableCell>
                                                <Badge variant={getStatusVariant(app.status)}>
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            {/* Actions */}
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => navigate(`/applications/${app.id}`)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => {
                                                                setSelectedApp(app)
                                                                setIsFormOpen(true)
                                                            }}
                                                            className="cursor-pointer"
                                                        >
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button className='w-full justify-start' variant="destructive" disabled={isDeleting}>
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
                                                                    <AlertDialogAction onClick={() => handleDelete(app.id)}>
                                                                        Confirm
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}

                            </TableBody>
                        </Table>

                    </div>
                </CardContent>
            </Card>
            {/* Create & Edit Application */}
            <ApplicationForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedApp}
                onSubmit={handleFormSubmit}
                isPending={isCreating || isUpdating}
            />
        </div>
    )
}