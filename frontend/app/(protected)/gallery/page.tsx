"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from '@/lib/router';
import { Bot, ChevronDown, Loader2, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from "@/components/ui/combobox";
import { MultiCombobox } from "@/components/ui/multi-combobox";
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

      <Card className="shadow-sm">
        <CardContent className="py-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search use cases..."
              value={filters.useCase}
              onChange={(e) => setFilters({ ...filters, useCase: e.target.value })}
              className="h-10 w-full pl-10 bg-white text-base border-gray-200"
            />
          </div>
        </CardContent>
      </Card>

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
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Loading AI Gallery...</p>
            </div>
          ) : filteredUseCases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <Bot size={40} className="text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-lg font-medium">No use cases found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find what you're looking for.</p>
              <Button variant="link" onClick={handleReset} className="mt-2">Reset all filters</Button>
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
