// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import {useState} from 'react';
import { useNavigate } from '@/lib/router';
import { X, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

const MeaningfulUpdate = () => {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [newUpdateText, setNewUpdateText] = useState('');

    // Mock data for history
    const [updates, setUpdates] = useState([
        { id: 1, text: 'This is an Update test for Achman Test.', submittedBy: 'Chitresh Gyanani', role: 'Champion', submittedOn: '8/10/2025', phase: '', status: '' },
        { id: 2, text: 'This is an Update test for Achman Test.', submittedBy: 'Chitresh Gyanani', role: 'Champion', submittedOn: '8/10/2025', phase: '', status: '' },
        { id: 3, text: 'This is an Update test for Achman Test.', submittedBy: 'Chitresh Gyanani', role: 'Champion', submittedOn: '8/10/2025', phase: '', status: '' },
        { id: 4, text: 'This is an Update test for Achman Test.', submittedBy: 'Chitresh Gyanani', role: 'Champion', submittedOn: '8/10/2025', phase: '', status: '' },
        { id: 5, text: 'This is an Update test for Achman Test.', submittedBy: 'Chitresh Gyanani', role: 'Champion', submittedOn: '8/10/2025', phase: '', status: '' },
    ]);

    const handleSave = () => {
        if (!newUpdateText.trim()) return;

        const newUpdate = {
            id: updates.length + 1,
            text: newUpdateText,
            submittedBy: 'Current User', // Placeholder for now
            role: 'Champion',
            submittedOn: new Date().toLocaleDateString(),
            phase: '',
            status: ''
        };

        setUpdates([newUpdate, ...updates]);
        setShowAddModal(false);
        toast.success('Your Meaningful Update has been submitted successfully!');
        setNewUpdateText('');
    };



    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'text',
            header: 'Meaningful Update',
            cell: ({ row }) => (
                <input
                    type="text"
                    className="readonly-input"
                    value={row.original.text}
                    readOnly
                    style={{ textAlign: 'left', paddingLeft: '1rem' }}
                />
            ),
            size: 350,
        },
        {
            accessorKey: 'submittedBy',
            header: 'Submitted By',
            cell: ({ row }) => (
                <span className="metric-name-cell">{row.original.submittedBy}</span>
            ),
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: ({ row }) => (
                <input type="text" className="readonly-input" value={row.original.role} readOnly />
            ),
        },
        {
            accessorKey: 'submittedOn',
            header: 'Submitted On',
            cell: ({ row }) => (
                <span className="metric-name-cell">{row.original.submittedOn}</span>
            ),
        },
        {
            accessorKey: 'phase',
            header: 'Phase',
            cell: () => null,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: () => null,
        },
    ];

    const table = useReactTable({
        data: updates,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="main-content">
            <div className="metrics-actions" style={{ justifyContent: 'flex-end', gap: '1rem' }}>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <Plus size={18} />
                            Add Meaningful Update
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Meaningful Update</DialogTitle>
                            <DialogDescription>
                                Add a meaningful update that reflects significant progress.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <Textarea
                                value={newUpdateText}
                                onChange={(e) => setNewUpdateText(e.target.value)}
                                className="min-h-[200px]"
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleSave}>Save</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Button onClick={() => {
                    toast.success('Meaningful updates submitted successfully!');
                    navigate('/champion');
                }}>
                    Submit
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} style={{ width: header.getSize() }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No updates found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>




        </div>
    );
};

export default MeaningfulUpdate;
