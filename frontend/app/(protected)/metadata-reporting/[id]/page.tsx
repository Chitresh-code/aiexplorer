// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
'use client';

import { useState } from 'react';
import { useLocation } from '@/lib/router';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const MetadataReporting = () => {
    const location = useLocation();
    const useCaseTitle = location.state?.useCaseTitle || 'Achman Test';

    // Form state
    const [formData, setFormData] = useState({
        reach: '',
        impact: '',
        confidence: '',
        effort: '',
        riceScore: '10434783',
        priority: '',
        delivery: '',
        totalUserBase: '',
        displayInGallery: true,
        sltReporting: true,
        reportingFrequency: 'Once in two week'
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleToggle = (field) => {
        if (field === 'sltReporting') {
            setFormData(prev => ({
                ...prev,
                sltReporting: !prev.sltReporting,
                // When SLT Reporting is turned off, clear frequency but keep Display in AI Gallery as is
                reportingFrequency: !prev.sltReporting ? prev.reportingFrequency : ''
            }));
        } else {
            // Allow toggling displayInGallery independently
            setFormData(prev => ({
                ...prev,
                [field]: !prev[field]
            }));
        }
    };

    const handleReset = () => {
        setFormData({
            reach: '',
            impact: '',
            confidence: '',
            effort: '',
            riceScore: '10434783',
            priority: '',
            delivery: '',
            totalUserBase: '',
            displayInGallery: true,
            sltReporting: true,
            reportingFrequency: 'Once in two week'
        });
    };

    const handleSave = () => {
        console.log('Saving metadata:', formData);
        // Add save logic here
    };

    // Validation logic
    const isResetEnabled = formData.reach.trim() !== '';
    const isSaveEnabled =
        formData.reach.trim() !== '' &&
        formData.impact !== '' &&
        formData.confidence !== '' &&
        formData.effort !== '' &&
        formData.riceScore.trim() !== '' &&
        formData.priority !== '' &&
        formData.delivery !== '' &&
        formData.totalUserBase !== '';


    return (
        <div className="main-content mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">



            {/* Impact Metrics Section */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.5rem'
                }}>
                    Impact Metrics
                </h3>
                <p style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '1.5rem'
                }}>
                    Measure the potential reach and impact of this use case
                </p>

                <Separator style={{ marginBottom: '1.5rem' }} />

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1rem'
                }}>
                    {/* Reach */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            color: '#333',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Reach
                        </label>
                        <Input
                            type="text"
                            value={formData.reach}
                            onChange={(e) => handleInputChange('reach', e.target.value)}
                        />
                    </div>

                    {/* Impact */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            color: '#333',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Impact
                        </label>
                        <Select value={formData.impact} onValueChange={(value) => handleInputChange('impact', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select impact level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                                <SelectItem value="Very High">Very High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {/* Confidence */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            color: '#333',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Confidence
                        </label>
                        <Select value={formData.confidence} onValueChange={(value) => handleInputChange('confidence', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select confidence level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Effort */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            color: '#333',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Effort
                        </label>
                        <Select value={formData.effort} onValueChange={(value) => handleInputChange('effort', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select effort level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Priority & Scoring Section */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.5rem'
                }}>
                    Priority & Scoring
                </h3>
                <p style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '1.5rem'
                }}>
                    Define prioritization and scoring metrics
                </p>
                <Separator style={{ marginBottom: '1.5rem' }} />

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1rem'
                }}>
                    {/* RICE Score */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            color: '#333',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            RICE Score
                        </label>
                        <Input
                            type="text"
                            value={formData.riceScore}
                            onChange={(e) => handleInputChange('riceScore', e.target.value)}
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            color: '#333',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Priority
                        </label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select priority level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {/* Delivery */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            color: '#333',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Delivery
                        </label>
                        <Select value={formData.delivery} onValueChange={(value) => handleInputChange('delivery', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select delivery quarter" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FY25Q01">FY25Q01</SelectItem>
                                <SelectItem value="FY25Q02">FY25Q02</SelectItem>
                                <SelectItem value="FY25Q03">FY25Q03</SelectItem>
                                <SelectItem value="FY25Q04">FY25Q04</SelectItem>
                                <SelectItem value="FY26Q01">FY26Q01</SelectItem>
                                <SelectItem value="FY26Q02">FY26Q02</SelectItem>
                                <SelectItem value="FY26Q03">FY26Q03</SelectItem>
                                <SelectItem value="FY26Q04">FY26Q04</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Total User Base */}
                    <div>
                        <label style={{
                            display: 'block',
                            fontSize: '0.9rem',
                            color: '#333',
                            marginBottom: '0.5rem',
                            fontWeight: '500'
                        }}>
                            Total User Base
                        </label>
                        <Select value={formData.totalUserBase} onValueChange={(value) => handleInputChange('totalUserBase', value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select user base range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0-100">0-100</SelectItem>
                                <SelectItem value="100-500">100-500</SelectItem>
                                <SelectItem value="500-1000">500-1000</SelectItem>
                                <SelectItem value="1000-5000">1000-5000</SelectItem>
                                <SelectItem value="5000+">5000+</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Reporting Configuration Section */}
            <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '0.5rem'
                }}>
                    Reporting Configuration
                </h3>
                <p style={{
                    fontSize: '0.85rem',
                    color: '#666',
                    marginBottom: '1.5rem'
                }}>
                    Configure how this use case is reported
                </p>
                <Separator style={{ marginBottom: '1.5rem' }} />

                {/* Display in AI Gallery */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0'
                }}>
                    <div>
                        <div style={{
                            fontSize: '0.95rem',
                            color: '#333',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                        }}>
                            Display in AI Gallery
                        </div>
                        <div style={{
                            fontSize: '0.85rem',
                            color: '#666'
                        }}>
                            Show this use case publicly in the gallery
                        </div>
                    </div>
                    <Switch
                        checked={formData.displayInGallery}
                        onCheckedChange={() => handleToggle('displayInGallery')}
                    />
                </div>
                <Separator />

                {/* SLT Reporting */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0'
                }}>
                    <div>
                        <div style={{
                            fontSize: '0.95rem',
                            color: '#333',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                        }}>
                            SLT Reporting
                        </div>
                        <div style={{
                            fontSize: '0.85rem',
                            color: '#666'
                        }}>
                            Include in senior leadership reports
                        </div>
                    </div>
                    <Switch
                        checked={formData.sltReporting}
                        onCheckedChange={() => handleToggle('sltReporting')}
                    />
                </div>
                <Separator />

                {/* Display in AI Gallery - Frequency */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 0',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    opacity: formData.sltReporting ? 1 : 0.5
                }}>
                    <div style={{ flex: '1 1 300px' }}>
                        <div style={{
                            fontSize: '0.95rem',
                            color: formData.sltReporting ? '#333' : '#999',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                        }}>
                            Reporting Frequency
                        </div>
                        <div style={{
                            fontSize: '0.85rem',
                            color: formData.sltReporting ? '#666' : '#999'
                        }}>
                            How often this use case is reported
                        </div>
                    </div>
                    <Select
                        value={formData.reportingFrequency}
                        onValueChange={(value) => handleInputChange('reportingFrequency', value)}
                        disabled={!formData.sltReporting}
                    >
                        <SelectTrigger style={{
                            flex: '0 1 250px',
                            opacity: formData.sltReporting ? 1 : 0.5
                        }}>
                            <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Once in two week">Once in two week</SelectItem>
                            <SelectItem value="Weekly">Weekly</SelectItem>
                            <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                            <SelectItem value="Quarterly">Quarterly</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '1rem',
                paddingTop: '1rem',
                paddingBottom: '5rem',
                marginBottom: '4rem'
            }}>
                <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={!isResetEnabled}
                >
                    Reset
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={!isSaveEnabled}
                    style={{
                        backgroundColor: isSaveEnabled ? '#E5FF1F' : undefined,
                        color: isSaveEnabled ? '#13352C' : undefined,
                    }}
                >
                    Save
                </Button>
            </div>
        </div>
    );
};

export default MetadataReporting;
