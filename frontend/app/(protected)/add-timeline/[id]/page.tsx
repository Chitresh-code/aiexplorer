"use client";

import { useState } from "react";
import { useNavigate, useLocation } from '@/lib/router';
import { toast } from 'sonner';

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
        <div className="main-content">
            <div className="metrics-table-container" style={{ marginTop: '2rem' }}>
                <table className="reporting-table">
                    <thead>
                        <tr>
                            <th style={{ width: '30%' }}>Phase</th>
                            <th style={{ width: '35%' }}>Start Date</th>
                            <th style={{ width: '35%' }}>End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {phases.map((phase, index) => (
                            <tr key={index}>
                                <td>
                                    <input
                                        type="text"
                                        className="readonly-input"
                                        value={phase.name}
                                        readOnly
                                        style={{ fontWeight: '500', textAlign: 'left', paddingLeft: '1rem' }}
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        className="metric-input"
                                        value={phase.startDate}
                                        onChange={(e) => handleDateChange(index, 'startDate', e.target.value)}
                                        placeholder="Select a date..."
                                    />
                                </td>
                                <td>
                                    <input
                                        type="date"
                                        className="metric-input"
                                        value={phase.endDate}
                                        onChange={(e) => handleDateChange(index, 'endDate', e.target.value)}
                                        placeholder="Select a date..."
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end mt-4">
                <button
                    className={`submit-metric-btn ${!isFormValid ? 'disabled' : ''}`}
                    onClick={handleSubmit}
                    disabled={!isFormValid}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default AddTimeline;
