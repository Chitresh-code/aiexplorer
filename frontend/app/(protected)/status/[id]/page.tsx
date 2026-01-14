// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import {useState} from 'react';
import { useLocation } from '@/lib/router';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

const Status = () => {
    const location = useLocation();
    const useCaseTitle = location.state?.useCaseTitle || 'Status';

    const [currentStatus, setCurrentStatus] = useState('On-Track');
    const [nextPhase, setNextPhase] = useState('');
    const [notes, setNotes] = useState('');

    const phases = [
        { name: 'Idea', status: 'Completed' },
        { name: 'Diagnose', status: 'Not Started' },
        { name: 'Design', status: 'Not Started' },
        { name: 'Implement', status: 'Not Started' },
    ];

    const approvalHistory = [
        { phase: 'Idea', status: 'Approved', date: '10/25/2025', approver: 'System' },
        { phase: 'Diagnose', status: 'Rejected', date: '11/02/2025', approver: 'Jane Doe', note: 'More details needed on ROI.' },
    ];

    const handleUpdateStatus = () => {
        console.log('Updating status to:', currentStatus);
    };

    const handleRequestApproval = () => {
        console.log('Requesting approval for:', nextPhase, 'Notes:', notes);
    };



    return (
        <div className="main-content space-y-8">
            {/* Page Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-foreground mb-2">{useCaseTitle || 'Status'}</h1>
                <p className="text-muted-foreground">Track project progress and manage approvals</p>
            </div>

            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Phase & Status */}
                <Card className="lg:col-span-1">
                    <CardHeader className="bg-primary text-primary-foreground py-3">
                        <CardTitle className="text-sm font-semibold tracking-wide">
                            CURRENT PHASE & STATUS
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Current Phase</Label>
                                <div className="text-xl font-semibold text-primary mt-1">Idea</div>
                            </div>

                            <div>
                                <Label className="text-sm font-medium">Current Status</Label>
                                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="On-Track">On-Track</SelectItem>
                                        <SelectItem value="At Risk">At Risk</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="Help Needed">Help Needed</SelectItem>
                                        <SelectItem value="No Updates">No Updates</SelectItem>
                                        <SelectItem value="Not Started">Not Started</SelectItem>
                                        <SelectItem value="Parked">Parked</SelectItem>
                                        <SelectItem value="Rejected">Rejected</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <Button onClick={handleUpdateStatus} className="w-full">
                            Update Status
                        </Button>
                    </CardContent>
                </Card>

                {/* Completion Summary */}
                <Card className="lg:col-span-1">
                    <CardHeader className="bg-primary text-primary-foreground py-3">
                        <CardTitle className="text-sm font-semibold tracking-wide">
                            COMPLETION SUMMARY
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-6">
                        {phases.map((phase, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
                                <span className="font-medium text-sm">{phase.name}</span>
                                <Badge variant={phase.status === 'Completed' ? 'default' : 'secondary'} className="text-xs">
                                    {phase.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Approval History */}
                <Card className="lg:col-span-1">
                    <CardHeader className="bg-primary text-primary-foreground py-3">
                        <CardTitle className="text-sm font-semibold tracking-wide">
                            APPROVAL HISTORY
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-80 overflow-y-auto pt-6">
                        <div className="space-y-4">
                            {approvalHistory.map((item, index) => (
                                <div key={index} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-sm">{item.phase}</span>
                                        <Badge variant={item.status === 'Approved' ? 'default' : 'destructive'} className="text-xs">
                                            {item.status}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                        <span>{item.date}</span>
                                        <span>{item.approver}</span>
                                    </div>
                                    {item.note && (
                                        <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded">
                                            "{item.note}"
                                        </div>
                                    )}
                                </div>
                            ))}
                            {approvalHistory.length === 0 && (
                                <div className="text-center text-muted-foreground py-8 text-sm">
                                    No approval history available
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Request Approval Section */}
            <Card>
                <CardHeader className="bg-primary text-primary-foreground py-3">
                    <CardTitle className="text-sm font-semibold tracking-wide">
                        REQUEST APPROVAL FOR NEXT PHASE
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <Label className="text-sm font-medium">Request Approval For</Label>
                                <Select value={nextPhase} onValueChange={setNextPhase}>
                                    <SelectTrigger className="mt-2">
                                        <SelectValue placeholder="Select Next Phase" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Diagnose">Diagnose</SelectItem>
                                        <SelectItem value="Design">Design</SelectItem>
                                        <SelectItem value="Implement">Implement</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                    Action blocked — phase must be Completed or Not Started, select 'Request Approval for Next Phase'.
                                </AlertDescription>
                            </Alert>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Notes and Justification</Label>
                            <Textarea
                                rows={6}
                                placeholder="Describe the work completed and why you're ready to advance to the next phase..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => { setNextPhase(''); setNotes(''); }} className="sm:w-auto">
                            Clear Form
                        </Button>
                        <Button onClick={handleRequestApproval} className="sm:w-auto">
                            Send Request
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Meaningful Updates */}
            <Card>
                <CardHeader className="bg-primary text-primary-foreground py-3">
                    <CardTitle className="text-sm font-semibold tracking-wide">
                        MEANINGFUL UPDATES
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 pb-6">
                    <Empty>
                        <EmptyMedia variant="icon">
                            📝
                        </EmptyMedia>
                        <EmptyTitle>No updates available</EmptyTitle>
                        <EmptyDescription>
                            Updates will appear here when new information is shared.
                        </EmptyDescription>
                    </Empty>
                </CardContent>
            </Card>
        </div>
    );
};

export default Status;
