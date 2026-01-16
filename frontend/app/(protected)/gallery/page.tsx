"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from '@/lib/router';
import { Bot, ChevronDown, Loader2, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Combobox } from "@/components/ui/combobox";
import { GalleryMultiCombobox as MultiCombobox } from "./multi-combobox";
import { SectionCards } from "@/features/dashboard/components/SectionCards";
import {
  getDropdownData,
  getBusinessStructure,
  getAllVendors,
  getAllVendorsFromAllVendorsData,
  getBusinessUnitsFromData
} from '@/lib/submit-use-case';
import { fetchUseCases } from '@/lib/api';

interface GalleryFilters {
  useCase: string;
  department: string;
  persona: string[];
  aiTheme: string[];
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
  const [activeTab, setActiveTab] = useState("search");
  const [filters, setFilters] = useState<GalleryFilters>({
    useCase: '',
    department: '',
    persona: [],
    aiTheme: [],
    vendor: '',
    phase: ''
  });

  const [useCases, setUseCases] = useState<GalleryUseCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dropdownData, setDropdownData] = useState<any>(null);
  const [businessData, setBusinessData] = useState<any>(null);
  const [vendorsData, setVendorsData] = useState<any>(null);

  useEffect(() => {
    const loadAllData = async () => {
      try {
        setIsLoading(true);
        const [cases, dropdowns, business, vendors] = await Promise.all([
          fetchUseCases(),
          getDropdownData(),
          getBusinessStructure(),
          getAllVendors()
        ]);

        // Map backend use cases to GalleryUseCase interface if needed
        const mappedCases = cases.map((uc: any) => ({
          id: uc.ID || uc.id,
          title: uc.Title || uc.UseCase || uc.title,
          phase: uc.Phase || uc.phase || 'Idea',
          bgColor: uc.bgColor || '#c7e7e7', // Default or from backend
          department: uc.BusinessUnit || uc.department || 'N/A',
          persona: uc.TargetPersonas || uc.persona || 'All',
          aiTheme: uc.AITheme || uc.aiTheme || 'N/A',
          modelName: uc.VendorName || uc.modelName || 'N/A'
        }));

        setUseCases(mappedCases);
        setDropdownData(dropdowns);
        setBusinessData(business);
        setVendorsData(vendors);
      } catch (error) {
        console.error("Error loading gallery data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  const departmentOptions = useMemo(() => {
    const units = getBusinessUnitsFromData(businessData);
    return units.map(unit => ({ label: unit, value: unit }));
  }, [businessData]);

  const personaOptions = useMemo(() => {
    if (!dropdownData?.personas) return [];
    return dropdownData.personas.map((p: any) => ({ label: p.label, value: p.label }));
  }, [dropdownData]);

  const themeOptions = useMemo(() => {
    if (!dropdownData?.ai_themes) return [];
    return dropdownData.ai_themes.map((t: any) => ({ label: t.label, value: t.label }));
  }, [dropdownData]);

  const vendorOptions = useMemo(() => {
    const vendors = getAllVendorsFromAllVendorsData(vendorsData);
    return vendors.map(v => ({ label: v, value: v }));
  }, [vendorsData]);

  const phaseOptions = [
    { label: 'Idea', value: 'Idea' },
    { label: 'Diagnose', value: 'Diagnose' },
    { label: 'Design', value: 'Design' },
    { label: 'Implemented', value: 'Implemented' }
  ];

  const handleReset = () => {
    setFilters({
      useCase: '',
      department: '',
      persona: [],
      aiTheme: [],
      vendor: '',
      phase: ''
    });
  };

  const handleExplore = (useCase: GalleryUseCase) => {
    navigate(`/gallery/${useCase.id}`, { state: { useCase } });
  };

  const filteredUseCases = useCases.filter(uc => {
    const matchesUseCase = !filters.useCase || uc.title.toLowerCase().includes(filters.useCase.toLowerCase());
    const matchesDepartment = !filters.department || uc.department === filters.department;
    const matchesPersona = filters.persona.length === 0 || filters.persona.some(p => uc.persona.includes(p));
    const matchesAITheme = filters.aiTheme.length === 0 || filters.aiTheme.some(t => uc.aiTheme.includes(t));
    const matchesVendor = !filters.vendor || uc.modelName === filters.vendor;
    const matchesPhase = !filters.phase || uc.phase === filters.phase;

    return matchesUseCase && matchesDepartment && matchesPersona && matchesAITheme && matchesVendor && matchesPhase;
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full">
      {/* KPI Dashboard Section */}
      <div className="w-full">
        <SectionCards />
      </div>

      <div className="flex justify-center py-4">
        <div className="w-full max-w-3xl">
          {/* Search Bar Container */}
          <div className="border border-gray-300 rounded-lg bg-white overflow-hidden">
            {/* Search Input */}
            <div className="relative">
              <Input
                placeholder={
                  activeTab === "similar"
                    ? "Describe your use case to find similar ones..."
                    : "Search use cases..."
                }
                value={filters.useCase}
                onChange={(e) => setFilters({ ...filters, useCase: e.target.value })}
                className="h-16 text-sm border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Tab Buttons Inside at Bottom */}
            <div className="flex items-center gap-2 px-3 pb-2 pt-1 bg-white">
              <Button
                size="sm"
                variant={activeTab === "similar" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("similar")}
                className="h-8 text-xs px-3"
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Find Similar
              </Button>
              <Button
                size="sm"
                variant={activeTab === "search" ? "secondary" : "ghost"}
                onClick={() => setActiveTab("search")}
                className="h-7 text-xs px-3"
              >
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Combobox
              options={phaseOptions}
              value={filters.phase}
              onChange={(val: string) => setFilters({ ...filters, phase: val })}
              placeholder="Phase"
              className="h-8 w-fit gap-2 border-dashed bg-white px-3 shrink-0"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
            />

            <Combobox
              options={vendorOptions}
              value={filters.vendor}
              onChange={(val: string) => setFilters({ ...filters, vendor: val })}
              placeholder="Vendor"
              className="h-8 w-fit gap-2 border-dashed bg-white px-3 shrink-0"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
            />

            <MultiCombobox
              options={personaOptions}
              value={filters.persona}
              onChange={(val: string[]) => setFilters({ ...filters, persona: val })}
              placeholder="Target Personas"
              className="h-8 w-fit gap-2 border-dashed bg-white px-3 shrink-0"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
              hideBadges={true}
            />

            <MultiCombobox
              options={themeOptions}
              value={filters.aiTheme}
              onChange={(val: string[]) => setFilters({ ...filters, aiTheme: val })}
              placeholder="AI Themes"
              className="h-8 w-fit gap-2 border-dashed bg-white px-3 shrink-0"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
              hideBadges={true}
            />

            <Combobox
              options={departmentOptions}
              value={filters.department}
              onChange={(val: string) => setFilters({ ...filters, department: val })}
              placeholder="Department"
              className="h-8 w-fit gap-2 border-dashed bg-white px-3 shrink-0"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
            />

            {(filters.useCase || filters.department || filters.phase || filters.persona.length > 0 || filters.aiTheme.length > 0 || filters.vendor) && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="h-8 px-3 text-sm shrink-0"
              >
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid Card */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="border-0 shadow-none h-full" style={{ backgroundColor: '#f5f5f5' }}>
                  <CardContent className="p-8 flex flex-col h-full gap-6 items-start">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-3 flex-grow w-full">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-5 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-28 rounded-md" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredUseCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Bot size={40} className="text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-medium">No use cases found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
              <div className="flex items-center gap-3 mt-4">
                <Button variant="link" onClick={handleReset}>Reset filters</Button>
                <Button
                  onClick={() => navigate('/submit-use-case')}
                  className="bg-[#D3E12E] hover:bg-[#c0ce25] text-[#13352C] font-bold px-6"
                >
                  Submit a new Use Case
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUseCases.map((useCase) => (
                <Card key={useCase.id} className="border-0 shadow-none h-full transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer" style={{ backgroundColor: useCase.bgColor }} onClick={() => handleExplore(useCase)}>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExplore(useCase);
                      }}
                    >
                      Explore
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AIGallery;
