"use client";

import { useState } from "react";
import { useNavigate, useLocation } from '@/lib/router';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from "lucide-react";

type PhaseField = "startDate" | "endDate";

interface Phase {
    name: string;
    startDate: string;
    endDate: string;
}

const AddTimeline = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sourceScreen = location.state?.sourceScreen || 'champion'; // Default to champion

    // Determine parent screen details based on sourceScreen
    const parentScreen = sourceScreen === 'champion'
        ? { name: 'Champion Use Cases', path: '/champion' }
        : { name: 'My Use Cases', path: '/my-use-cases' };

    const [phases, setPhases] = useState<Phase[]>([
        { name: 'Idea', startDate: '', endDate: '' },
        { name: 'Diagnose', startDate: '', endDate: '' },
        { name: 'Design', startDate: '', endDate: '' },
        { name: 'Implemented', startDate: '', endDate: '' }
    ]);

    // Check if at least one row has both start and end dates filled
    // OR if the user meant specific validation.
    // Based on "submit button tb tk disabled rahe jab tak woh start and end date fill naa ho jaaye",
    // I'll assume at least one complete entry is required to submit.
    const isFormValid = phases.some((phase) => phase.startDate && phase.endDate);

    const handleDateChange = (index: number, field: PhaseField, value: string) => {
        setPhases((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [field]: value };
            return next;
        });
    };

    const handleSubmit = () => {
        if (isFormValid) {
            toast.success('Timeline updated successfully');
            navigate(parentScreen.path);
        }
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            <div className="w-[95%] mx-auto">
                <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-teal-600" />
                            Timeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            {phases.map((phase, index) => (
                                <div key={phase.name} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 rounded-lg border border-gray-200 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                                        <span className="font-medium text-gray-900 text-sm">{phase.name}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500 font-medium">Start Date</Label>
                                        <input
                                            type="date"
                                            className="w-full h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            value={phase.startDate}
                                            onChange={(e) => handleDateChange(index, 'startDate', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-gray-500 font-medium">End Date</Label>
                                        <input
                                            type="date"
                                            className="w-full h-8 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                            value={phase.endDate}
                                            onChange={(e) => handleDateChange(index, 'endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end mt-6">
                    <Button
                        onClick={handleSubmit}
                        disabled={!isFormValid}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                        Submit Timeline
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddTimeline;
