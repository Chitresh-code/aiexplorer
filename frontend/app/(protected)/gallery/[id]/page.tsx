"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { getRouteState } from "@/lib/navigation-state";

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

const mockUseCases: GalleryUseCase[] = [
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

const AIGalleryDetail = () => {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const [useCase, setUseCase] = useState<GalleryUseCase | null>(null);

    useEffect(() => {
        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, []);

    useEffect(() => {
        const routeState = getRouteState<{ useCase?: GalleryUseCase }>(pathname);
        if (routeState?.useCase) {
            setUseCase(routeState.useCase);
            return;
        }

        const id = params.id as string;
        const foundUseCase = mockUseCases.find(uc => uc.id === parseInt(id));
        if (foundUseCase) {
            setUseCase(foundUseCase);
            return;
        }

        router.push('/gallery');
    }, [pathname, params.id, router]);

    if (!useCase) return null;

    return (
        <div className="main-content h-screen overflow-hidden">
            <div className="w-full">
                <div className="w-[95%] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(80vh-150px)]">
                        <div className="lg:col-span-1">
                            <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col" style={{ backgroundColor: useCase.bgColor }}>
                                <CardContent className="p-8 flex-1">
                                    <div className="space-y-6 h-full">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Use Case:</h3>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Input
                                                    value={useCase.title}
                                                    readOnly
                                                    className="text-[#13352C] font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                                                />
                                                <Badge variant="secondary" className="bg-white/80 text-[#13352C] border-none shadow-sm hover:bg-white font-semibold flex-shrink-0">
                                                    {useCase.phase}
                                                </Badge>
                                                <Badge variant="outline" className="bg-[#13352C] text-white border-none shadow-md px-3 py-1 font-medium flex-shrink-0">
                                                    {useCase.modelName}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Department:</h3>
                                            <Input
                                                value={useCase.department}
                                                readOnly
                                                className="text-[#13352C] font-medium bg-transparent border-none shadow-none focus-visible:ring-0 p-0 h-auto"
                                            />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">AI Theme:</h3>
                                            <div className="text-[#13352C] font-medium text-base whitespace-normal break-words">
                                                {useCase.aiTheme}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-1">
                            <Card className="border-none shadow-sm bg-white overflow-hidden ring-1 ring-gray-200 h-full flex flex-col">
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
                                <CardContent className="pt-6 flex-1">
                                    <div className="space-y-8 h-full">
                                        <div>
                                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Headline - One line Executive Headline</CardTitle>
                                            <Textarea
                                                value="Streamline multilingual communication through AI-assisted translation."
                                                readOnly
                                                className="text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden"
                                            />
                                        </div>

                                        <div>
                                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Opportunity - What is the idea for which AI is being used?</CardTitle>
                                            <Textarea
                                                value="Streamline multilingual communication through AI-assisted translation."
                                                readOnly
                                                className="text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden"
                                            />
                                        </div>

                                        <div>
                                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Evidence - Why it is needed?</CardTitle>
                                            <Textarea
                                                value="Streamline multilingual communication through AI-assisted translation."
                                                readOnly
                                                className="text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden"
                                            />
                                        </div>

                                        <div>
                                            <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-2">Primary Contact Person</CardTitle>
                                            <Textarea
                                                value="Streamline multilingual communication through AI-assisted translation."
                                                readOnly
                                                className="text-gray-700 leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 p-0 min-h-0 h-auto resize-none overflow-hidden"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIGalleryDetail;
