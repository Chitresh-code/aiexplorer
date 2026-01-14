"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UseCase {
  ID: number
  UseCase: string
  AITheme: string
  Status: string
  Created: string
}

interface RecentUseCasesTableProps {
  useCases: UseCase[]
}

export function RecentUseCasesTable({ useCases }: RecentUseCasesTableProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'implemented':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'in progress':
      case 'testing':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'planning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'on track':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="px-6 py-4">
          <CardTitle>Recent Submissions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Latest activity across AI Hub
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Use Case</TableHead>
                  <TableHead className="hidden md:table-cell">AI Theme</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="w-[120px] text-right">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {useCases.map((useCase) => (
                  <TableRow key={useCase.ID}>
                    <TableCell className="font-medium">
                      <div className="max-w-[300px] truncate" title={useCase.UseCase}>
                        {useCase.UseCase}
                      </div>
                      <div className="text-sm text-muted-foreground md:hidden">
                        {useCase.AITheme}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {useCase.AITheme}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge
                        variant="outline"
                        className={`font-medium ${getStatusColor(useCase.Status)}`}
                      >
                        {useCase.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {formatDate(useCase.Created)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
