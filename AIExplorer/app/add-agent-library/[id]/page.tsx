'use client';
import { useState } from 'react';
import { useNavigate, useLocation } from '@/lib/router';
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const AddAgentLibrary = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const sourceScreen = location.state?.sourceScreen || 'champion'; // Default to champion

    const parentScreen = sourceScreen === 'champion'
        ? { name: 'Champion Use Cases', path: '/champion' }
        : { name: 'My Use Cases', path: '/my-use-cases' };

    const [knowledgeForce, setKnowledgeForce] = useState('');
    const [instructions, setInstructions] = useState('');

    const handleSave = () => {
        // Here you would typically save the data
        toast.success('Agent library submitted successfully');
        // Navigate after a short delay to allow the toast to be seen
        setTimeout(() => {
            navigate(parentScreen.path);
        }, 1500);
    };

    return (
        <div className="main-content space-y-3">
            <div className="w-full space-y-6">

                {/* Knowledge Source Selection */}
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground py-3">
                        <CardTitle className="text-sm font-semibold tracking-wide">
                            SELECT KNOWLEDGE SOURCE
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Knowledge Source</Label>
                            <Select value={knowledgeForce} onValueChange={setKnowledgeForce}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Knowledge Source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Sharepoint">Sharepoint</SelectItem>
                                    <SelectItem value="OneDrive">OneDrive</SelectItem>
                                    <SelectItem value="ServiceNow">ServiceNow</SelectItem>
                                    <SelectItem value="Salesforce">Salesforce</SelectItem>
                                    <SelectItem value="Public Websites">Public Websites</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions Section */}
                <Card>
                    <CardHeader className="bg-primary text-primary-foreground py-3">
                        <CardTitle className="text-sm font-semibold tracking-wide">
                            ADD INSTRUCTIONS / PROMPT
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Agent Instructions / Prompt</Label>
                            <Textarea
                                placeholder="Enter agent instructions or prompt..."
                                rows={8}
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                className="resize-none"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={!knowledgeForce || !instructions}
                        className="min-w-24"
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AddAgentLibrary;
