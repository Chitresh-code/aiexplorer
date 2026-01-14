"use client";

import { useState } from "react";
import { useNavigate } from '@/lib/router';
import { Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SectionCards } from "@/features/dashboard/components/SectionCards";

interface GalleryFilters {
    useCase: string;
    department: string;
    persona: string;
    aiTheme: string;
    vendor: string;
    phase: string;
}

interface GalleryUseCase {
    id: number;
    title: string;
    phase: string;
    bgColor: string;
    department: string;
    persona: string;
    aiTheme: string;
    modelName: string;
}

const AIGallery = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState<GalleryFilters>({
        useCase: '',
        department: '',
        persona: '',
        aiTheme: '',
        vendor: '',
        phase: ''
    });

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

    const handleReset = () => {
        setFilters({
            useCase: '',
            department: '',
            persona: '',
            aiTheme: '',
            vendor: '',
            phase: ''
        });
    };

    const handleExplore = (useCase: GalleryUseCase) => {
        navigate(`/gallery/${useCase.id}`, { state: { useCase } });
    };

    return (
        <div className="flex flex-1 flex-col gap-6 p-6 w-full">
            {/* KPI Dashboard Section */}
            <div className="w-full">
                <SectionCards />
            </div>

            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="grid grid-cols-[1fr_auto] grid-rows-2 gap-3 w-full items-center">

                  {/* ROW 1 FILTERS */}
                  <div className="grid grid-cols-3 gap-3 w-full">
                    {/* Use Case */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="truncate text-sm">
                            {filters.useCase || "Use Case Title"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {Array.from(new Set(useCases.map(u => u.title))).map(title => (
                          <DropdownMenuItem
                            key={title}
                            onClick={() => setFilters({ ...filters, useCase: title })}
                          >
                            {title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Department */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="truncate text-sm">
                            {filters.department || "Department"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {Array.from(new Set(useCases.map(u => u.department))).map(dept => (
                          <DropdownMenuItem
                            key={dept}
                            onClick={() => setFilters({ ...filters, department: dept })}
                          >
                            {dept}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Personas */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="truncate text-sm">
                            {filters.persona || "Target Personas"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {Array.from(new Set(useCases.map(u => u.persona))).map(persona => (
                          <DropdownMenuItem
                            key={persona}
                            onClick={() => setFilters({ ...filters, persona })}
                          >
                            {persona}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* RESET (CENTERED BETWEEN ROWS) */}
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="text-red-500 hover:bg-red-50 row-span-2 self-center"
                  >
                    Reset
                  </Button>

                  {/* ROW 2 FILTERS (SAME WIDTH AS ROW 1) */}
                  <div className="grid grid-cols-3 gap-3 w-full">
                    {/* AI Themes */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="truncate text-sm">
                            {filters.aiTheme || "AI Themes"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {Array.from(new Set(useCases.map(u => u.aiTheme))).map(theme => (
                          <DropdownMenuItem
                            key={theme}
                            onClick={() => setFilters({ ...filters, aiTheme: theme })}
                          >
                            {theme}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Vendor */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="truncate text-sm">
                            {filters.vendor || "Vendor"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {Array.from(new Set(useCases.map(u => u.modelName))).map(vendor => (
                          <DropdownMenuItem
                            key={vendor}
                            onClick={() => setFilters({ ...filters, vendor })}
                          >
                            {vendor}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Phase */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="truncate text-sm">
                            {filters.phase || "Phase"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                        {Array.from(new Set(useCases.map(u => u.phase))).map(phase => (
                          <DropdownMenuItem
                            key={phase}
                            onClick={() => setFilters({ ...filters, phase })}
                          >
                            {phase}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gallery Grid Card */}
            <Card className="shadow-sm">
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {useCases.map((useCase) => (
                            <Card key={useCase.id} className="border-0 shadow-none h-full" style={{ backgroundColor: useCase.bgColor }}>
                                <CardContent className="p-8 flex flex-col h-full gap-6 items-start">
                                    <div className="mb-2">
                                        <Bot size={40} className="text-[#13352C]" strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-3 flex-grow">
                                        <h3 className="text-xl font-medium text-[#13352C] leading-snug">{useCase.title}</h3>
                                        <p className="text-[#13352C] opacity-80 font-medium text-base">• {useCase.phase}</p>
                                    </div>
                                    <Button
                                        className="bg-[#D3E12E] hover:bg-[#c0ce25] text-[#13352C] font-bold px-8 rounded-md mt-4"
                                        onClick={() => handleExplore(useCase)}
                                    >
                                        Explore
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AIGallery;
