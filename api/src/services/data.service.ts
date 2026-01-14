import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import * as fs from "fs";
import * as path from "path";

export interface UseCase {
  BusinessUnit: string;
  UseCase: string;
  Headlines: string;
  Opportunity: string;
  Evidence: string;
  BusinessValue: string;
  AITheme: string;
  PrimaryContact: string;
  TargetPersonas: string;
  Phase: string;
  Status: string;
  VendorName: string;
  ModelName: string;
  InformationLink: string;
  Created: string;
  "Created By": string;
  Priority: string;
  TeamName: string;
  SubTeamName: string;
  ID: string;
  Modified: string;
  "Modified By": string;
  "AI Product Checklist": string;
  "ESE Resources Needed": string;
  RespondedBy: string;
}

interface PhaseMapping {
  Phase: string;
  "Phase Stage": string;
  Environment: string;
}

interface StatusMapping {
  "Status Name": string;
  "Status Color": string;
  "Status Definitions": string;
}

interface BusinessUnitMapping {
  "Business Unit Name": string;
  "Team Name": string;
  "Sub Team Name": string;
}

interface PersonaMapping {
  "Persona Name": string;
  "Role Definition": string;
  "Example Roles": string;
  ID: string;
}

interface AIThemeMapping {
  "Theme Name": string;
  "Theme Definition": string;
  "Theme Example": string;
  ID: string;
}

interface VendorModelMapping {
  VendorName: string;
  ProductName: string;
}

class DataService {
  private useCases: UseCase[] = [];
  private phaseMapping: PhaseMapping[] = [];
  private statusMapping: StatusMapping[] = [];
  private businessUnitMapping: BusinessUnitMapping[] = [];
  private personaMapping: PersonaMapping[] = [];
  private aiThemeMapping: AIThemeMapping[] = [];
  private vendorModelMapping: VendorModelMapping[] = [];
  private dataLoaded = false;

  private loadMappings(): void {
    const apiRoot = path.resolve(__dirname, "..", "..");
    
    try {
      // Load PhaseMapping.csv
      const phaseMappingPath = path.resolve(apiRoot, "data", "PhaseMapping.csv");
      const phaseMappingContent = fs.readFileSync(phaseMappingPath, "utf-8").replace(/^\uFEFF/, ""); // Remove BOM
      const parsed = parse(phaseMappingContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      }) as any[];
      
      // Clean up column names and values
      this.phaseMapping = parsed.map((row) => {
        // Get values by trying different key formats
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            if (row[key] !== undefined) {
              return String(row[key]).trim().replace(/^["']|["']$/g, "");
            }
          }
          return "";
        };
        
        return {
          Phase: getValue(["Phase", '"Phase"', "Phase"]),
          "Phase Stage": getValue(["Phase Stage", '"Phase Stage"', "Phase Stage"]),
          Environment: getValue(["Environment", '"Environment"', "Environment"]),
        };
      }).filter(m => m.Phase) as PhaseMapping[];
    } catch (error) {
      console.error("Error loading PhaseMapping.csv:", error);
    }

    try {
      // Load StatusMapping.csv
      const statusMappingPath = path.resolve(apiRoot, "data", "StatusMapping.csv");
      const statusMappingContent = fs.readFileSync(statusMappingPath, "utf-8").replace(/^\uFEFF/, ""); // Remove BOM
      const parsed = parse(statusMappingContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      }) as any[];
      
      // Clean up column names and values
      this.statusMapping = parsed.map((row) => {
        // Get values by trying different key formats
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            if (row[key] !== undefined) {
              return String(row[key]).trim().replace(/^["']|["']$/g, "");
            }
          }
          // Try to find key that contains the search term
          const foundKey = Object.keys(row).find(k => 
            keys.some(searchKey => k.toLowerCase().includes(searchKey.toLowerCase().replace(/["']/g, "")))
          );
          if (foundKey) {
            return String(row[foundKey]).trim().replace(/^["']|["']$/g, "");
          }
          return "";
        };
        
        return {
          "Status Name": getValue(["Status Name", '"Status Name"', "Status Name"]),
          "Status Color": getValue(["Status Color", '"Status Color"', "Status Color"]),
          "Status Definitions": getValue(["Status Definitions", '"Status Definitions"', "Status Definitions"]),
        };
      }).filter(m => m["Status Name"]) as StatusMapping[];
    } catch (error) {
      console.error("Error loading StatusMapping.csv:", error);
    }

    try {
      // Load BusinessUnitMapping.csv
      const businessUnitMappingPath = path.resolve(apiRoot, "data", "BusinessUnitMapping.csv");
      const businessUnitMappingContent = fs.readFileSync(businessUnitMappingPath, "utf-8").replace(/^\uFEFF/, "");
      const parsed = parse(businessUnitMappingContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      }) as any[];
      
      this.businessUnitMapping = parsed.map((row) => {
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            if (row[key] !== undefined) {
              return String(row[key]).trim().replace(/^["']|["']$/g, "");
            }
          }
          const foundKey = Object.keys(row).find(k => 
            keys.some(searchKey => k.toLowerCase().includes(searchKey.toLowerCase().replace(/["']/g, "")))
          );
          if (foundKey) {
            return String(row[foundKey]).trim().replace(/^["']|["']$/g, "");
          }
          return "";
        };
        
        return {
          "Business Unit Name": getValue(["Business Unit Name", '"Business Unit Name"', "Business Unit Name"]),
          "Team Name": getValue(["Team Name", '"Team Name"', "Team Name"]),
          "Sub Team Name": getValue(["Sub Team Name", '"Sub Team Name"', "Sub Team Name"]),
        };
      }).filter(m => m["Business Unit Name"]) as BusinessUnitMapping[];
    } catch (error) {
      console.error("Error loading BusinessUnitMapping.csv:", error);
    }

    try {
      // Load PersonaMapping.csv
      const personaMappingPath = path.resolve(apiRoot, "data", "PersonaMapping.csv");
      const personaMappingContent = fs.readFileSync(personaMappingPath, "utf-8").replace(/^\uFEFF/, "");
      const parsed = parse(personaMappingContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      }) as any[];
      
      this.personaMapping = parsed.map((row) => {
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            if (row[key] !== undefined) {
              return String(row[key]).trim().replace(/^["']|["']$/g, "");
            }
          }
          const foundKey = Object.keys(row).find(k => 
            keys.some(searchKey => k.toLowerCase().includes(searchKey.toLowerCase().replace(/["']/g, "")))
          );
          if (foundKey) {
            return String(row[foundKey]).trim().replace(/^["']|["']$/g, "");
          }
          return "";
        };
        
        return {
          "Persona Name": getValue(["Persona Name", '"Persona Name"', "Persona Name"]),
          "Role Definition": getValue(["Role Definition", '"Role Definition"', "Role Definition"]),
          "Example Roles": getValue(["Example Roles", '"Example Roles"', "Example Roles"]),
          ID: getValue(["ID", '"ID"', "ID"]),
        };
      }).filter(m => m["Persona Name"]) as PersonaMapping[];
    } catch (error) {
      console.error("Error loading PersonaMapping.csv:", error);
    }

    try {
      // Load AIThemeMapping.csv
      const aiThemeMappingPath = path.resolve(apiRoot, "data", "AIThemeMapping.csv");
      const aiThemeMappingContent = fs.readFileSync(aiThemeMappingPath, "utf-8").replace(/^\uFEFF/, "");
      const parsed = parse(aiThemeMappingContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      }) as any[];
      
      this.aiThemeMapping = parsed.map((row) => {
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            if (row[key] !== undefined) {
              return String(row[key]).trim().replace(/^["']|["']$/g, "");
            }
          }
          const foundKey = Object.keys(row).find(k => 
            keys.some(searchKey => k.toLowerCase().includes(searchKey.toLowerCase().replace(/["']/g, "")))
          );
          if (foundKey) {
            return String(row[foundKey]).trim().replace(/^["']|["']$/g, "");
          }
          return "";
        };
        
        return {
          "Theme Name": getValue(["Theme Name", '"Theme Name"', "Theme Name"]),
          "Theme Definition": getValue(["Theme Definition", '"Theme Definition"', "Theme Definition"]),
          "Theme Example": getValue(["Theme Example", '"Theme Example"', "Theme Example"]),
          ID: getValue(["ID", '"ID"', "ID"]),
        };
      }).filter(m => m["Theme Name"]) as AIThemeMapping[];
    } catch (error) {
      console.error("Error loading AIThemeMapping.csv:", error);
    }

    try {
      // Load VendorModelMapping.csv
      const vendorModelMappingPath = path.resolve(apiRoot, "data", "VendorModelMapping.csv");
      const vendorModelMappingContent = fs.readFileSync(vendorModelMappingPath, "utf-8").replace(/^\uFEFF/, "");
      const parsed = parse(vendorModelMappingContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      }) as any[];
      
      this.vendorModelMapping = parsed.map((row) => {
        const getValue = (keys: string[]) => {
          for (const key of keys) {
            if (row[key] !== undefined) {
              return String(row[key]).trim().replace(/^["']|["']$/g, "");
            }
          }
          const foundKey = Object.keys(row).find(k => 
            keys.some(searchKey => k.toLowerCase().includes(searchKey.toLowerCase().replace(/["']/g, "")))
          );
          if (foundKey) {
            return String(row[foundKey]).trim().replace(/^["']|["']$/g, "");
          }
          return "";
        };
        
        return {
          VendorName: getValue(["VendorName", '"VendorName"', "VendorName"]),
          ProductName: getValue(["ProductName", '"ProductName"', "ProductName"]),
        };
      }).filter(m => m.VendorName && m.ProductName) as VendorModelMapping[];
    } catch (error) {
      console.error("Error loading VendorModelMapping.csv:", error);
    }
  }

  private loadData(): void {
    if (this.dataLoaded) return;

    try {
      // Load mappings first
      this.loadMappings();

      // Resolve path relative to app/api directory (backend root)
      const apiRoot = path.resolve(__dirname, "..", "..");
      const csvPath = path.resolve(apiRoot, "data", "UseCases.csv");
      const fileContent = fs.readFileSync(csvPath, "utf-8");
      
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
      });

      this.useCases = records as UseCase[];
      this.dataLoaded = true;
    } catch (error) {
      console.error("Error loading CSV data:", error);
      throw new Error("Failed to load use cases data");
    }
  }

  getAllUseCases(): UseCase[] {
    this.loadData();
    return this.useCases;
  }

  getUseCaseById(id: string): UseCase | undefined {
    this.loadData();
    return this.useCases.find((uc) => uc.ID === id);
  }

  getUseCasesByStatus(status: string): UseCase[] {
    this.loadData();
    return this.useCases.filter((uc) => uc.Status === status);
  }

  getUseCasesByPhase(phase: string): UseCase[] {
    this.loadData();
    return this.useCases.filter((uc) => uc.Phase === phase);
  }

  getUseCasesByBusinessUnit(businessUnit: string): UseCase[] {
    this.loadData();
    return this.useCases.filter((uc) => uc.BusinessUnit === businessUnit);
  }

  getUseCasesByPriority(priority: string): UseCase[] {
    this.loadData();
    return this.useCases.filter((uc) => uc.Priority === priority);
  }

  getStatusDistribution(): Record<string, number> {
    this.loadData();
    const distribution: Record<string, number> = {};
    
    // Count all statuses from use cases
    this.useCases.forEach((uc) => {
      const status = (uc.Status || "").trim();
      if (status) {
        distribution[status] = (distribution[status] || 0) + 1;
      }
    });
    
    // If we have status mapping, ensure all mapped statuses are included (even if 0)
    if (this.statusMapping.length > 0) {
      this.statusMapping.forEach((status) => {
        const statusName = status["Status Name"]?.trim() || "";
        if (statusName && distribution[statusName] === undefined) {
          distribution[statusName] = 0;
        }
      });
    }
    
    return distribution;
  }

  getPhaseDistribution(): Record<string, number> {
    this.loadData();
    const distribution: Record<string, number> = {};
    
    // Count all phases from use cases
    this.useCases.forEach((uc) => {
      const phase = (uc.Phase || "").trim();
      if (phase) {
        distribution[phase] = (distribution[phase] || 0) + 1;
      }
    });
    
    // If we have phase mapping, ensure all mapped phases are included (even if 0)
    if (this.phaseMapping.length > 0) {
      this.phaseMapping.forEach((phase) => {
        const phaseName = phase.Phase?.trim() || "";
        if (phaseName && distribution[phaseName] === undefined) {
          distribution[phaseName] = 0;
        }
      });
    }
    
    return distribution;
  }

  getBusinessUnitDistribution(): Record<string, number> {
    this.loadData();
    const distribution: Record<string, number> = {};
    this.useCases.forEach((uc) => {
      const bu = uc.BusinessUnit || "Unknown";
      distribution[bu] = (distribution[bu] || 0) + 1;
    });
    return distribution;
  }

  getPriorityDistribution(): Record<string, number> {
    this.loadData();
    const distribution: Record<string, number> = {};
    
    // Priority format: either "Not a Priority" or "FY<yy>Q<1-4>" (e.g., "FY26Q4", "FY25Q1")
    const fyQuarterPattern = /^FY\d{2}Q[1-4]$/i;
    
    this.useCases.forEach((uc) => {
      const priority = uc.Priority?.trim() || "";
      
      if (!priority || priority === "Unknown" || priority === "") {
        distribution["Not a Priority"] = (distribution["Not a Priority"] || 0) + 1;
      } else if (priority === "Not a Priority") {
        distribution["Not a Priority"] = (distribution["Not a Priority"] || 0) + 1;
      } else if (fyQuarterPattern.test(priority)) {
        // Group by FY/Quarter format (e.g., FY26Q4, FY25Q1)
        distribution[priority] = (distribution[priority] || 0) + 1;
      } else {
        // Unknown priority format, keep as is
        distribution[priority] = (distribution[priority] || 0) + 1;
      }
    });
    
    return distribution;
  }

  getPhaseMapping(): PhaseMapping[] {
    this.loadData();
    return this.phaseMapping;
  }

  getStatusMapping(): StatusMapping[] {
    this.loadData();
    return this.statusMapping;
  }

  getBusinessUnitMapping(): BusinessUnitMapping[] {
    this.loadData();
    return this.businessUnitMapping;
  }

  getPersonaMapping(): PersonaMapping[] {
    this.loadData();
    return this.personaMapping;
  }

  getAIThemeMapping(): AIThemeMapping[] {
    this.loadData();
    return this.aiThemeMapping;
  }

  getVendorModelMapping(): VendorModelMapping[] {
    this.loadMappings();
    return this.vendorModelMapping;
  }

  getVendors(): string[] {
    this.loadMappings();
    return Array.from(new Set(this.vendorModelMapping.map(vm => vm.VendorName))).sort();
  }

  getModelsByVendor(vendorName: string): string[] {
    this.loadMappings();
    return this.vendorModelMapping
      .filter(vm => vm.VendorName === vendorName)
      .map(vm => vm.ProductName)
      .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      .sort();
  }

  getTeamNamesByBusinessUnit(businessUnit: string): string[] {
    this.loadMappings();
    return Array.from(
      new Set(
        this.businessUnitMapping
          .filter(bu => bu["Business Unit Name"] === businessUnit)
          .map(bu => bu["Team Name"])
          .filter(Boolean)
      )
    ).sort();
  }

  getSubTeamNamesByTeamName(teamName: string): string[] {
    this.loadMappings();
    return Array.from(
      new Set(
        this.businessUnitMapping
          .filter(bu => bu["Team Name"] === teamName)
          .map(bu => bu["Sub Team Name"])
          .filter(Boolean)
      )
    ).sort();
  }

  /**
   * Get business units with nested teams and sub-teams
   */
  getBusinessUnitsWithTeams(): Array<{
    name: string;
    teams: Array<{
      name: string;
      subTeams: string[];
    }>;
  }> {
    this.loadMappings();
    
    const businessUnitsMap = new Map<string, Map<string, Set<string>>>();
    
    // Build nested structure
    this.businessUnitMapping.forEach((mapping) => {
      const buName = mapping["Business Unit Name"];
      const teamName = mapping["Team Name"] || "";
      const subTeamName = mapping["Sub Team Name"] || "";
      
      if (!buName) return;
      
      if (!businessUnitsMap.has(buName)) {
        businessUnitsMap.set(buName, new Map());
      }
      
      const teamsMap = businessUnitsMap.get(buName)!;
      
      if (teamName) {
        if (!teamsMap.has(teamName)) {
          teamsMap.set(teamName, new Set());
        }
        
        if (subTeamName) {
          teamsMap.get(teamName)!.add(subTeamName);
        }
      }
    });
    
    // Convert to array structure
    return Array.from(businessUnitsMap.entries())
      .map(([buName, teamsMap]) => ({
        name: buName,
        teams: Array.from(teamsMap.entries())
          .map(([teamName, subTeamsSet]) => ({
            name: teamName,
            subTeams: Array.from(subTeamsSet).sort(),
          }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Get vendors with nested models/products
   */
  getVendorsWithModels(): Array<{
    name: string;
    models: string[];
  }> {
    this.loadMappings();
    
    const vendorsMap = new Map<string, Set<string>>();
    
    // Build nested structure
    this.vendorModelMapping.forEach((mapping) => {
      const vendorName = mapping.VendorName;
      const productName = mapping.ProductName;
      
      if (!vendorName || !productName) return;
      
      if (!vendorsMap.has(vendorName)) {
        vendorsMap.set(vendorName, new Set());
      }
      
      vendorsMap.get(vendorName)!.add(productName);
    });
    
    // Convert to array structure
    return Array.from(vendorsMap.entries())
      .map(([vendorName, modelsSet]) => ({
        name: vendorName,
        models: Array.from(modelsSet).sort(),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  getAIThemeDistribution(): Record<string, number> {
    this.loadData();
    const distribution: Record<string, number> = {};
    this.useCases.forEach((uc) => {
      if (uc.AITheme) {
        const themes = uc.AITheme.split(",").map((t) => t.trim());
        themes.forEach((theme) => {
          distribution[theme] = (distribution[theme] || 0) + 1;
        });
      }
    });
    return distribution;
  }

  getVendorDistribution(): Record<string, number> {
    this.loadData();
    const distribution: Record<string, number> = {};
    this.useCases.forEach((uc) => {
      const vendor = uc.VendorName || "No Vendor Identified";
      distribution[vendor] = (distribution[vendor] || 0) + 1;
    });
    return distribution;
  }

  getTimelineData(): Array<{ date: string; count: number }> {
    this.loadData();
    const timeline: Record<string, number> = {};
    
    this.useCases.forEach((uc) => {
      if (uc.Created) {
        try {
          const date = new Date(uc.Created);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          timeline[monthKey] = (timeline[monthKey] || 0) + 1;
        } catch (error) {
          // Skip invalid dates
        }
      }
    });

    return Object.entries(timeline)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getFilteredUseCases(filters: {
    status?: string;
    phase?: string;
    businessUnit?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): { data: UseCase[]; total: number; page: number; limit: number } {
    this.loadData();
    let filtered = [...this.useCases];

    if (filters.status) {
      filtered = filtered.filter((uc) => uc.Status === filters.status);
    }

    if (filters.phase) {
      filtered = filtered.filter((uc) => uc.Phase === filters.phase);
    }

    if (filters.businessUnit) {
      filtered = filtered.filter((uc) => uc.BusinessUnit === filters.businessUnit);
    }

    if (filters.priority) {
      filtered = filtered.filter((uc) => uc.Priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (uc) =>
          uc.UseCase?.toLowerCase().includes(searchLower) ||
          uc.Headlines?.toLowerCase().includes(searchLower) ||
          uc.BusinessUnit?.toLowerCase().includes(searchLower) ||
          uc.PrimaryContact?.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: filtered.slice(startIndex, endIndex),
      total,
      page,
      limit,
    };
  }

  /**
   * Get use cases filtered by PrimaryContact matching the user's name
   * Matches user's first name, last name, or full name with PrimaryContact
   */
  getMyUseCases(userName: string, filters?: {
    status?: string;
    phase?: string;
    businessUnit?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): { data: UseCase[]; total: number; page: number; limit: number } {
    this.loadData();
    
    if (!userName || userName.trim() === "") {
      return { data: [], total: 0, page: filters?.page || 1, limit: filters?.limit || 10 };
    }

    // Normalize the user's name for matching
    const normalizedUserName = userName.trim().toLowerCase();
    const nameParts = normalizedUserName.split(/\s+/).filter(part => part.length > 0);
    
    // Filter use cases where PrimaryContact matches the user's name
    let filtered = this.useCases.filter((uc) => {
      const primaryContact = (uc.PrimaryContact || "").trim().toLowerCase();
      
      if (!primaryContact) {
        return false;
      }

      // Check if full name matches
      if (primaryContact === normalizedUserName) {
        return true;
      }

      // Check if any name part matches (handles "First Last" vs "Last, First" formats)
      return nameParts.some(part => {
        // Match if the part is a significant word (at least 2 characters) in PrimaryContact
        if (part.length >= 2) {
          // Match whole words to avoid partial matches
          const wordBoundaryRegex = new RegExp(`\\b${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
          return wordBoundaryRegex.test(primaryContact);
        }
        return false;
      });
    });

    // Apply additional filters if provided
    if (filters?.status) {
      filtered = filtered.filter((uc) => uc.Status === filters.status);
    }

    if (filters?.phase) {
      filtered = filtered.filter((uc) => uc.Phase === filters.phase);
    }

    if (filters?.businessUnit) {
      filtered = filtered.filter((uc) => uc.BusinessUnit === filters.businessUnit);
    }

    if (filters?.priority) {
      filtered = filtered.filter((uc) => uc.Priority === filters.priority);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (uc) =>
          uc.UseCase?.toLowerCase().includes(searchLower) ||
          uc.Headlines?.toLowerCase().includes(searchLower) ||
          uc.BusinessUnit?.toLowerCase().includes(searchLower) ||
          uc.PrimaryContact?.toLowerCase().includes(searchLower)
      );
    }

    const total = filtered.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
      data: filtered.slice(startIndex, endIndex),
      total,
      page,
      limit,
    };
  }

  /**
   * Create a new use case and append it to the CSV file
   */
  createUseCase(useCaseData: Partial<UseCase>, createdBy: string): UseCase {
    this.loadData();

    // Generate a new ID (find the highest ID and increment)
    const maxId = Math.max(
      ...this.useCases.map((uc) => {
        const idNum = parseInt(uc.ID || "0", 10);
        return isNaN(idNum) ? 0 : idNum;
      }),
      0
    );
    const newId = String(maxId + 1);

    // Get current timestamp
    const now = new Date();
    const timestamp = now.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Create the new use case with defaults
    const newUseCase: UseCase = {
      BusinessUnit: useCaseData.BusinessUnit || "",
      UseCase: useCaseData.UseCase || "",
      Headlines: useCaseData.Headlines || "",
      Opportunity: useCaseData.Opportunity || "",
      Evidence: useCaseData.Evidence || "",
      BusinessValue: useCaseData.BusinessValue || "",
      AITheme: useCaseData.AITheme || "",
      PrimaryContact: useCaseData.PrimaryContact || createdBy,
      TargetPersonas: useCaseData.TargetPersonas || "",
      Phase: useCaseData.Phase || "Idea",
      Status: useCaseData.Status || "Not Started",
      VendorName: useCaseData.VendorName || "",
      ModelName: useCaseData.ModelName || "",
      InformationLink: useCaseData.InformationLink || "",
      Created: timestamp,
      "Created By": createdBy,
      Priority: useCaseData.Priority || "Not a Priority",
      TeamName: useCaseData.TeamName || "",
      SubTeamName: useCaseData.SubTeamName || "",
      ID: newId,
      Modified: timestamp,
      "Modified By": createdBy,
      "AI Product Checklist": useCaseData["AI Product Checklist"] || "False",
      "ESE Resources Needed": useCaseData["ESE Resources Needed"] || "False",
      RespondedBy: useCaseData.RespondedBy || "",
    };

    // Add to in-memory array
    this.useCases.push(newUseCase);

    // Write to CSV file
    try {
      const apiRoot = path.resolve(__dirname, "..", "..");
      const csvPath = path.resolve(apiRoot, "data", "UseCases.csv");

      // Read existing CSV to get headers
      const fileContent = fs.readFileSync(csvPath, "utf-8");
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true,
      });

      // Add new record
      records.push(newUseCase);

      // Define CSV columns in the correct order
      const columns = [
        "BusinessUnit",
        "UseCase",
        "Headlines",
        "Opportunity",
        "Evidence",
        "BusinessValue",
        "AITheme",
        "PrimaryContact",
        "TargetPersonas",
        "Phase",
        "Status",
        "VendorName",
        "ModelName",
        "InformationLink",
        "Created",
        "Created By",
        "Priority",
        "TeamName",
        "SubTeamName",
        "ID",
        "Modified",
        "Modified By",
        "AI Product Checklist",
        "ESE Resources Needed",
        "RespondedBy",
      ];

      // Convert to CSV string
      const csvString = stringify(records, {
        header: true,
        columns,
        quoted: true,
        quoted_empty: true,
      });

      // Write back to file
      fs.writeFileSync(csvPath, csvString, "utf-8");

      // Reset data loaded flag to force reload on next access
      this.dataLoaded = false;

      return newUseCase;
    } catch (error) {
      console.error("Error writing use case to CSV:", error);
      throw new Error("Failed to save use case");
    }
  }

  /**
   * Update an existing use case in the CSV file
   */
  updateUseCase(id: string, useCaseData: Partial<UseCase>, modifiedBy: string): UseCase | null {
    this.loadData();

    // Find the use case to update
    const useCaseIndex = this.useCases.findIndex((uc) => uc.ID === id);
    if (useCaseIndex === -1) {
      return null;
    }

    const existingUseCase = this.useCases[useCaseIndex]!; // Non-null assertion: we've verified the index exists

    // Get current timestamp
    const now = new Date();
    const timestamp = now.toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Update the use case with new data, preserving existing values if not provided
    const updatedUseCase: UseCase = {
      BusinessUnit: useCaseData.BusinessUnit ?? existingUseCase.BusinessUnit,
      UseCase: useCaseData.UseCase ?? existingUseCase.UseCase,
      Headlines: useCaseData.Headlines ?? existingUseCase.Headlines,
      Opportunity: useCaseData.Opportunity ?? existingUseCase.Opportunity,
      Evidence: useCaseData.Evidence ?? existingUseCase.Evidence,
      BusinessValue: useCaseData.BusinessValue ?? existingUseCase.BusinessValue,
      AITheme: useCaseData.AITheme ?? existingUseCase.AITheme,
      PrimaryContact: useCaseData.PrimaryContact ?? existingUseCase.PrimaryContact,
      TargetPersonas: useCaseData.TargetPersonas ?? existingUseCase.TargetPersonas,
      Phase: useCaseData.Phase ?? existingUseCase.Phase,
      Status: useCaseData.Status ?? existingUseCase.Status,
      VendorName: useCaseData.VendorName ?? existingUseCase.VendorName,
      ModelName: useCaseData.ModelName ?? existingUseCase.ModelName,
      InformationLink: useCaseData.InformationLink ?? existingUseCase.InformationLink,
      Created: existingUseCase.Created,
      "Created By": existingUseCase["Created By"],
      Priority: useCaseData.Priority ?? existingUseCase.Priority,
      TeamName: useCaseData.TeamName ?? existingUseCase.TeamName,
      SubTeamName: useCaseData.SubTeamName ?? existingUseCase.SubTeamName,
      ID: id, // Ensure ID cannot be changed
      Modified: timestamp,
      "Modified By": modifiedBy,
      "AI Product Checklist": useCaseData["AI Product Checklist"] ?? existingUseCase["AI Product Checklist"],
      "ESE Resources Needed": useCaseData["ESE Resources Needed"] ?? existingUseCase["ESE Resources Needed"],
      RespondedBy: useCaseData.RespondedBy ?? existingUseCase.RespondedBy,
    };

    // Update in-memory array
    this.useCases[useCaseIndex] = updatedUseCase;

    // Write to CSV file
    try {
      const apiRoot = path.resolve(__dirname, "..", "..");
      const csvPath = path.resolve(apiRoot, "data", "UseCases.csv");

      // Define CSV columns in the correct order
      const columns = [
        "BusinessUnit",
        "UseCase",
        "Headlines",
        "Opportunity",
        "Evidence",
        "BusinessValue",
        "AITheme",
        "PrimaryContact",
        "TargetPersonas",
        "Phase",
        "Status",
        "VendorName",
        "ModelName",
        "InformationLink",
        "Created",
        "Created By",
        "Priority",
        "TeamName",
        "SubTeamName",
        "ID",
        "Modified",
        "Modified By",
        "AI Product Checklist",
        "ESE Resources Needed",
        "RespondedBy",
      ];

      // Convert to CSV string
      const csvString = stringify(this.useCases, {
        header: true,
        columns,
        quoted: true,
        quoted_empty: true,
      });

      // Write back to file
      fs.writeFileSync(csvPath, csvString, "utf-8");

      // Reset data loaded flag to force reload on next access
      this.dataLoaded = false;

      return updatedUseCase;
    } catch (error) {
      console.error("Error updating use case in CSV:", error);
      throw new Error("Failed to update use case");
    }
  }

  /**
   * Delete a use case from the CSV file
   */
  deleteUseCase(id: string): boolean {
    this.loadData();

    // Find the use case to delete
    const useCaseIndex = this.useCases.findIndex((uc) => uc.ID === id);
    if (useCaseIndex === -1) {
      return false;
    }

    // Remove from in-memory array
    this.useCases.splice(useCaseIndex, 1);

    // Write to CSV file
    try {
      const apiRoot = path.resolve(__dirname, "..", "..");
      const csvPath = path.resolve(apiRoot, "data", "UseCases.csv");

      // Define CSV columns in the correct order
      const columns = [
        "BusinessUnit",
        "UseCase",
        "Headlines",
        "Opportunity",
        "Evidence",
        "BusinessValue",
        "AITheme",
        "PrimaryContact",
        "TargetPersonas",
        "Phase",
        "Status",
        "VendorName",
        "ModelName",
        "InformationLink",
        "Created",
        "Created By",
        "Priority",
        "TeamName",
        "SubTeamName",
        "ID",
        "Modified",
        "Modified By",
        "AI Product Checklist",
        "ESE Resources Needed",
        "RespondedBy",
      ];

      // Convert to CSV string
      const csvString = stringify(this.useCases, {
        header: true,
        columns,
        quoted: true,
        quoted_empty: true,
      });

      // Write back to file
      fs.writeFileSync(csvPath, csvString, "utf-8");

      // Reset data loaded flag to force reload on next access
      this.dataLoaded = false;

      return true;
    } catch (error) {
      console.error("Error deleting use case from CSV:", error);
      throw new Error("Failed to delete use case");
    }
  }
}

export default new DataService();

