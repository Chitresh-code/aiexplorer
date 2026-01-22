"use client";

import { useMemo, useState } from "react";
import { useNavigate } from "@/lib/router";
import { PlusCircle } from "lucide-react";
import { SectionCards } from "@/features/dashboard/components/SectionCards";
import { GallerySearch } from "@/components/gallery/gallery-search";
import { GalleryFilters, type GalleryFilterConfig } from "@/components/gallery/gallery-filters";
import { GalleryResults } from "@/components/gallery/gallery-results";
import {
  useGalleryData,
  type GalleryFilterState,
} from "@/features/gallery/hooks/useGalleryData";

const AIGallery = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"search" | "similar">("search");
  const [searchUseCase, setSearchUseCase] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string[]>([]);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>([]);
  const [selectedAiThemes, setSelectedAiThemes] = useState<string[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<string[]>([]);
  const [selectedPhase, setSelectedPhase] = useState("");
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedSubTeams, setSelectedSubTeams] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedAiModels, setSelectedAiModels] = useState<string[]>([]);

  const filterState: GalleryFilterState = {
    phase: selectedPhase,
    vendor: selectedVendor,
    personas: selectedPersonas,
    aiThemes: selectedAiThemes,
    businessUnits: selectedDepartment,
    teams: selectedTeams,
    subTeams: selectedSubTeams,
    status: selectedStatuses,
    aiModels: selectedAiModels,
  };

  const { useCases, filtersData, isLoading } = useGalleryData({
    activeTab,
    searchText: searchUseCase,
    filters: filterState,
  });

  const departmentOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.businessUnits.map((unit) => ({
      label: unit.name,
      value: unit.name,
    }));
  }, [filtersData]);

  const personaOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.personas.map((persona) => ({
      label: persona,
      value: persona,
    }));
  }, [filtersData]);

  const themeOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.aiThemes.map((theme) => ({
      label: theme,
      value: theme,
    }));
  }, [filtersData]);

  const vendorOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.vendors.map((vendor) => ({
      label: vendor.name,
      value: vendor.name,
    }));
  }, [filtersData]);

  const statusOptions = useMemo(() => {
    if (!filtersData) return [];
    return filtersData.statuses.map((status) => ({
      label: status,
      value: status,
    }));
  }, [filtersData]);

  const aiModelOptions = useMemo(() => {
    if (!filtersData) return [];
    const selectedVendors = selectedVendor.length
      ? new Set(selectedVendor)
      : null;
    const models = filtersData.vendors
      .filter((vendor) =>
        selectedVendors ? selectedVendors.has(vendor.name) : true,
      )
      .flatMap((vendor) => vendor.models);
    const unique = Array.from(new Set(models)).sort();
    return unique.map((model) => ({ label: model, value: model }));
  }, [filtersData, selectedVendor]);

  const teamOptions = useMemo(() => {
    if (!filtersData) return [];
    const selectedUnits = selectedDepartment.length
      ? selectedDepartment
      : filtersData.businessUnits.map((unit) => unit.name);

    const teams = new Set<string>();
    selectedUnits.forEach((unitName) => {
      const unit = filtersData.businessUnits.find((entry) => entry.name === unitName);
      unit?.teams.forEach((team) => teams.add(team));
    });

    return Array.from(teams)
      .sort()
      .map((team) => ({ label: team, value: team }));
  }, [filtersData, selectedDepartment]);

  const subTeamOptions = useMemo(() => [], []);

  const phaseOptions = useMemo(
    () =>
      filtersData?.phases.map((phase) => ({
        label: phase,
        value: phase,
      })) ?? [],
    [filtersData],
  );

  const filterConfigs = useMemo<GalleryFilterConfig[]>(() => {
    const baseClassName = "h-8 gap-2 border-dashed bg-white px-3";
    const icon = <PlusCircle className="h-4 w-4 text-muted-foreground" />;
    return [
      {
        id: "phase",
        options: phaseOptions,
        value: selectedPhase,
        onChange: setSelectedPhase,
        placeholder: "Phase",
        className: baseClassName,
        icon,
      },
      {
        id: "status",
        multiple: true,
        options: statusOptions,
        value: selectedStatuses,
        onChange: setSelectedStatuses,
        placeholder: "Status",
        className: baseClassName,
        icon,
      },
      {
        id: "vendor",
        multiple: true,
        options: vendorOptions,
        value: selectedVendor,
        onChange: setSelectedVendor,
        placeholder: "Vendor Names",
        className: baseClassName,
        icon,
      },
      {
        id: "ai-model",
        multiple: true,
        options: aiModelOptions,
        value: selectedAiModels,
        onChange: setSelectedAiModels,
        placeholder: "AI Models",
        className: baseClassName,
        icon,
      },
      {
        id: "personas",
        multiple: true,
        options: personaOptions,
        value: selectedPersonas,
        onChange: setSelectedPersonas,
        placeholder: "Target Personas",
        className: baseClassName,
        icon,
      },
      {
        id: "themes",
        multiple: true,
        options: themeOptions,
        value: selectedAiThemes,
        onChange: setSelectedAiThemes,
        placeholder: "AI Themes",
        className: baseClassName,
        icon,
      },
      {
        id: "business-unit",
        multiple: true,
        options: departmentOptions,
        value: selectedDepartment,
        onChange: setSelectedDepartment,
        placeholder: "Business Unit",
        className: baseClassName,
        icon,
      },
      {
        id: "team",
        multiple: true,
        options: teamOptions,
        value: selectedTeams,
        onChange: setSelectedTeams,
        placeholder: "Team Name",
        className: baseClassName,
        icon,
        showBadges: false,
      },
      {
        id: "sub-team",
        multiple: true,
        options: subTeamOptions,
        value: selectedSubTeams,
        onChange: setSelectedSubTeams,
        placeholder: "Sub-team Name",
        className: baseClassName,
        icon,
        showBadges: false,
      },
    ];
  }, [
    aiModelOptions,
    departmentOptions,
    personaOptions,
    phaseOptions,
    selectedAiModels,
    selectedAiThemes,
    selectedDepartment,
    selectedPersonas,
    selectedPhase,
    selectedStatuses,
    selectedSubTeams,
    selectedTeams,
    selectedVendor,
    statusOptions,
    subTeamOptions,
    teamOptions,
    themeOptions,
    vendorOptions,
  ]);

  const handleReset = () => {
    setSearchUseCase("");
    setSelectedDepartment([]);
    setSelectedPersonas([]);
    setSelectedAiThemes([]);
    setSelectedVendor([]);
    setSelectedPhase("");
    setSelectedTeams([]);
    setSelectedSubTeams([]);
    setSelectedStatuses([]);
    setSelectedAiModels([]);
  };

  const handleExplore = (useCase: { id: number }) => {
    navigate(`/gallery/${useCase.id}`, { state: { useCase } });
  };

  const showReset = Boolean(
    searchUseCase ||
      selectedDepartment.length ||
      selectedPhase ||
      selectedPersonas.length ||
      selectedAiThemes.length ||
      selectedVendor.length ||
      selectedTeams.length ||
      selectedSubTeams.length ||
      selectedStatuses.length ||
      selectedAiModels.length,
  );

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 w-full">
      <div className="w-full">
        <SectionCards />
      </div>

      <GallerySearch
        activeTab={activeTab}
        value={searchUseCase}
        onChange={setSearchUseCase}
        onTabChange={setActiveTab}
      />

      <GalleryFilters
        filters={filterConfigs}
        onReset={handleReset}
        showReset={showReset}
      />

      <GalleryResults
        isLoading={isLoading}
        useCases={useCases.items}
        onReset={handleReset}
        onExplore={handleExplore}
        onSubmitNew={() => navigate("/submit-use-case")}
      />
    </div>
  );
};

export default AIGallery;
