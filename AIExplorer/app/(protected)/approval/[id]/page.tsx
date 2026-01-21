"use client";

import { useState } from "react";
import { useLocation } from '@/lib/router';
import { Check, X } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";



interface ApprovalHistoryItem {
    phase: string;
    approver: string;
    status: string;
    date: string;
}

interface MeaningfulUpdate {
    phase: string;
    champion: string;
    description: string;
    date: string;
}

interface UseCaseDetails {
    title: string;
    submittedBy: string;
    status: string;
    businessUnit: string;
}

const Approval = () => {
    const location = useLocation();
    const useCaseTitle =
        typeof location.state?.useCaseTitle === 'string'
            ? location.state.useCaseTitle
            : 'AchmanTest';

    const [decision, setDecision] = useState('');
    const [comments, setComments] = useState('');

    // Mock data - replace with actual data from API
    const useCaseDetails: UseCaseDetails = {
        title: useCaseTitle,
        submittedBy: 'Achman Saxena',
        status: 'Complete',
        businessUnit: 'Demo Channel',
    };



    const approvalHistory: ApprovalHistoryItem[] = [
        {
            phase: 'Diagnose',
            approver: 'Saurabh Yadav - Executive Sponsor',
            status: 'Approved',
            date: 'Oct 03, 2025',
        },
    ];

    const meaningfulUpdates: MeaningfulUpdate[] = [
        {
            phase: 'Diagnose',
            champion: 'Achman Saxena - Champion',
            description: 'This is a system sent by AchmanTest',
            date: 'Oct 18, 2025',
        },
    ];

    const handleSubmit = () => {
        console.log('Decision:', decision, 'Comments:', comments);
        // Add your submit logic here
    };

    const handleClear = () => {
        setDecision('');
        setComments('');
    };



    const getStatusBadge = (status: string) => {
        if (status === 'Approved') {
            return { bg: '#d4edda', color: '#155724' };
        } else if (status === 'Rejected') {
            return { bg: '#f8d7da', color: '#721c24' };
        }
        return { bg: '#e0e0e0', color: '#666' };
    };

    return (
        <div className="main-content">
            {/* Top Section - 3 Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                {/* Use Case Details */}
                <Card>
                    <CardHeader className="bg-[#13352C] text-white p-3">
                        <CardTitle className="text-sm font-semibold tracking-wider">USE CASE DETAILS</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Use Case Title</div>
                                <div className="text-base font-semibold text-gray-900">{useCaseDetails.title}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Submitted By</div>
                                <div className="text-base font-medium text-gray-900">{useCaseDetails.submittedBy}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Status</div>
                                <div className="text-base font-medium text-gray-900">{useCaseDetails.status}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Business Unit</div>
                                <div className="text-base font-medium text-gray-900">{useCaseDetails.businessUnit}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>



                {/* Approval History */}
                <Card>
                    <CardHeader className="bg-[#13352C] text-white p-3">
                        <CardTitle className="text-sm font-semibold tracking-wider">APPROVAL HISTORY</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {approvalHistory.map((item, index) => {
                                const badgeStyle = getStatusBadge(item.status);
                                return (
                                    <div
                                        key={index}
                                        className={`pb-4 ${index < approvalHistory.length - 1 ? 'border-b border-gray-200' : ''}`}
                                    >
                                        <div className="mb-4">
                                            <div className="text-sm text-gray-600 mb-1">Phase</div>
                                            <div className="text-base font-semibold text-gray-900">{item.phase}</div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="text-sm text-gray-600 mb-1">Status</div>
                                            <span className="text-sm px-3 py-1 rounded-full font-semibold"
                                                style={{ backgroundColor: badgeStyle.bg, color: badgeStyle.color }}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="mb-4">
                                            <div className="text-sm text-gray-600 mb-1">Approver</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-base font-medium text-gray-900">{item.approver}</span>
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="bg-[#13352C] text-white text-xs">
                                                        {item.approver.split(' ').map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Date</div>
                                            <div className="text-base font-medium text-gray-900">{item.date}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Your Decision Section */}
            <Card className="mb-8">
                <CardHeader className="bg-[#13352C] text-white p-3">
                    <CardTitle className="text-sm font-semibold tracking-wider">YOUR DECISION ON DESIGN PHASE</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex gap-8 mb-6">
                        <div className="w-1/4">
                            <Label htmlFor="decision">Your Decision</Label>
                            <Select value={decision} onValueChange={setDecision}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Decision" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Approve">Approve</SelectItem>
                                    <SelectItem value="Reject">Reject</SelectItem>
                                    <SelectItem value="Request Clarification">Request Clarification</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="comments">Comments</Label>
                            <Textarea
                                id="comments"
                                rows={4}
                                placeholder="Add your comments here..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-4 justify-end mt-4">
                        <Button variant="outline" onClick={handleClear}>
                            Clear
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!comments.trim()}
                            className="bg-[#13352C] hover:bg-[#0f2a23] text-white"
                        >
                            Submit
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Meaningful Updates Section */}
            <Card>
                <CardHeader className="bg-[#13352C] text-white p-3">
                    <CardTitle className="text-sm font-semibold tracking-wider">MEANINGFUL UPDATES</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {meaningfulUpdates.length > 0 ? (
                        <div className="space-y-6">
                            {meaningfulUpdates.map((update, index) => (
                                <div
                                    key={index}
                                    className={`pb-4 ${index < meaningfulUpdates.length - 1 ? 'border-b border-gray-200' : ''}`}
                                >
                                    <div className="grid grid-cols-3 gap-8 items-start mb-4">
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Phase</div>
                                            <div className="text-base font-semibold text-gray-900">{update.phase}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Champion</div>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    <AvatarFallback className="bg-[#13352C] text-white text-xs">
                                                        {update.champion.split(' ').map(name => name.charAt(0)).join('').slice(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-base font-medium text-gray-900">{update.champion}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600 mb-1">Date</div>
                                            <div className="text-base font-medium text-gray-900">{update.date}</div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Description</div>
                                        <div className="text-base font-medium text-gray-900 leading-relaxed">
                                            {update.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            No meaningful updates available
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default Approval;
