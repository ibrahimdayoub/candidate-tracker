import type { Candidate, CandidateWithCount } from '@candidate-tracker/shared'

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, MoreVertical, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'

import { useCandidates } from '@/hooks/useCandidates'
import { useDebounce } from '@/hooks/useDebounce'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CandidateForm } from '@/components/candidates/CandidateForm'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export default function CandidatesPage() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const search = searchParams.get('search') || ''
    const page = Number(searchParams.get('page')) || 1

    const [searchInput, setSearchInput] = useState(search)
    const debouncedSearch = useDebounce(searchInput, 500)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null)

    // Sync search with URL
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams)

        if (debouncedSearch) {
            newParams.set('search', debouncedSearch)
        } else {
            newParams.delete('search')
        }
        newParams.set('page', '1')

        setSearchParams(newParams)
    }, [debouncedSearch])

    const {
        candidates,
        isLoading,
        totalCount,
        pageSize,
        lastPage,
        createCandidate,
        updateCandidate,
        deleteCandidate,
        isCreating,
        isUpdating,
        isDeleting
    } = useCandidates({
        search,
        page
    })

    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, totalCount)

    const handlePageChange = (newPage: number) => {
        const newParams = new URLSearchParams(searchParams)
        newParams.set('page', String(newPage))
        setSearchParams(newParams)
    }

    const handleAdd = () => {
        setSelectedCandidate(null)
        setIsFormOpen(true)
    }

    const handleEdit = (candidate: CandidateWithCount, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedCandidate(candidate)
        setIsFormOpen(true)
    }

    const handleDelete = async (id: string | undefined, e: React.MouseEvent) => {
        e.stopPropagation()
        await deleteCandidate(id)

        if (candidates?.length === 1 && page > 1) {
            handlePageChange(page - 1)
        }

        toast.success("Candidate deleted")
    }

    const handleFormSubmit = async (data: Candidate) => {
        if (selectedCandidate) {
            await updateCandidate({ id: selectedCandidate.id, data: { ...data } })
            toast.success("Candidate updated")
        } else {
            await createCandidate(data)
            toast.success("Candidate created")
        }
        setIsFormOpen(false)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-3xl font-bold">Candidates</h2>
                    <Badge variant="secondary">
                        Total: {totalCount}
                    </Badge>
                </div>
                <Button onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Candidate
                </Button>
            </div>
            {/* Table */}
            <Card className='bg-accent/25'>
                {/* Header + Search */}
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-semibold">All Candidates</h3>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-9"
                            />
                            <p className="text-[10px] text-muted-foreground/60 mt-1 ml-2">
                                Search in: candidate name · email · phone · location
                            </p>
                        </div>
                    </div>
                </CardHeader>
                {/* Table */}
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Applications</TableHead>
                                    <TableHead className="w-20">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10">
                                            Loading candidates...
                                        </TableCell>
                                    </TableRow>
                                ) : candidates?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                            No candidates found!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    candidates.map((candidate: CandidateWithCount) => (
                                        <TableRow
                                            key={candidate.id}
                                            className="cursor-pointer hover:bg-slate-50"
                                            onClick={() => navigate(`/candidates/${candidate.id}`)}
                                        >
                                            <TableCell className="font-medium">
                                                {candidate.name}
                                            </TableCell>
                                            <TableCell>
                                                {candidate.email}
                                            </TableCell>
                                            <TableCell>
                                                {candidate.phone || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {candidate.location || "-"}
                                            </TableCell>
                                            <TableCell>
                                                {candidate._count?.applications || 0}
                                            </TableCell>
                                            {/* Actions */}
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={(e) => handleEdit(candidate, e)}
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
                                                                    <AlertDialogTitle>Delete Candidate?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={(e) => handleDelete(candidate.id, e)}>
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
                {/* Pagination */}
                {/* {lastPage > 1 && (
                    <div className="flex items-center justify-between px-6 pb-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {candidates?.length || 0} of {totalCount} candidates
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium px-3 py-1.5 bg-slate-100 rounded-md">
                                {page} / {lastPage}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= lastPage || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )} */}
                {lastPage > 1 && (
                    <div className="flex items-center justify-between px-6 pb-6">
                        <p className="text-sm text-muted-foreground">
                            Showing {start}-{end} of {totalCount} applications
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page <= 1 || isLoading}
                            >
                                Previous
                            </Button>
                            <span className="text-sm font-medium px-3 py-1.5 bg-slate-100 rounded-md">
                                {page} / {lastPage}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= lastPage || isLoading}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
            {/* Create & Edit Candidate */}
            <CandidateForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                initialData={selectedCandidate}
                onSubmit={handleFormSubmit}
                isPending={isCreating || isUpdating}
            />
        </div>
    )
}