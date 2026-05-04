import type { Candidate, CandidateWithCount } from '@candidate-tracker/shared'

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, MoreVertical, Pencil, Trash2, Search } from 'lucide-react'
import { toast } from 'sonner'

import { useCandidates } from '@/hooks/useCandidates'

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

    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)

    const [isFormOpen, setIsFormOpen] = useState(false)
    const [selectedCandidate, setSelectedCandidate] = useState<any>(null) // TODO

    const {
        candidates,
        isLoading,
        totalCount,
        createCandidate,
        updateCandidate,
        deleteCandidate,
        isCreating,
        isUpdating,
        isDeleting
    } = useCandidates({
        search,
        page,
        limit: 10
    })

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
        toast.success("Candidate deleted")
    }

    const handleFormSubmit = async (data: Candidate) => {
        if (selectedCandidate) {
            console.log("Edit: ", data)
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
            <Card>
                {/* Header + Search */}
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h3 className="font-semibold">All Candidates</h3>
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search candidates..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value)
                                    setPage(1)
                                }}
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