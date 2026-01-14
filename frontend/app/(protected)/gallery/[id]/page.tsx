"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Bot, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface GalleryUseCase {
    id: number;
    title: string;
    phase: string;
    department: string;
    aiTheme: string;
    modelName: string;
    bgColor: string;
    persona: string;
}

const AIGalleryDetail = () => {
    const router = useRouter();
    const params = useParams();
    const [useCase, setUseCase] = useState<GalleryUseCase | null>(null);

    // Mock data - in real app, this would come from an API
    const useCases: GalleryUseCase[] = [
        {
            id: 1,
            title: 'Autotranslation using AWS translation',
            phase: 'Diagnose',
            bgColor: '#c7e7e7',
            department: 'Communications',
            persona: 'All',
            aiTheme: 'Audio Generation, Causal Inference / Causal AI, Data Extraction',
            modelName: 'Poppulo AI'
        },
        {
            id: 2,
            title: 'Ready Implementation - Check History Chatbot',
            phase: 'Idea',
            bgColor: '#e8d5c4',
            department: 'Engineering',
            persona: 'Developer',
            aiTheme: 'Conversational AI',
            modelName: 'GPT-4'
        },
        {
            id: 3,
            title: 'Ready Integrations sharePoint Assistant',
            phase: 'Implemented',
            bgColor: '#d5e5d5',
            department: 'IT',
            persona: 'Admin',
            aiTheme: 'Intelligent Document Processing',
            modelName: 'Azure AI'
        }
    ];

    useEffect(() => {
        const id = params.id as string;
        const foundUseCase = useCases.find(uc => uc.id === parseInt(id));
        if (foundUseCase) {
            setUseCase(foundUseCase);
        } else {
            router.push('/gallery');
        }
    }, [params.id, router]);

    if (!useCase) return null;

    return (
        <div className="main-content">
            <div className="flex gap-6">
                {/* Sidebar Card */}
                <Card className="w-[350px] flex-shrink-0" style={{ backgroundColor: useCase.bgColor }}>
                    <CardContent className="p-8">
                        <div className="flex justify-center mb-8">
                            <Bot size={48} color="#13352C" />
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-[#13352C] mb-2">Use Case:</h3>
                                <p className="text-[#13352C] font-medium">{useCase.title}</p>
                            </div>

                            <div className="flex justify-between">
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-[#13352C] mb-2">Phase:</h3>
                                    <p className="text-[#13352C] font-medium">{useCase.phase}</p>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-[#13352C] mb-2">Department:</h3>
                                    <p className="text-[#13352C] font-medium">{useCase.department}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-[#13352C] mb-2">AI Theme:</h3>
                                <p className="text-[#13352C] font-medium whitespace-normal break-words">{useCase.aiTheme}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-[#13352C] mb-2">Model Name:</h3>
                                <p className="text-[#13352C] font-medium">{useCase.modelName}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Card */}
                <Card className="flex-1">
                    <CardHeader className="relative">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-4 right-4"
                            onClick={() => router.push('/gallery')}
                        >
                            <X size={20} />
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <div className="space-y-8">
                            <div>
                                <CardTitle className="text-lg mb-4">Headline - One line Executive Headline</CardTitle>
                                <p className="text-gray-700 leading-relaxed">
                                    Streamline multilingual communication through AI-assisted translation.
                                </p>
                            </div>

                            <div>
                                <CardTitle className="text-lg mb-4">Opportunity - What is the idea for which AI is being used?</CardTitle>
                                <p className="text-gray-700 leading-relaxed">
                                    Streamline multilingual communication through AI-assisted translation.
                                </p>
                            </div>

                            <div>
                                <CardTitle className="text-lg mb-4">Evidence - Why it is needed?</CardTitle>
                                <p className="text-gray-700 leading-relaxed">
                                    Streamline multilingual communication through AI-assisted translation.
                                </p>
                            </div>

                            <div>
                                <CardTitle className="text-lg mb-4">Primary Contact</CardTitle>
                                <p className="text-gray-700 leading-relaxed">
                                    Streamline multilingual communication through AI-assisted translation.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AIGalleryDetail;
