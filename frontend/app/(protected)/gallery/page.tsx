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
import { GalleryPhaseCombobox as PhaseCombobox } from "./phase-combobox";
import { GalleryVendorCombobox as VendorCombobox } from "./vendor-combobox";
import { GalleryPersonaMultiCombobox as PersonaMultiCombobox } from "./persona-multi-combobox";
import { GalleryAIThemeMultiCombobox as AIThemeMultiCombobox } from "./ai-theme-multi-combobox";
import { GalleryDepartmentCombobox as DepartmentCombobox } from "./department-combobox";
import { GalleryTeamCombobox as TeamCombobox } from "./team-combobox";
import { GallerySubTeamCombobox as SubTeamCombobox } from "./sub-team-combobox";
import { SectionCards } from "@/features/dashboard/components/SectionCards";
import {
  getDropdownData,
  getBusinessStructure,
  getAllVendors,
  getAllVendorsFromAllVendorsData,
  getBusinessUnitsFromData,
  getTeamsForBusinessUnit,
  getSubTeamsForTeam
} from '@/lib/submit-use-case';
import { fetchUseCases } from '@/lib/api';

interface GalleryUseCase {
  id: number;
  title: string;
  phase: string;
  bgColor: string;
  department: string;
  persona: string;
  aiTheme: string;
  modelName: string;
  teamName: string;
  subTeamName: string;
}

const AIGallery = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");
  const [searchUseCase, setSearchUseCase] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedAiThemes, setSelectedAiThemes] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState('');
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedSubTeams, setSelectedSubTeams] = useState<string[]>([]);

  const normalizedDepartments = Array.isArray(selectedDepartment)
    ? selectedDepartment
    : selectedDepartment
      ? [selectedDepartment]
      : [];

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
          modelName: uc.VendorName || uc.modelName || 'N/A',
          teamName: uc.TeamName || uc["Team Name"] || '',
          subTeamName: uc.SubTeamName || uc["Sub Team Name"] || ''
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
    return vendors
      .filter((vendor) => {
        const normalized = String(vendor ?? "").trim().toLowerCase();
        return normalized && normalized !== "no vendor identified";
      })
      .map(vendor => ({ label: vendor, value: vendor }));
  }, [vendorsData]);

  const teamOptions = useMemo(() => {
    if (!businessData) return [];
    const teamSet = new Set<string>();
    normalizedDepartments.forEach((unit) => {
      getTeamsForBusinessUnit(businessData, unit).forEach((team) => teamSet.add(team));
    });
    // If no specific business unit is selected, you might want to show all teams or none
    // Usually it's better to show all if none selected, or wait for choice.
    // Based on My Use Cases, it uses selectedBusinessUnits.
    if (normalizedDepartments.length === 0) {
      const allUnits = getBusinessUnitsFromData(businessData);
      allUnits.forEach((unit) => {
        getTeamsForBusinessUnit(businessData, unit).forEach((team) => teamSet.add(team));
      });
    }
    return Array.from(teamSet).sort().map((name) => ({ label: name, value: name }));
  }, [businessData, normalizedDepartments]);

  const subTeamOptions = useMemo(() => {
    if (!businessData) return [];
    const teamCandidates = selectedTeams.length ? selectedTeams : teamOptions.map((team) => team.value);
    const subTeamSet = new Set<string>();

    const unitsToUse = normalizedDepartments.length > 0
      ? normalizedDepartments
      : getBusinessUnitsFromData(businessData);

    unitsToUse.forEach((unit) => {
      const teamsForUnit = getTeamsForBusinessUnit(businessData, unit);
      const teamsToUse = teamCandidates.filter((team) => teamsForUnit.includes(team));
      teamsToUse.forEach((team) => {
        getSubTeamsForTeam(businessData, unit, team).forEach((subTeam) => subTeamSet.add(subTeam));
      });
    });
    return Array.from(subTeamSet).sort().map((name) => ({ label: name, value: name }));
  }, [businessData, normalizedDepartments, selectedTeams, teamOptions]);

  const phaseOptions = [
    { label: 'Idea', value: 'Idea' },
    { label: 'Diagnose', value: 'Diagnose' },
    { label: 'Design', value: 'Design' },
    { label: 'Implemented', value: 'Implemented' }
  ];

  const handleReset = () => {
    setSearchUseCase('');
    setSelectedDepartment([]);
    setSelectedPersonas([]);
    setSelectedAiThemes([]);
    setSelectedVendor([]);
    setSelectedPhase('');
    setSelectedTeams([]);
    setSelectedSubTeams([]);
  };

  const handleExplore = (useCase: GalleryUseCase) => {
    navigate(`/gallery/${useCase.id}`, { state: { useCase } });
  };

  const filteredUseCases = useCases.filter(uc => {
    const matchesUseCase = !searchUseCase || uc.title.toLowerCase().includes(searchUseCase.toLowerCase());
    const matchesDepartment = normalizedDepartments.length === 0
      || normalizedDepartments.some((department) => uc.department?.includes(department));
    const matchesPersona = selectedPersonas.length === 0 || selectedPersonas.some(p => uc.persona.includes(p));
    const matchesAITheme = selectedAiThemes.length === 0 || selectedAiThemes.some(t => uc.aiTheme.includes(t));
    const matchesVendor = selectedVendor.length === 0
      || selectedVendor.some((vendor) => uc.modelName?.includes(vendor));
    const matchesPhase = !selectedPhase || uc.phase === selectedPhase;
    const matchesTeam = selectedTeams.length === 0
      || selectedTeams.some((team) => uc.teamName?.toLowerCase() === team.toLowerCase());
    const matchesSubTeam = selectedSubTeams.length === 0
      || selectedSubTeams.some((subTeam) => uc.subTeamName?.toLowerCase() === subTeam.toLowerCase());

    return matchesUseCase && matchesDepartment && matchesPersona && matchesAITheme && matchesVendor && matchesPhase && matchesTeam && matchesSubTeam;
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full">
      {/* KPI Dashboard Section */}
      <div className="w-full">
        <SectionCards />
      </div>

      <div className="flex justify-center py-4">
        <div className="w-full max-w-5xl">
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
                value={searchUseCase}
                onChange={(e) => setSearchUseCase(e.target.value)}
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
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            <PhaseCombobox
              options={phaseOptions}
              value={selectedPhase}
              onChange={setSelectedPhase}
              placeholder="Phase"
              className="h-8 gap-2 border-dashed bg-white px-3"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
            />

            <VendorCombobox
              options={vendorOptions}
              value={selectedVendor}
              onChange={setSelectedVendor}
              placeholder="Vendor Names"
              className="h-8 gap-2 border-dashed bg-white px-3"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
            />

            <PersonaMultiCombobox
              options={personaOptions}
              value={selectedPersonas}
              onChange={setSelectedPersonas}
              placeholder="Target Personas"
              className="h-8 gap-2 border-dashed bg-white px-3"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
            />

            <AIThemeMultiCombobox
              options={themeOptions}
              value={selectedAiThemes}
              onChange={setSelectedAiThemes}
              placeholder="AI Themes"
              className="h-8 gap-2 border-dashed bg-white px-3"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
            />

            <DepartmentCombobox
              options={departmentOptions}
              value={normalizedDepartments}
              onChange={setSelectedDepartment}
              placeholder="Business Unit"
              className="h-8 gap-2 border-dashed bg-white px-3"
              icon={<PlusCircle className="h-4 w-4 text-muted-foreground" />}
            />

            <TeamCombobox
              options={teamOptions}
              value={selectedTeams}
              onChange={setSelectedTeams}
              className="h-8 gap-2 border-dashed bg-white px-3"
              alignOffset={65}
              sideOffset={110}
            />

            <SubTeamCombobox
              options={subTeamOptions}
              value={selectedSubTeams}
              onChange={setSelectedSubTeams}
              className="h-8 gap-2 border-dashed bg-white px-3"
              alignOffset={125}
              sideOffset={110}
            />
          </div>

          {(searchUseCase || normalizedDepartments.length > 0 || selectedPhase || selectedPersonas.length > 0 || selectedAiThemes.length > 0 || selectedVendor.length > 0 || selectedTeams.length > 0 || selectedSubTeams.length > 0) && (
            <div className="mt-3 flex justify-end">
              <Button
                variant="ghost"
                onClick={handleReset}
                className="h-8 px-3 text-sm"
              >
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gallery Grid Card */}
      <Card className="shadow-sm">
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="border-0 shadow-none h-full" style={{ backgroundColor: '#f5f5f5' }}>
                  <CardContent className="p-6 flex flex-col h-full gap-4 items-start">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <div className="space-y-2 flex-grow w-full">
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
            <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
              {filteredUseCases.map((useCase) => (
                <Card key={useCase.id} className="border-0 shadow-none h-full transition-all hover:scale-[1.02] hover:shadow-md cursor-pointer" style={{ backgroundColor: useCase.bgColor }} onClick={() => handleExplore(useCase)}>
                  <CardContent className="p-6 flex flex-col h-full gap-4 items-start">
                    <div className="mb-1">
                      <Bot size={40} className="text-[#13352C]" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-2 flex-grow">
                      <h3 className="text-xl font-medium text-[#13352C] leading-snug">{useCase.title}</h3>
                      <p className="text-[#13352C] opacity-80 font-medium text-base">• {useCase.phase}</p>
                    </div>
                    <Button
                      className="bg-[#D3E12E] hover:bg-[#c0ce25] text-[#13352C] font-bold px-8 rounded-md mt-2"
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
